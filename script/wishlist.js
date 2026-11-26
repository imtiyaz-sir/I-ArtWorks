// ═══════════════════════════════════════════════════════════════
// wishlist.js — wishlist page (list, remove, clear, add to bag,
// filters, share). The hearts on gallery cards / product page are
// handled by index.js / product-detail.js through Store.wishlist.
// ═══════════════════════════════════════════════════════════════

let wishlistFilter = 'all';
let sharedIds = null;      // set when the page is opened from a shared link

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('wishlistContainer');
  if (!container) return;

  const shared = getQueryParam('shared');
  if (shared !== null) {
    sharedIds = shared.split(',').map(Number).filter(id => getArtwork(id)).filter((v, i, a) => a.indexOf(v) === i);
  }
  renderWishlistPage();

  container.addEventListener('click', handleWishlistClick);
  document.addEventListener('store:changed', () => {
    if (!sharedIds) renderWishlistPage();
    else renderWishlistPage();   // refresh "In Bag" state on shared view
  });
});

function wishlistItems() {
  return sharedIds ? sharedIds.map(getArtwork).filter(Boolean) : Store.wishlist.items();
}

function wishlistStats(items) {
  const totalValue = items.reduce((s, a) => s + salePrice(a), 0);
  const totalOriginal = items.reduce((s, a) => s + a.original_price, 0);
  return { count: items.length, totalValue, totalSavings: totalOriginal - totalValue };
}

function renderWishlistPage() {
  const container = document.getElementById('wishlistContainer');
  const items = wishlistItems();
  const readOnly = !!sharedIds;

  if (!items.length) {
    container.innerHTML = `
      <div class="wishlist-empty">
        <div class="wishlist-empty-icon">💝</div>
        <h2>${readOnly ? 'This shared wishlist is empty' : 'Your Wishlist is Empty'}</h2>
        <p>${readOnly ? 'The link may be incomplete or the artworks are no longer available.' : 'Tap the heart on any artwork to save it here.'}</p>
        <a href="${pageUrl('index.html')}#gallery" class="browse-artworks-btn">Browse Artworks</a>
      </div>`;
    return;
  }

  const stats = wishlistStats(items);
  const visible = items.filter(a =>
    wishlistFilter === 'in-stock' ? a.in_stock : wishlistFilter === 'discounted' ? a.discount_percentage > 0 : true);

  container.innerHTML = `
    <div class="wishlist-page">
      <div class="wishlist-header">
        <h1>${readOnly ? 'Shared Wishlist' : 'My Wishlist'}</h1>
        <p>${readOnly ? 'A friend shared their favourite artworks with you' : 'Your curated collection of favorite artworks'}</p>
        <div class="wishlist-stats">
          <div class="wishlist-stat"><div class="wishlist-stat-number">${stats.count}</div><div class="wishlist-stat-label">Artworks</div></div>
          <div class="wishlist-stat"><div class="wishlist-stat-number">${formatCurrency(stats.totalValue)}</div><div class="wishlist-stat-label">Total Value</div></div>
          <div class="wishlist-stat"><div class="wishlist-stat-number">${formatCurrency(stats.totalSavings)}</div><div class="wishlist-stat-label">Potential Savings</div></div>
        </div>
      </div>

      <div class="wishlist-actions">
        <div class="wishlist-filter" role="group" aria-label="Filter wishlist">
          <button type="button" class="filter-btn ${wishlistFilter === 'all' ? 'active' : ''}" data-filter="all">All (${items.length})</button>
          <button type="button" class="filter-btn ${wishlistFilter === 'in-stock' ? 'active' : ''}" data-filter="in-stock">In Stock</button>
          <button type="button" class="filter-btn ${wishlistFilter === 'discounted' ? 'active' : ''}" data-filter="discounted">On Sale</button>
        </div>
        <div class="wishlist-actions-right">
          ${readOnly ? '' : `<button type="button" class="action-btn" data-act="share"><span class="material-symbols-outlined">share</span> Share</button>`}
          <button type="button" class="action-btn" data-act="add-all"><span class="material-symbols-outlined">shopping_cart</span> Add All to Cart</button>
          ${readOnly
            ? `<button type="button" class="action-btn" data-act="save-all"><span class="material-symbols-outlined">favorite</span> Save to My Wishlist</button>`
            : `<button type="button" class="action-btn" data-act="clear"><span class="material-symbols-outlined">delete</span> Clear All</button>`}
        </div>
      </div>

      ${visible.length ? `<div class="wishlist-grid">${visible.map(a => wishlistItemHTML(a, readOnly)).join('')}</div>`
        : `<div class="wishlist-empty"><h2>No artworks match this filter</h2><p>Try a different filter.</p></div>`}
    </div>`;
}

function wishlistItemHTML(a, readOnly) {
  const price = salePrice(a);
  const inBag = Store.cart.has(a.id);
  const link = `${pageUrl('pages/product-detail.html')}?id=${a.id}`;
  return `
  <div class="wishlist-item" data-id="${a.id}">
    <div class="wishlist-item-image">
      <a href="${link}">${imgTag(a.image, a.title)}</a>
      ${readOnly ? '' : `<button type="button" class="wishlist-remove-btn" data-act="remove" data-id="${a.id}" aria-label="Remove ${escapeHtml(a.title)} from wishlist"><span class="material-symbols-outlined">close</span></button>`}
      <div class="wishlist-item-stock ${a.in_stock ? '' : 'out-of-stock'}">${a.in_stock ? 'In Stock' : 'Out of Stock'}</div>
    </div>
    <div class="wishlist-item-details">
      <h3 class="wishlist-item-title"><a href="${link}">${escapeHtml(a.title)}</a></h3>
      <p class="wishlist-item-artist">by ${escapeHtml(a.artist)}</p>
      <div class="wishlist-item-meta"><span>Size: ${escapeHtml(a.size)}</span><span>Medium: ${escapeHtml(a.medium)}</span></div>
      <div class="wishlist-item-price">
        <span class="current-price">${formatCurrency(price)}</span>
        ${a.discount_percentage > 0 ? `<span class="original-price">${formatCurrency(a.original_price)}</span><span class="discount-badge">${a.discount_percentage}% OFF</span>` : ''}
      </div>
      <div class="wishlist-item-actions">
        <button type="button" class="add-to-cart-btn" data-act="cart" data-id="${a.id}" ${(!a.in_stock || inBag) ? 'disabled' : ''}>
          <span class="material-symbols-outlined">shopping_bag</span> ${!a.in_stock ? 'Out of Stock' : inBag ? 'In Bag' : 'Add to Cart'}
        </button>
        <a class="view-details-btn" href="${link}"><span class="material-symbols-outlined">visibility</span> View</a>
      </div>
    </div>
  </div>`;
}

function handleWishlistClick(e) {
  const filter = e.target.closest('[data-filter]');
  if (filter) { wishlistFilter = filter.dataset.filter; renderWishlistPage(); return; }

  const btn = e.target.closest('[data-act]'); if (!btn) return;
  const id = Number(btn.dataset.id);
  switch (btn.dataset.act) {
    case 'remove': {
      const art = getArtwork(id);
      Store.wishlist.remove(id); renderWishlistPage();
      showNotification(`"${art ? art.title : 'Item'}" removed from wishlist`, 'info'); break;
    }
    case 'cart': addCart(id); renderWishlistPage(); break;
    case 'add-all': addAllToCart(); break;
    case 'clear': clearWishlist(); break;
    case 'share': openShareModal(); break;
    case 'save-all': {
      let n = 0; wishlistItems().forEach(a => { if (Store.wishlist.add(a.id)) n++; });
      showNotification(n ? `${n} artwork${n === 1 ? '' : 's'} saved to your wishlist` : 'Everything is already in your wishlist', n ? 'success' : 'info');
      break;
    }
  }
}

function addAllToCart() {
  const items = wishlistItems().filter(a => a.in_stock && !Store.cart.has(a.id));
  if (!items.length) { showNotification('Nothing new to add — items are already in your bag or unavailable.', 'info'); return; }
  items.forEach(a => Store.cart.add(a.id));
  renderWishlistPage();
  showNotification(`${items.length} artwork${items.length === 1 ? '' : 's'} added to your bag`, 'success');
}

function clearWishlist() {
  if (!Store.wishlist.count()) return;
  if (!confirm('Are you sure you want to clear your entire wishlist?')) return;
  Store.wishlist.clear(); renderWishlistPage();
  showNotification('Wishlist cleared', 'info');
}

// ── Share ────────────────────────────────────────────────────────
function wishlistShareUrl() {
  const ids = Store.wishlist.ids().join(',');
  return `${pageUrl('pages/wishlist.html')}?shared=${ids}`;
}

function openShareModal() {
  const url = wishlistShareUrl();
  const text = `Check out my wishlist of ${Store.wishlist.count()} amazing artworks on I-ArtWorks!`;
  const enc = encodeURIComponent;
  const old = document.querySelector('.share-wishlist-modal'); if (old) old.remove();
  const modal = document.createElement('div');
  modal.className = 'modal share-wishlist-modal show';
  modal.dataset.removeOnClose = '1';
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" role="button" tabindex="0" aria-label="Close" data-share-close>&times;</span>
      <h2>Share Your Wishlist</h2>
      <div class="share-options">
        <a class="share-option" target="_blank" rel="noopener" href="https://wa.me/?text=${enc(text + ' ' + url)}"><span class="material-symbols-outlined">chat</span><div class="share-option-label">WhatsApp</div></a>
        <a class="share-option" href="mailto:?subject=${enc('My I-ArtWorks Wishlist')}&body=${enc(text + '\n' + url)}"><span class="material-symbols-outlined">email</span><div class="share-option-label">Email</div></a>
        <a class="share-option" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}"><span class="material-symbols-outlined">group</span><div class="share-option-label">Facebook</div></a>
        <a class="share-option" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}"><span class="material-symbols-outlined">chat_bubble</span><div class="share-option-label">Twitter</div></a>
      </div>
      <div class="share-link-container">
        <p style="margin-bottom:.5rem;font-weight:600;">Or copy link:</p>
        <div class="share-link-input">
          <input type="text" value="${escapeHtml(url)}" readonly id="shareLink" aria-label="Wishlist link">
          <button type="button" class="copy-link-btn" data-share-copy>Copy</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', async e => {
    if (e.target.closest('[data-share-close]')) { modal.remove(); return; }
    const copyBtn = e.target.closest('[data-share-copy]');
    if (copyBtn) {
      const ok = await copyToClipboard(url);
      copyBtn.textContent = ok ? 'Copied!' : 'Press Ctrl+C';
      copyBtn.classList.toggle('copied', ok);
      if (!ok) modal.querySelector('#shareLink').select();
      setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 2000);
    }
  });
}
