// ═══════════════════════════════════════════════════════════════
// product-detail.js — single painting page (?id=…): details, cart,
// buy now, wishlist, zoom, share, WhatsApp enquiry, similar works,
// customer reviews (stored locally until the backend exists).
// ═══════════════════════════════════════════════════════════════

let currentProduct = null;
const REVIEWS_KEY = 'iartworks_reviews';

document.addEventListener('DOMContentLoaded', () => {
  setupAccordion();
  loadProduct();
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeImageZoom(); });
  document.addEventListener('store:changed', () => { if (currentProduct) refreshProductButtons(); });
});

function getProductIdFromURL() {
  const raw = getQueryParam('id');
  return raw === null ? NaN : parseInt(raw, 10);
}

function loadProduct() {
  currentProduct = getArtwork(getProductIdFromURL());
  if (!currentProduct) { showNotFound(); return; }
  displayProductDetails();
  bindProductEvents();
  loadSimilarProducts();
  renderReviews();
  refreshProductButtons();
}

function showNotFound() {
  document.title = 'Artwork not found - I-ArtWorks';
  const main = document.querySelector('main');
  main.innerHTML = `
    <div class="not-found-box">
      <div class="nf-icon">🖼️</div>
      <h1>We couldn't find that artwork</h1>
      <p>It may have been sold or the link is incorrect.</p>
      <a class="btn-add-to-cart nf-btn" href="${pageUrl('index.html')}#gallery">Browse the Gallery</a>
    </div>`;
}

function starsHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += rating >= i ? '<i class="fa-solid fa-star"></i>'
          : rating >= i - 0.5 ? '<i class="fa-solid fa-star-half-stroke"></i>'
          : '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

function displayProductDetails() {
  const art = currentProduct;
  const price = salePrice(art);
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

  document.title = `${art.title} - ${art.artist} | I-ArtWorks`;
  const metaDesc = document.getElementById('pageDescription');
  if (metaDesc) metaDesc.content = `${art.title} by ${art.artist}. ${art.medium}, ${art.size}. Buy original artwork online.`;

  set('breadcrumbTitle', art.title);
  const main = document.getElementById('mainImage');
  main.src = assetUrl(art.image); main.alt = art.title;
  main.onerror = () => { main.onerror = null; main.src = IMG_PLACEHOLDER; };

  const badge = document.getElementById('imageBadge');
  badge.textContent = art.label; badge.className = `image-badge ${labelClass(art.label)}`;

  document.getElementById('thumbnailGallery').innerHTML =
    `<div class="thumbnail active" role="button" tabindex="0" aria-label="Main view">${imgTag(art.image, art.title)}</div>`;

  set('productTitle', art.title);
  set('artistName', art.artist);
  set('currentPrice', price.toLocaleString('en-IN'));
  set('originalPrice', art.original_price.toLocaleString('en-IN'));
  set('discountPercent', art.discount_percentage);
  set('savingsAmount', savingsOf(art).toLocaleString('en-IN'));
  // hide discount UI when there is none
  const noDiscount = !(art.discount_percentage > 0);
  document.querySelector('.original-price')?.toggleAttribute('hidden', noDiscount);
  document.querySelector('.discount-badge')?.toggleAttribute('hidden', noDiscount);
  document.querySelector('.savings-text')?.toggleAttribute('hidden', noDiscount);

  set('productSize', art.size);
  set('productMedium', art.medium);
  set('productStyle', art.category);
  set('deliveryDate', deliveryDateFor(art));
  set('returnPeriod', `${art.return_period} Days Return`);
  set('returnPeriodText', `${art.return_period} days`);
  set('productDescription', art.description || '');

  // ratings
  const ratingStars = document.querySelector('.ratings-section .stars'); if (ratingStars) ratingStars.innerHTML = starsHTML(art.rating);
  set('ratingText', `${art.rating} (${art.reviews} reviews)`);
  set('ratingNumber', art.rating.toFixed(1));
  set('ratingBasedOn', `Based on ${art.reviews} reviews`);
  const big = document.querySelector('.rating-stars-large'); if (big) big.innerHTML = starsHTML(art.rating);

  // links that must work without JS handlers
  const artistBtn = document.getElementById('viewArtistBtn');
  if (artistBtn) artistBtn.href = `${pageUrl('index.html')}?q=${encodeURIComponent(art.artist)}#gallery`;
  const wa = document.getElementById('whatsappFloat'); if (wa) { wa.href = whatsappUrl(`Hi ${SITE_CONFIG.businessName}! I'd like to know more about your art collection.`); wa.target = '_blank'; wa.rel = 'noopener'; }
}

function bindProductEvents() {
  const art = currentProduct;
  document.getElementById('addToCartBtn').addEventListener('click', () => { addCart(art.id); });
  document.getElementById('buyNowBtn').addEventListener('click', () => {
    if (!art.in_stock) { showNotification('This artwork is currently sold out.', 'warning'); return; }
    Store.cart.add(art.id); location.href = pageUrl('pages/bag.html');
  });
  document.getElementById('productWishBtn').addEventListener('click', e => toggleWish(art.id, e.currentTarget));
  document.getElementById('whatsappBtn').addEventListener('click', () => {
    const msg = `Hi ${SITE_CONFIG.businessName}! 👋\n\nI'm interested in this artwork:\n\n*${art.title}*\nby ${art.artist}\n\n📐 Size: ${art.size}\n🎨 Medium: ${art.medium}\n💰 Price: ${formatCurrency(salePrice(art))}\n\nCan you provide more details?\n\nLink: ${location.href}`;
    window.open(whatsappUrl(msg), '_blank', 'noopener');
  });
  const mainWrap = document.querySelector('.main-image-container');
  document.getElementById('mainImage').addEventListener('click', openImageZoom);
  document.querySelector('.zoom-btn')?.addEventListener('click', e => { e.stopPropagation(); openImageZoom(); });
  document.getElementById('imageZoomModal')?.addEventListener('click', e => { if (e.target.id === 'imageZoomModal') closeImageZoom(); });
  document.querySelector('.write-review-btn')?.addEventListener('click', openReviewModal);
}

// Keeps button labels/state in sync (cart/wishlist changed here or in another tab)
function refreshProductButtons() {
  const art = currentProduct;
  const inCart = Store.cart.has(art.id);
  const addBtn = document.getElementById('addToCartBtn');
  if (addBtn) {
    addBtn.innerHTML = `<i class="fa-solid fa-shopping-cart"></i> ${!art.in_stock ? 'Sold Out' : inCart ? 'In Your Bag' : 'Add to Cart'}`;
    addBtn.disabled = !art.in_stock;
  }
  const buy = document.getElementById('buyNowBtn'); if (buy) buy.disabled = !art.in_stock;
  const wish = document.getElementById('productWishBtn');
  if (wish) {
    const on = Store.wishlist.has(art.id);
    wish.classList.toggle('active', on); wish.setAttribute('aria-pressed', on);
    wish.innerHTML = `<i class="${on ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
  }
}

// ── Zoom ─────────────────────────────────────────────────────────
function openImageZoom() {
  const modal = document.getElementById('imageZoomModal'); if (!modal) return;
  document.getElementById('zoomedImage').src = document.getElementById('mainImage').src;
  modal.style.display = 'block'; document.body.classList.add('no-scroll');
}
function closeImageZoom() {
  const modal = document.getElementById('imageZoomModal');
  if (modal && modal.style.display === 'block') { modal.style.display = 'none'; document.body.classList.remove('no-scroll'); }
}

// ── Accordion ────────────────────────────────────────────────────
function setupAccordion() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.setAttribute('aria-expanded', header.parentElement.classList.contains('active'));
    header.addEventListener('click', function () {
      const item = this.parentElement; const wasActive = item.classList.contains('active');
      document.querySelectorAll('.accordion-item').forEach(i => { i.classList.remove('active'); i.querySelector('.accordion-header')?.setAttribute('aria-expanded', 'false'); });
      if (!wasActive) { item.classList.add('active'); this.setAttribute('aria-expanded', 'true'); }
    });
  });
}

// ── Similar works (same category first) ──────────────────────────
function loadSimilarProducts() {
  const grid = document.getElementById('similarGrid'); if (!grid) return;
  const others = artworks.filter(a => a.id !== currentProduct.id);
  const same = others.filter(a => a.category === currentProduct.category);
  const rest = others.filter(a => a.category !== currentProduct.category).sort((a, b) => b.rating - a.rating);
  const picks = [...same, ...rest].slice(0, 4);
  grid.innerHTML = picks.map(a => `
    <a class="similar-item" href="${pageUrl('pages/product-detail.html')}?id=${a.id}">
      ${imgTag(a.image, a.title)}
      <div class="similar-item-details">
        <h4>${escapeHtml(a.title)}</h4>
        <p class="similar-item-artist">${escapeHtml(a.artist)}</p>
        <p class="similar-item-price">${formatCurrency(salePrice(a))}</p>
      </div>
    </a>`).join('');
}

// ── Share ────────────────────────────────────────────────────────
function shareOnWhatsApp() {
  const a = currentProduct; if (!a) return;
  window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this beautiful artwork! 🎨\n\n*${a.title}*\nby ${a.artist}\n\n${location.href}`)}`, '_blank', 'noopener');
}
function shareOnFacebook() {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`, '_blank', 'noopener,width=600,height=400');
}
function shareOnTwitter() {
  const a = currentProduct; if (!a) return;
  const text = `Check out "${a.title}" by ${a.artist} on I-ArtWorks!`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(location.href)}`, '_blank', 'noopener,width=600,height=400');
}
async function copyLink() {
  const ok = await copyToClipboard(location.href);
  showNotification(ok ? 'Link copied to clipboard!' : 'Could not copy the link — please copy it from the address bar.', ok ? 'success' : 'error');
}

// ── Reviews (local until backend) ────────────────────────────────
function allReviews() { const r = getFromStorage(REVIEWS_KEY, {}); return r && typeof r === 'object' ? r : {}; }

function renderReviews() {
  const list = document.querySelector('.reviews-list'); if (!list || !currentProduct) return;
  list.querySelectorAll('.review-item[data-user-review]').forEach(n => n.remove());
  const mine = (allReviews()[currentProduct.id] || []).slice().reverse();
  const html = mine.map(r => `
    <div class="review-item" data-user-review="1">
      <div class="review-header">
        <div class="reviewer-info">
          <div class="reviewer-avatar">${escapeHtml((r.name || '?')[0].toUpperCase())}</div>
          <div><p class="reviewer-name">${escapeHtml(r.name)}</p><div class="review-stars">${starsHTML(r.rating)}</div></div>
        </div>
        <span class="review-date">${formatDate(r.date)}</span>
      </div>
      <p class="review-text">${escapeHtml(r.text)}</p>
    </div>`).join('');
  list.insertAdjacentHTML('afterbegin', html);
}

function openReviewModal() {
  authManager.requireLogin(() => {
    const old = document.getElementById('reviewModal'); if (old) old.remove();
    const modal = document.createElement('div');
    modal.id = 'reviewModal'; modal.className = 'modal show'; modal.dataset.removeOnClose = '1';
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="modal-content checkout-content">
        <span class="modal-close" role="button" tabindex="0" aria-label="Close" id="reviewClose">&times;</span>
        <h2>Write a Review</h2>
        <p class="checkout-sub">${escapeHtml(currentProduct.title)}</p>
        <form id="reviewForm" novalidate>
          <div class="form-group">
            <label>Your rating *</label>
            <div class="star-picker" id="starPicker" role="radiogroup" aria-label="Rating">
              ${[1, 2, 3, 4, 5].map(n => `<button type="button" class="star-btn" data-star="${n}" role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>`).join('')}
            </div>
            <input type="hidden" name="rating" value="0">
          </div>
          <div class="form-group"><label for="reviewText">Your review *</label>
            <textarea id="reviewText" name="text" rows="4" maxlength="600" placeholder="What did you love about this artwork?"></textarea></div>
          <button type="submit" class="submit-commission checkout-submit">Submit Review</button>
        </form>
      </div>`;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector('#reviewClose').addEventListener('click', close);
    const form = modal.querySelector('#reviewForm');
    const picker = modal.querySelector('#starPicker');
    picker.addEventListener('click', e => {
      const b = e.target.closest('[data-star]'); if (!b) return;
      const n = Number(b.dataset.star); form.elements.rating.value = n;
      picker.querySelectorAll('.star-btn').forEach(s => { const on = Number(s.dataset.star) <= n; s.classList.toggle('on', on); s.setAttribute('aria-checked', Number(s.dataset.star) === n); });
      setFieldError(form.elements.rating, '');
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const rating = Number(form.elements.rating.value); const text = form.elements.text.value.trim();
      let ok = true;
      if (!rating) { setFieldError(form.elements.rating, 'Please choose a star rating.'); ok = false; }
      if (text.length < 10) { setFieldError(form.elements.text, 'Please write at least 10 characters.'); ok = false; }
      if (!ok) return;
      const user = authManager.getCurrentUser();
      const reviews = allReviews(); const list = reviews[currentProduct.id] || [];
      const existing = list.findIndex(r => r.userId === user.id);
      const entry = { userId: user.id, name: user.fullName, rating, text, date: new Date().toISOString() };
      if (existing >= 0) list[existing] = entry; else list.push(entry);
      reviews[currentProduct.id] = list; saveToStorage(REVIEWS_KEY, reviews);
      close(); renderReviews(); showNotification('Thank you! Your review has been posted.', 'success');
    });
  }, 'Please sign in to write a review.');
}
