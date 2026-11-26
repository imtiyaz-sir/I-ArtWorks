// ═══════════════════════════════════════════════════════════════
// store.js — cart, wishlist and orders (LocalStorage-backed).
// This is the ONLY place that reads/writes those keys, so every
// page stays in sync. When the real backend arrives, replace the
// bodies of these methods with API calls and nothing else changes.
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  cart: 'iartwork',                // kept for backward compatibility
  wishlist: 'iartworks_wishlist',
  orders: 'orders',                // kept for backward compatibility
  commissions: 'commissions'
};

const Store = (function () {
  // Normalise any legacy shapes into a de-duplicated list of valid ids.
  function toIds(list) {
    const out = [];
    (Array.isArray(list) ? list : []).forEach(entry => {
      const id = Number(entry && typeof entry === 'object' ? entry.id : entry);
      if (Number.isFinite(id) && getArtwork(id) && !out.includes(id)) out.push(id);
    });
    return out;
  }

  function makeList(key) {
    return {
      ids() {
        const raw = getFromStorage(key, []);
        const clean = toIds(raw);
        // migrate legacy formats (duplicates / objects / stale ids) once
        if (JSON.stringify(raw) !== JSON.stringify(clean)) saveToStorage(key, clean);
        return clean;
      },
      items() { return this.ids().map(getArtwork).filter(Boolean); },
      has(id) { return this.ids().includes(Number(id)); },
      count() { return this.ids().length; },
      add(id) {
        id = Number(id);
        if (!getArtwork(id)) return false;
        const ids = this.ids();
        if (ids.includes(id)) return false;
        ids.push(id); saveToStorage(key, ids); Store.refreshBadges(); return true;
      },
      remove(id) {
        id = Number(id);
        const ids = this.ids();
        if (!ids.includes(id)) return false;
        saveToStorage(key, ids.filter(x => x !== id)); Store.refreshBadges(); return true;
      },
      clear() { saveToStorage(key, []); Store.refreshBadges(); },
      toggle(id) { return this.has(id) ? (this.remove(id), false) : (this.add(id), true); }
    };
  }

  const cart = makeList(STORAGE_KEYS.cart);
  const wishlist = makeList(STORAGE_KEYS.wishlist);

  // ── Pricing (single implementation used by cart + checkout) ──
  const PROMOS = {
    ART10:    { type: 'percentage', value: 10,  label: '10% off' },
    ART20:    { type: 'percentage', value: 20,  label: '20% off' },
    FIRSTBUY: { type: 'percentage', value: 15,  label: '15% off' },
    SAVE500:  { type: 'fixed',      value: 500, label: '₹500 off' },
    WELCOME:  { type: 'fixed',      value: 100, label: '₹100 off' },
    IMTIYAZ:  { type: 'fixed',      value: 700, label: '₹700 off' }
  };

  function pricing(items, promoCode) {
    const count = items.length;
    const totalMRP = items.reduce((s, a) => s + a.original_price, 0);
    const subtotal = items.reduce((s, a) => s + salePrice(a), 0);   // after per-item discounts
    const productDiscount = totalMRP - subtotal;
    let promoDiscount = 0;
    const promo = promoCode ? PROMOS[promoCode] : null;
    if (promo && count > 0) {
      promoDiscount = promo.type === 'percentage' ? Math.round(subtotal * promo.value / 100) : promo.value;
      promoDiscount = Math.min(promoDiscount, subtotal);            // never push total below the fee
    }
    const fee = count === 0 ? 0 : SITE_CONFIG.convenienceFee;
    const total = subtotal - promoDiscount + fee;
    return { count, totalMRP, productDiscount, subtotal, promoDiscount, fee, total };
  }

  // ── Orders ───────────────────────────────────────────────────
  const orders = {
    all() { const list = getFromStorage(STORAGE_KEYS.orders, []); return Array.isArray(list) ? list : []; },
    forUser(userId) {
      return this.all().filter(o => o.userId === userId).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    },
    get(orderNumber) { return this.all().find(o => o.orderNumber === orderNumber) || null; },
    add(order) { const list = this.all(); list.push(order); saveToStorage(STORAGE_KEYS.orders, list); return order; },
    update(orderNumber, patch) {
      const list = this.all(); const i = list.findIndex(o => o.orderNumber === orderNumber);
      if (i === -1) return null; list[i] = { ...list[i], ...patch }; saveToStorage(STORAGE_KEYS.orders, list); return list[i];
    },
    // Legacy orders stored whole artwork objects and no totals — normalise for display.
    totalOf(order) {
      if (typeof order.total === 'number') return order.total;
      const items = (order.items || []);
      const sub = items.reduce((s, a) => s + (a.price ?? (a.original_price ? salePrice(a) : 0)), 0);
      return Math.max(0, sub - (order.promoDiscount || 0)) + (items.length ? SITE_CONFIG.convenienceFee : 0);
    },
    nextNumber() {
      let n; do { n = 'AW-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 100000)).padStart(5, '0'); }
      while (this.get(n)); return n;
    }
  };

  // ── Commission requests ──────────────────────────────────────
  const commissions = {
    all() { const l = getFromStorage(STORAGE_KEYS.commissions, []); return Array.isArray(l) ? l : []; },
    add(entry) { const l = this.all(); l.push(entry); saveToStorage(STORAGE_KEYS.commissions, l); return entry; },
    forEmail(email) { const e = String(email || '').toLowerCase(); return this.all().filter(c => String(c.email || '').toLowerCase() === e); }
  };

  // ── Header badges ────────────────────────────────────────────
  function refreshBadges() {
    const c = cart.count(), w = wishlist.count();
    document.querySelectorAll('.bag-item-count').forEach(el => {
      el.textContent = c; el.style.visibility = c > 0 ? 'visible' : 'hidden'; el.classList.toggle('show', c > 0);
    });
    document.querySelectorAll('.wishlist-badge').forEach(el => {
      el.textContent = w; el.classList.toggle('show', w > 0); el.style.display = w > 0 ? '' : 'none';
    });
    document.querySelectorAll('[data-wish-id]').forEach(btn => {
      const on = wishlist.has(btn.dataset.wishId);
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
    });
    document.dispatchEvent(new CustomEvent('store:changed'));
  }

  // Keep tabs in sync.
  window.addEventListener('storage', e => { if (Object.values(STORAGE_KEYS).includes(e.key)) refreshBadges(); });

  return { cart, wishlist, orders, commissions, pricing, PROMOS, refreshBadges };
})();

// ── Friendly top-level actions (used by onclick handlers in generated HTML) ──
function addCart(id) {
  const art = getArtwork(id);
  if (!art) { showNotification('Sorry, that artwork could not be found.', 'error'); return false; }
  if (!art.in_stock) { showNotification('This artwork is currently sold out.', 'warning'); return false; }
  if (Store.cart.add(id)) { showNotification(`"${art.title}" added to your bag`, 'success'); return true; }
  showNotification('This artwork is already in your bag (each piece is one-of-a-kind).', 'info');
  return false;
}
function toggleWish(id, btn) {
  const art = getArtwork(id); if (!art) return;
  const added = Store.wishlist.toggle(id);
  showNotification(added ? `"${art.title}" saved to wishlist` : `"${art.title}" removed from wishlist`, added ? 'success' : 'info');
  if (btn) { btn.classList.toggle('active', added); btn.setAttribute('aria-pressed', added ? 'true' : 'false'); }
}
