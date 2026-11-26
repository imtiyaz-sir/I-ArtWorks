// ═══════════════════════════════════════════════════════════════
// index.js — home page: gallery (search / categories / sort / filter /
// grid-list view), quick-view modal, hot slider, newsletter and the
// quick commission modal.
// ═══════════════════════════════════════════════════════════════

const galleryState = { q: '', category: 'ALL', sort: 'featured', maxPrice: null, onlyDiscounted: false };
let priceBounds = { min: 0, max: 0 };

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.art-grid')) return;
  initPriceBounds();
  readUrlFilters();
  renderCategoryChips();
  bindToolbar();
  renderGallery();
  renderHot('best');
  bindHotTabs();
  setupViewToggle();
  setupNewsletter();
  setupCommissionModal();
  document.addEventListener('store:changed', syncCardButtons);
});

// ── Filtering model ──────────────────────────────────────────────
function initPriceBounds() {
  const prices = artworks.map(salePrice);
  priceBounds = { min: Math.min(...prices), max: Math.max(...prices) };
  galleryState.maxPrice = priceBounds.max;
}

function readUrlFilters() {
  const q = getQueryParam('q'); const cat = (getQueryParam('category') || '').toUpperCase();
  if (q) galleryState.q = q.trim();
  if (cat && CATEGORIES.includes(cat)) galleryState.category = cat;
  ['gallerySearch', 'mobileSearchInput'].forEach(id => { const el = document.getElementById(id); if (el) el.value = galleryState.q; });
}

function getFilteredArtworks() {
  const q = galleryState.q.toLowerCase();
  let list = artworks.filter(a => {
    if (galleryState.category !== 'ALL' && a.category !== galleryState.category) return false;
    if (galleryState.onlyDiscounted && !(a.discount_percentage > 0)) return false;
    if (salePrice(a) > galleryState.maxPrice) return false;
    if (!q) return true;
    return [a.title, a.artist, a.medium, a.category, a.label, a.description].join(' ').toLowerCase().includes(q);
  });
  const sorters = {
    featured: null,
    'price-asc':  (a, b) => salePrice(a) - salePrice(b),
    'price-desc': (a, b) => salePrice(b) - salePrice(a),
    discount:     (a, b) => b.discount_percentage - a.discount_percentage,
    rating:       (a, b) => b.rating - a.rating,
    name:         (a, b) => a.title.localeCompare(b.title)
  };
  if (sorters[galleryState.sort]) list = [...list].sort(sorters[galleryState.sort]);
  return list;
}

// ── Rendering ────────────────────────────────────────────────────
function cardHTML(art) {
  const price = salePrice(art);
  const inCart = Store.cart.has(art.id), wished = Store.wishlist.has(art.id);
  return `
  <article class="artwork-card" data-id="${art.id}">
    <div class="art-img">
      <a href="${pageUrl('pages/product-detail.html')}?id=${art.id}" class="art-img-link" aria-label="View ${escapeHtml(art.title)}">
        ${imgTag(art.image, art.title, 'art-thumb')}
      </a>
      <div class="art-options-overlay">
        <button type="button" class="preview-btn" data-action="preview" data-id="${art.id}"><span class="material-symbols-outlined">visibility</span> Preview</button>
        <button type="button" class="add-cart-btn" data-action="cart" data-id="${art.id}"><span class="material-symbols-outlined">shopping_bag</span> <span class="cart-btn-text">${inCart ? 'In Bag' : 'Add to Cart'}</span></button>
      </div>
      <div class="art-label ${labelClass(art.label)}">${escapeHtml(art.label)}</div>
      <button type="button" class="wishlist-btn ${wished ? 'active' : ''}" data-wish-id="${art.id}" data-action="wish" data-id="${art.id}" aria-pressed="${wished}" aria-label="${wished ? 'Remove from wishlist' : 'Add to wishlist'}">
        <span class="material-symbols-outlined">favorite</span>
      </button>
    </div>
    <div class="art-details">
      <a class="art-title" href="${pageUrl('pages/product-detail.html')}?id=${art.id}">${escapeHtml(art.title)}</a>
      <div class="art-artist">${escapeHtml(art.artist)}</div>
      <div class="art-meta">${escapeHtml(art.category)}</div>
      <div class="art-info-row"><span class="art-info-label">Size</span><span class="art-info-value">${escapeHtml(art.size)}</span></div>
      <div class="art-info-row"><span class="art-info-label">Medium</span><span class="art-info-value">${escapeHtml(art.medium)}</span></div>
      <div class="price">
        <span class="current-price">${formatCurrency(price)}</span>
        ${art.discount_percentage > 0 ? `<span class="original-price">${formatCurrency(art.original_price)}</span><span class="discount">(${art.discount_percentage}% OFF)</span>` : ''}
      </div>
    </div>
  </article>`;
}

function renderGallery() {
  const grid = document.querySelector('.art-grid');
  const list = getFilteredArtworks();
  grid.innerHTML = list.map(cardHTML).join('');
  const count = document.getElementById('artworkCount'); if (count) count.textContent = list.length;
  const none = document.getElementById('noResults'); if (none) none.hidden = list.length > 0;
  const clear = document.getElementById('clearSearch');
  if (clear) clear.hidden = !galleryState.q;
  renderCategoryChips();
  const note = document.getElementById('resultsNote');
  if (note) {
    const bits = [];
    if (galleryState.q) bits.push(`“${galleryState.q}”`);
    if (galleryState.category !== 'ALL') bits.push(galleryState.category.toLowerCase());
    note.textContent = bits.length ? `Showing ${list.length} result${list.length === 1 ? '' : 's'} for ${bits.join(' in ')}` : '';
  }
}

function syncCardButtons() {
  document.querySelectorAll('.artwork-card').forEach(card => {
    const id = card.dataset.id;
    const t = card.querySelector('.cart-btn-text'); if (t) t.textContent = Store.cart.has(id) ? 'In Bag' : 'Add to Cart';
  });
}

function renderCategoryChips() {
  const wrap = document.getElementById('categoryChips'); if (!wrap) return;
  const counts = {}; artworks.forEach(a => counts[a.category] = (counts[a.category] || 0) + 1);
  const chip = (value, label, n) =>
    `<button type="button" class="category-chip ${galleryState.category === value ? 'active' : ''}" data-category="${escapeHtml(value)}" aria-pressed="${galleryState.category === value}">${escapeHtml(label)} <span class="chip-count">${n}</span></button>`;
  wrap.innerHTML = chip('ALL', 'All', artworks.length) +
    CATEGORIES.filter(c => counts[c]).map(c => chip(c, c.charAt(0) + c.slice(1).toLowerCase(), counts[c])).join('');
}

// ── Toolbar: search, sort, filters ───────────────────────────────
function bindToolbar() {
  const search = document.getElementById('gallerySearch');
  const mobile = document.getElementById('mobileSearchInput');
  const sort = document.getElementById('sortSelect');
  const chips = document.getElementById('categoryChips');
  const clear = document.getElementById('clearSearch');
  const panel = document.getElementById('filterPanel');
  const filterBtn = document.getElementById('filterBtn');
  const range = document.getElementById('priceRange');
  const rangeLabel = document.getElementById('priceRangeLabel');
  const discounted = document.getElementById('onlyDiscounted');

  const applySearch = debounce(value => { galleryState.q = value.trim(); renderGallery(); }, 180);
  const syncInputs = (source, value) => { [search, mobile].forEach(el => { if (el && el !== source) el.value = value; }); };

  [search, mobile].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => { syncInputs(el, el.value); applySearch(el.value); });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); galleryState.q = el.value.trim(); renderGallery(); scrollToGallery(); el.blur(); }
    });
  });
  if (clear) clear.addEventListener('click', () => { galleryState.q = ''; [search, mobile].forEach(el => el && (el.value = '')); renderGallery(); if (search) search.focus(); });
  if (sort) sort.addEventListener('change', () => { galleryState.sort = sort.value; renderGallery(); });
  if (chips) chips.addEventListener('click', e => {
    const b = e.target.closest('[data-category]'); if (!b) return;
    galleryState.category = b.dataset.category; renderGallery();
  });

  if (range) {
    range.min = priceBounds.min; range.max = priceBounds.max; range.value = priceBounds.max;
    const label = () => { if (rangeLabel) rangeLabel.textContent = `Up to ${formatCurrency(range.value)}`; };
    label();
    range.addEventListener('input', () => { galleryState.maxPrice = Number(range.value); label(); renderGallery(); });
  }
  if (discounted) discounted.addEventListener('change', () => { galleryState.onlyDiscounted = discounted.checked; renderGallery(); });

  if (filterBtn && panel) {
    filterBtn.setAttribute('aria-expanded', 'false');
    filterBtn.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      filterBtn.classList.toggle('active', !panel.hidden);
      filterBtn.setAttribute('aria-expanded', String(!panel.hidden));
    });
  }
  const reset = () => {
    Object.assign(galleryState, { q: '', category: 'ALL', sort: 'featured', maxPrice: priceBounds.max, onlyDiscounted: false });
    [search, mobile].forEach(el => el && (el.value = ''));
    if (sort) sort.value = 'featured';
    if (range) { range.value = priceBounds.max; if (rangeLabel) rangeLabel.textContent = `Up to ${formatCurrency(priceBounds.max)}`; }
    if (discounted) discounted.checked = false;
    renderGallery();
  };
  document.querySelectorAll('[data-reset-filters]').forEach(b => b.addEventListener('click', reset));

  // Card actions (delegated: works for freshly rendered cards)
  document.querySelector('.art-grid').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]'); if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'cart') { addCart(id); }
    else if (btn.dataset.action === 'wish') { toggleWish(id, btn); }
    else if (btn.dataset.action === 'preview') { previewArt(id); }
  });
}

// ── Grid / list toggle ───────────────────────────────────────────
function setupViewToggle() {
  const gridBtn = document.getElementById('gridBtn');
  const listBtn = document.getElementById('listBtn');
  const grid = document.querySelector('.art-grid');
  if (!gridBtn || !listBtn || !grid) return;
  const set = mode => {
    grid.classList.toggle('grid-view', mode === 'grid');
    grid.classList.toggle('list-view', mode === 'list');
    gridBtn.classList.toggle('active', mode === 'grid');
    listBtn.classList.toggle('active', mode === 'list');
    gridBtn.setAttribute('aria-pressed', String(mode === 'grid'));
    listBtn.setAttribute('aria-pressed', String(mode === 'list'));
    try { localStorage.setItem('iartworks_view', mode); } catch (e) {}
  };
  gridBtn.addEventListener('click', () => set('grid'));
  listBtn.addEventListener('click', () => set('list'));
  let saved = 'grid'; try { saved = localStorage.getItem('iartworks_view') || 'grid'; } catch (e) {}
  set(saved === 'list' ? 'list' : 'grid');
}

// ── Quick view modal ─────────────────────────────────────────────
function previewArt(artId) {
  const art = getArtwork(artId); if (!art) return;
  const modal = document.getElementById('previewModal');
  const body = document.getElementById('previewBody');
  const price = salePrice(art);
  const wished = Store.wishlist.has(art.id);
  body.innerHTML = `
    <div class="qv-grid">
      <div class="qv-image">${imgTag(art.image, art.title)}</div>
      <div class="qv-info">
        <span class="qv-category">${escapeHtml(art.category)}</span>
        <h2>${escapeHtml(art.title)}</h2>
        <p class="qv-artist">by ${escapeHtml(art.artist)}</p>
        <p class="qv-desc">${escapeHtml(art.description || '')}</p>
        <p><strong>Medium:</strong> ${escapeHtml(art.medium)}</p>
        <p><strong>Size:</strong> ${escapeHtml(art.size)}</p>
        <div class="qv-price">
          <span class="qv-now">${formatCurrency(price)}</span>
          ${art.discount_percentage > 0 ? `<span class="qv-was">${formatCurrency(art.original_price)}</span><span class="qv-off">(${art.discount_percentage}% OFF)</span>` : ''}
        </div>
        <p><strong>Delivery:</strong> Expected by ${deliveryDateFor(art)}</p>
        <p><strong>Returns:</strong> ${art.return_period} days return period</p>
        <div class="qv-actions">
          <button type="button" class="qv-btn qv-primary" id="qvAdd">Add to Cart</button>
          <button type="button" class="qv-btn qv-wish ${wished ? 'active' : ''}" id="qvWish" data-wish-id="${art.id}" aria-pressed="${wished}"><span class="material-symbols-outlined">favorite</span></button>
        </div>
        <a class="qv-link" href="${pageUrl('pages/product-detail.html')}?id=${art.id}">View full details →</a>
      </div>
    </div>`;
  body.querySelector('#qvAdd').addEventListener('click', () => { addCart(art.id); closePreviewModal(); });
  body.querySelector('#qvWish').addEventListener('click', e => toggleWish(art.id, e.currentTarget));
  modal.classList.add('show');
  document.body.classList.add('no-scroll');
}
function closePreviewModal() {
  document.getElementById('previewModal').classList.remove('show');
  document.body.classList.remove('no-scroll');
}
function viewProduct(id) { location.href = pageUrl('pages/product-detail.html') + '?id=' + id; }

// ── Hot this week ────────────────────────────────────────────────
function renderHot(kind) {
  const slider = document.getElementById('hotArtworkSlider'); if (!slider) return;
  const items = artworks.filter(a => a.hot === kind);
  slider.innerHTML = items.length ? items.map(a => `
    <div class="hot-card">
      ${a.label ? `<div class="hot-badge">${escapeHtml(a.label)}</div>` : ''}
      <div class="hot-image">
        <a href="${pageUrl('pages/product-detail.html')}?id=${a.id}" aria-label="View ${escapeHtml(a.title)}">${imgTag(a.image, a.title)}</a>
        <button type="button" class="hot-cart-btn" data-hot-cart="${a.id}" aria-label="Add ${escapeHtml(a.title)} to bag">
          <span class="material-symbols-outlined">shopping_bag</span>
        </button>
      </div>
      <div class="hot-info">
        <span class="hot-category">${escapeHtml(a.category)}</span>
        <h3><a href="${pageUrl('pages/product-detail.html')}?id=${a.id}">${escapeHtml(a.title)}</a></h3>
        <div class="hot-price">${formatCurrency(salePrice(a))}</div>
      </div>
    </div>`).join('') : '<p class="empty-note">Nothing here yet — check back soon.</p>';
}
function bindHotTabs() {
  const tabs = document.querySelectorAll('.hot-tab');
  const kinds = ['best', 'new'];
  tabs.forEach((tab, i) => tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
    renderHot(kinds[i]);
  }));
  const slider = document.getElementById('hotArtworkSlider');
  if (slider) slider.addEventListener('click', e => {
    const b = e.target.closest('[data-hot-cart]'); if (b) addCart(Number(b.dataset.hotCart));
  });
}

// ── Scroll helper ────────────────────────────────────────────────
function scrollToGallery() {
  const g = document.getElementById('gallery'); if (g) g.scrollIntoView({ behavior: 'smooth' });
}

// ── Newsletter ───────────────────────────────────────────────────
function setupNewsletter() {
  const form = document.getElementById('newsletterForm'); if (!form) return;
  form.removeAttribute('onsubmit');
  form.setAttribute('novalidate', '');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const msg = document.getElementById('newsletterMessage');
    const email = input.value.trim().toLowerCase();
    const show = (text, color) => { if (msg) { msg.textContent = text; msg.style.color = color; setTimeout(() => msg.textContent = '', 4000); } };
    if (!validateEmail(email)) { show('Please enter a valid email address.', '#f16565'); input.focus(); return; }
    const list = getFromStorage('iartworks_newsletter', []);
    if (list.includes(email)) { show('You are already subscribed — thank you!', '#3498db'); return; }
    list.push(email); saveToStorage('iartworks_newsletter', list);
    show('Thank you for subscribing!', '#2bb673'); form.reset();
  });
}

// ── Quick commission modal (home page) ───────────────────────────
function showCommissionForm() { document.getElementById('commissionModal').classList.add('show'); document.body.classList.add('no-scroll'); }
function closeCommissionModal() { document.getElementById('commissionModal').classList.remove('show'); document.body.classList.remove('no-scroll'); }

function setupCommissionModal() {
  const form = document.getElementById('commissionForm'); if (!form) return;
  form.removeAttribute('onsubmit'); form.setAttribute('novalidate', '');
  document.querySelectorAll('[data-open-commission]').forEach(b => b.addEventListener('click', showCommissionForm));
  document.querySelectorAll('[data-close-commission]').forEach(b => b.addEventListener('click', closeCommissionModal));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = form.elements; let ok = true; let first = null;
    const check = (el, bad, msg) => { setFieldError(el, bad ? msg : ''); if (bad) { ok = false; first = first || el; } };
    check(f.fullName, f.fullName.value.trim().length < 2, 'Please enter your name.');
    check(f.email, !validateEmail(f.email.value), 'Enter a valid email address.');
    check(f.phone, f.phone.value.trim() !== '' && !validatePhone(f.phone.value), 'Enter a valid 10-digit phone number.');
    check(f.style, !f.style.value, 'Please choose an art style.');
    check(f.size, !f.size.value, 'Please choose a size.');
    check(f.description, f.description.value.trim().length < 15, 'Please describe your idea (at least 15 characters).');
    if (!ok) { first.focus(); showNotification('Please fix the highlighted fields.', 'error'); return; }

    const styleLabel = f.style.options[f.style.selectedIndex].text;
    const sizeLabel = f.size.options[f.size.selectedIndex].text;
    const entry = {
      id: generateId('com'), fullName: f.fullName.value.trim(), email: f.email.value.trim().toLowerCase(),
      phone: f.phone.value.trim(), portraitType: styleLabel, medium: '', size: sizeLabel, budget: '', timeline: '',
      specialRequests: f.description.value.trim(), submittedAt: new Date().toLocaleString('en-IN'), source: 'home-quick-form'
    };
    Store.commissions.add(entry);
    window.open(whatsappUrl(buildCommissionMessage(entry)), '_blank', 'noopener');
    showNotification('Thank you! We will contact you shortly about your commission.', 'success', 4500);
    form.reset(); closeCommissionModal();
  });
  Array.from(form.elements).forEach(el => el.addEventListener('input', () => setFieldError(el, '')));
}
