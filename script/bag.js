// ═══════════════════════════════════════════════════════════════
// bag.js — shopping bag page: list, remove, clear, promo codes,
// recommendations, checkout (address → order → confirmation).
// All data goes through Store (store.js).
// ═══════════════════════════════════════════════════════════════

let appliedPromoCode = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.bag-page')) return;
  bindBagEvents();
  renderBag();
  document.addEventListener('store:changed', () => { /* other tab changed the cart */ renderBag(); });
});

function currentBagItems() { return Store.cart.items(); }

function renderBag() {
  const items = currentBagItems();
  renderBagItems(items);
  renderBagSummary(items);
  renderRecommendations(items);
}

// ── Items ────────────────────────────────────────────────────────
function renderBagItems(items) {
  const container = document.querySelector('.bag-Items-container');
  const emptyCart = document.getElementById('emptyCart');
  const itemCount = document.getElementById('itemCount');
  const clearBtn = document.getElementById('clearCartBtn');
  if (itemCount) itemCount.textContent = `(${items.length} ${items.length === 1 ? 'item' : 'items'})`;
  if (clearBtn) clearBtn.style.display = items.length ? 'inline-flex' : 'none';

  if (!items.length) {
    container.style.display = 'none';
    if (emptyCart) emptyCart.style.display = 'block';
    return;
  }
  container.style.display = 'flex';
  if (emptyCart) emptyCart.style.display = 'none';
  container.innerHTML = items.map(bagItemHTML).join('');
}

function bagItemHTML(art) {
  const price = salePrice(art);
  const link = `${pageUrl('pages/product-detail.html')}?id=${art.id}`;
  const wished = Store.wishlist.has(art.id);
  return `
  <div class="bag-item-container" data-id="${art.id}">
    <div class="item-left-part">
      <a href="${link}">${imgTag(art.image, art.title, 'bag-item-img')}</a>
    </div>
    <div class="item-right-part">
      <div class="company">${escapeHtml(art.artist)}</div>
      <div class="item-name"><a href="${link}">${escapeHtml(art.title)}</a></div>
      <div class="price-container">
        <span class="current-price">${formatCurrency(price)}</span>
        ${art.discount_percentage > 0 ? `<span class="orignal-price">${formatCurrency(art.original_price)}</span><span class="discount-percentage">(${art.discount_percentage}% OFF)</span>` : ''}
      </div>
      <div class="return-period"><i class="fa-solid fa-rotate-left"></i> <span class="return-period-day">${art.return_period} days return available</span></div>
      <div class="delivery-details"><i class="fa-solid fa-truck-fast"></i> Delivery by <span class="delivery-details-days">${deliveryDateFor(art)}</span></div>
      <button type="button" class="move-wish-btn" data-move-wish="${art.id}">
        <span class="material-symbols-outlined">favorite</span> ${wished ? 'Already in wishlist — remove from bag' : 'Move to wishlist'}
      </button>
    </div>
    <button type="button" class="remove-from-cart" data-remove="${art.id}" title="Remove item" aria-label="Remove ${escapeHtml(art.title)} from bag">×</button>
  </div>`;
}

// ── Summary ──────────────────────────────────────────────────────
function renderBagSummary(items) {
  const el = document.querySelector('.bag-summary'); if (!el) return;
  // promo is always re-computed against the CURRENT cart
  if (appliedPromoCode && !items.length) appliedPromoCode = null;
  const p = Store.pricing(items, appliedPromoCode);
  el.innerHTML = `
  <div class="bag-details-container">
    <div class="price-header">PRICE DETAILS (${p.count} ${p.count === 1 ? 'Item' : 'Items'})</div>
    <div class="price-item"><span class="price-item-tag">Total MRP</span><span class="price-item-value">${formatCurrency(p.totalMRP)}</span></div>
    <div class="price-item"><span class="price-item-tag">Discount on MRP</span><span class="price-item-value priceDetail-base-discount">-${formatCurrency(p.productDiscount)}</span></div>
    ${p.promoDiscount > 0 ? `
    <div class="price-item">
      <span class="price-item-tag">Promo (${escapeHtml(appliedPromoCode)}) <button type="button" class="promo-remove" data-remove-promo>Remove</button></span>
      <span class="price-item-value priceDetail-base-discount">-${formatCurrency(p.promoDiscount)}</span>
    </div>` : ''}
    <div class="price-item"><span class="price-item-tag">Convenience Fee</span><span class="price-item-value">${p.fee === 0 ? 'FREE' : formatCurrency(p.fee)}</span></div>
    <div class="price-footer"><span class="price-item-tag">Total Amount</span><span class="price-item-value" id="bagTotal">${formatCurrency(p.total)}</span></div>
    <button type="button" class="btn-place-order" data-checkout ${p.count === 0 ? 'disabled' : ''}><i class="fa-solid fa-check"></i> PLACE ORDER</button>
  </div>`;
}

// ── Recommendations ──────────────────────────────────────────────
function renderRecommendations(items) {
  const section = document.getElementById('recommendedSection');
  const grid = document.getElementById('recommendedGrid');
  if (!section || !grid) return;
  if (!items.length) { section.style.display = 'none'; return; }
  const inBag = items.map(a => a.id);
  const recs = artworks.filter(a => !inBag.includes(a.id) && a.in_stock)
    .sort((a, b) => b.rating - a.rating).slice(0, 4);
  if (!recs.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  grid.innerHTML = recs.map(a => `
    <div class="recommended-item">
      <a href="${pageUrl('pages/product-detail.html')}?id=${a.id}">${imgTag(a.image, a.title)}<h4>${escapeHtml(a.title)}</h4></a>
      <p class="price">${formatCurrency(salePrice(a))}</p>
      <button type="button" class="rec-add-btn" data-rec-add="${a.id}">Add to bag</button>
    </div>`).join('');
}

// ── Events ───────────────────────────────────────────────────────
function bindBagEvents() {
  document.addEventListener('click', e => {
    const remove = e.target.closest('[data-remove]');
    if (remove) { removeFromCart(Number(remove.dataset.remove)); return; }
    const move = e.target.closest('[data-move-wish]');
    if (move) { moveToWishlist(Number(move.dataset.moveWish)); return; }
    const rec = e.target.closest('[data-rec-add]');
    if (rec) { if (addCart(Number(rec.dataset.recAdd))) renderBag(); return; }
    if (e.target.closest('[data-remove-promo]')) { appliedPromoCode = null; renderBag(); showNotification('Promo code removed', 'info'); return; }
    if (e.target.closest('[data-checkout]')) { startCheckout(); return; }
  });
  const clearBtn = document.getElementById('clearCartBtn');
  if (clearBtn) clearBtn.addEventListener('click', handleClearCart);
  const applyBtn = document.getElementById('applyPromoBtn');
  if (applyBtn) applyBtn.addEventListener('click', applyPromoCode);
  const promoInput = document.getElementById('promoInput');
  if (promoInput) promoInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyPromoCode(); } });
}

function removeFromCart(id) {
  const art = getArtwork(id);
  if (Store.cart.remove(id)) { renderBag(); showNotification(`"${art ? art.title : 'Item'}" removed from bag`, 'info'); }
}
function moveToWishlist(id) {
  Store.wishlist.add(id); Store.cart.remove(id); renderBag();
  showNotification('Moved to your wishlist', 'success');
}
function handleClearCart() {
  if (!Store.cart.count()) return;
  if (!confirm('Are you sure you want to clear your bag?')) return;
  Store.cart.clear(); appliedPromoCode = null; renderBag();
  showNotification('Bag cleared', 'success');
}

function applyPromoCode() {
  const input = document.getElementById('promoInput');
  const code = input.value.trim().toUpperCase();
  if (!code) { showPromoMessage('Please enter a promo code', 'error'); return; }
  if (!Store.cart.count()) { showPromoMessage('Add an artwork to your bag first', 'error'); return; }
  if (!Store.PROMOS[code]) { showPromoMessage('Invalid promo code', 'error'); return; }
  appliedPromoCode = code;
  const p = Store.pricing(currentBagItems(), code);
  renderBagSummary(currentBagItems());
  showPromoMessage(`Promo code applied! You saved ${formatCurrency(p.promoDiscount)}`, 'success');
  input.value = '';
}
function showPromoMessage(message, type) {
  const el = document.getElementById('promoMessage'); if (!el) return;
  el.textContent = message; el.className = `promo-message ${type}`;
  clearTimeout(showPromoMessage._t);
  showPromoMessage._t = setTimeout(() => { el.textContent = ''; el.className = 'promo-message'; }, 3500);
}

// ── Checkout ─────────────────────────────────────────────────────
function startCheckout() {
  if (!Store.cart.count()) return;
  authManager.requireLogin(openAddressModal, 'Please sign in to place your order.');
}

function openAddressModal() {
  let modal = document.getElementById('checkoutModal');
  if (modal) modal.remove();
  const user = authManager.getCurrentUser() || {};
  const a = user.address || {};
  const p = Store.pricing(currentBagItems(), appliedPromoCode);
  modal = document.createElement('div');
  modal.id = 'checkoutModal'; modal.className = 'modal show'; modal.dataset.removeOnClose = '1';
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="modal-content checkout-content">
      <span class="modal-close" role="button" aria-label="Close" tabindex="0" id="checkoutClose">&times;</span>
      <h2>Delivery Details</h2>
      <p class="checkout-sub">${p.count} item${p.count === 1 ? '' : 's'} · Total <strong>${formatCurrency(p.total)}</strong></p>
      <form id="checkoutForm" novalidate>
        <div class="form-group"><label for="coName">Full Name *</label><input id="coName" name="fullName" type="text" value="${escapeHtml(user.fullName || '')}" autocomplete="name"></div>
        <div class="form-group"><label for="coPhone">Phone Number *</label><input id="coPhone" name="phone" type="tel" inputmode="numeric" value="${escapeHtml(user.phone || '')}" placeholder="10-digit mobile number" autocomplete="tel"></div>
        <div class="form-group"><label for="coLine1">Address Line 1 *</label><input id="coLine1" name="line1" type="text" value="${escapeHtml(a.line1 || '')}" placeholder="House / flat, street" autocomplete="address-line1"></div>
        <div class="form-group"><label for="coLine2">Address Line 2</label><input id="coLine2" name="line2" type="text" value="${escapeHtml(a.line2 || '')}" placeholder="Landmark, area (optional)" autocomplete="address-line2"></div>
        <div class="form-row-2">
          <div class="form-group"><label for="coCity">City *</label><input id="coCity" name="city" type="text" value="${escapeHtml(a.city || '')}" autocomplete="address-level2"></div>
          <div class="form-group"><label for="coState">State *</label><input id="coState" name="state" type="text" value="${escapeHtml(a.state || '')}" autocomplete="address-level1"></div>
        </div>
        <div class="form-group"><label for="coPin">PIN Code *</label><input id="coPin" name="pin" type="text" inputmode="numeric" maxlength="6" value="${escapeHtml(a.pin || '')}" placeholder="6-digit PIN" autocomplete="postal-code"></div>
        <div class="payment-box">
          <label class="payment-option"><input type="radio" name="payment" value="Cash on Delivery" checked> <span><strong>Cash on Delivery</strong><small>Pay when your artwork arrives. Online payments are coming soon.</small></span></label>
        </div>
        <label class="save-addr"><input type="checkbox" name="saveAddress" checked> Save this address to my profile</label>
        <button type="submit" class="submit-commission checkout-submit">Confirm Order · ${formatCurrency(p.total)}</button>
      </form>
    </div>`;
  document.body.appendChild(modal);
  document.body.classList.add('no-scroll');
  const close = () => { modal.remove(); document.body.classList.remove('no-scroll'); };
  modal.querySelector('#checkoutClose').addEventListener('click', close);
  modal.querySelector('#checkoutClose').addEventListener('keydown', e => { if (e.key === 'Enter') close(); });
  const form = modal.querySelector('#checkoutForm');
  Array.from(form.elements).forEach(el => el.addEventListener('input', () => setFieldError(el, '')));
  form.addEventListener('submit', e => { e.preventDefault(); submitCheckout(form, close); });
  setTimeout(() => form.elements.fullName.focus(), 50);
}

function submitCheckout(form, closeModal) {
  const f = form.elements; let ok = true; let first = null;
  const check = (el, bad, msg) => { setFieldError(el, bad ? msg : ''); if (bad) { ok = false; first = first || el; } };
  check(f.fullName, f.fullName.value.trim().length < 2, 'Please enter the recipient name.');
  check(f.phone, !validatePhone(f.phone.value), 'Enter a valid 10-digit phone number.');
  check(f.line1, f.line1.value.trim().length < 5, 'Please enter your address.');
  check(f.city, f.city.value.trim().length < 2, 'Please enter your city.');
  check(f.state, f.state.value.trim().length < 2, 'Please enter your state.');
  check(f.pin, !validatePin(f.pin.value), 'Enter a valid 6-digit PIN code.');
  if (!ok) { first.focus(); return; }

  const address = {
    fullName: f.fullName.value.trim(), phone: f.phone.value.trim(),
    line1: f.line1.value.trim(), line2: f.line2.value.trim(),
    city: f.city.value.trim(), state: f.state.value.trim(), pin: f.pin.value.trim()
  };
  if (f.saveAddress.checked) {
    authManager.updateProfile({ address: { line1: address.line1, line2: address.line2, city: address.city, state: address.state, pin: address.pin } });
  }
  closeModal();
  placeOrder(address, f.payment.value);
}

function placeOrder(address, paymentMethod) {
  const items = currentBagItems();
  if (!items.length) return;
  const user = authManager.getCurrentUser();
  const p = Store.pricing(items, appliedPromoCode);
  const loading = document.getElementById('loadingScreen');
  const confirmation = document.getElementById('confirmationScreen');
  if (loading) loading.style.display = 'flex';

  const orderDate = new Date();
  const maxDays = Math.max(...items.map(a => a.delivery_days || 7));
  const delivery = new Date(orderDate); delivery.setDate(delivery.getDate() + maxDays);

  const order = {
    orderNumber: Store.orders.nextNumber(),
    userId: user ? user.id : null,
    userEmail: user ? user.email : '',
    items: items.map(a => ({ id: a.id, title: a.title, artist: a.artist, image: a.image, original_price: a.original_price, discount_percentage: a.discount_percentage, price: salePrice(a) })),
    subtotal: p.subtotal, promoCode: appliedPromoCode, promoDiscount: p.promoDiscount, fee: p.fee, total: p.total,
    address, paymentMethod, status: 'Processing',
    orderDate: orderDate.toISOString(), deliveryISO: delivery.toISOString(),
    deliveryDate: delivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  setTimeout(() => {
    Store.orders.add(order);          // save first, so nothing is lost if the user leaves
    Store.cart.clear(); appliedPromoCode = null;
    renderBag();
    if (loading) loading.style.display = 'none';
    if (confirmation) {
      confirmation.style.display = 'flex';
      const n = document.getElementById('orderNumber'); if (n) n.textContent = order.orderNumber;
      const d = document.getElementById('deliveryDate'); if (d) d.textContent = order.deliveryDate;
      const t = document.getElementById('orderTotal'); if (t) t.textContent = formatCurrency(order.total);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 1800);
}
