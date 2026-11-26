// ═══════════════════════════════════════════════════════════════
// orders.js — order history: filter, view details, track, reorder,
// cancel (while still processing), claim earlier guest orders.
// ═══════════════════════════════════════════════════════════════

let ordersFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAccountPage()) return;
  renderOrders();
  document.getElementById('ordersRoot').addEventListener('click', onOrdersClick);
  // open the order linked from the dashboard (orders.html#AW-2026-00123)
  if (location.hash.length > 1) setTimeout(() => {
    const el = document.getElementById('order-' + decodeURIComponent(location.hash.slice(1)));
    if (el) { el.classList.add('open'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }, 80);
});

function orderStatus(order) {
  if (order.status === 'Cancelled') return 'Cancelled';
  const placed = new Date(order.orderDate).getTime();
  const due = order.deliveryISO ? new Date(order.deliveryISO).getTime() : placed + 7 * 864e5;
  const now = Date.now();
  if (now >= due) return 'Delivered';
  if (now >= placed + 864e5) return 'Shipped';
  return 'Processing';
}

function renderOrders() {
  const root = document.getElementById('ordersRoot');
  const user = authManager.getCurrentUser(); if (!user) return;
  const all = Store.orders.forUser(user.id);
  const unclaimed = Store.orders.all().filter(o => !o.userId);

  const banner = unclaimed.length ? `
    <div class="claim-banner">
      <span class="material-symbols-outlined">inventory_2</span>
      <div><strong>${unclaimed.length} earlier order${unclaimed.length === 1 ? '' : 's'} found on this device</strong>
        <p>They were placed before accounts were required. Add them to your account to see them here.</p></div>
      <button type="button" class="claim-btn" data-claim>Add to my account</button>
    </div>` : '';

  const filters = ['all', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const shown = all.filter(o => ordersFilter === 'all' || orderStatus(o) === ordersFilter);

  root.innerHTML = `
    ${banner}
    <div class="orders-filter" role="group" aria-label="Filter orders">
      ${filters.map(f => `<button type="button" class="filter-btn ${ordersFilter === f ? 'active' : ''}" data-ofilter="${f}">${f === 'all' ? 'All' : f}${f === 'all' ? ` (${all.length})` : ''}</button>`).join('')}
    </div>
    ${shown.length ? `<div class="orders-list">${shown.map(orderCardHTML).join('')}</div>` : `
      <div class="wishlist-empty">
        <div class="wishlist-empty-icon">📦</div>
        <h2>${all.length ? 'No orders with this status' : 'No orders yet'}</h2>
        <p>${all.length ? 'Try a different filter.' : 'When you place an order, it will appear here.'}</p>
        <a href="${pageUrl('index.html')}#gallery" class="browse-artworks-btn">Browse Artworks</a>
      </div>`}`;
}

function orderCardHTML(o) {
  const st = orderStatus(o);
  const items = o.items || [];
  const steps = ['Processing', 'Shipped', 'Delivered'];
  const stepIndex = st === 'Cancelled' ? -1 : steps.indexOf(st);
  const addr = o.address;
  return `
  <article class="order-card" id="order-${escapeHtml(o.orderNumber)}">
    <header class="order-head">
      <div><span class="order-no">${escapeHtml(o.orderNumber)}</span><span class="order-date">Placed ${formatDate(o.orderDate)}</span></div>
      <div class="order-head-right"><span class="status-pill status-${st.toLowerCase()}">${st}</span><strong>${formatCurrency(Store.orders.totalOf(o))}</strong></div>
    </header>
    <div class="order-items">
      ${items.map(i => {
        const art = getArtwork(i.id);
        const link = art ? `${pageUrl('pages/product-detail.html')}?id=${i.id}` : null;
        return `<div class="order-item">
          ${link ? `<a href="${link}">${imgTag(i.image, i.title)}</a>` : imgTag(i.image, i.title)}
          <div><strong>${escapeHtml(i.title)}</strong><span>by ${escapeHtml(i.artist || '')}</span></div>
          <span class="oi-price">${formatCurrency(i.price ?? (i.original_price ? salePrice(i) : 0))}</span></div>`;
      }).join('')}
    </div>
    <div class="order-details">
      ${st !== 'Cancelled' ? `<ol class="order-track">${steps.map((s, i) => `<li class="${i <= stepIndex ? 'done' : ''}"><span></span>${s}</li>`).join('')}</ol>` : '<p class="order-cancel-note">This order was cancelled.</p>'}
      <div class="order-meta-grid">
        <div><h4>Delivery</h4><p>${st === 'Delivered' ? 'Delivered' : 'Expected by'} ${escapeHtml(o.deliveryDate || '')}</p></div>
        <div><h4>Payment</h4><p>${escapeHtml(o.paymentMethod || 'Cash on Delivery')}</p></div>
        ${addr ? `<div><h4>Shipping to</h4><p>${escapeHtml(addr.fullName)}<br>${escapeHtml(addr.line1)}${addr.line2 ? ', ' + escapeHtml(addr.line2) : ''}<br>${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} ${escapeHtml(addr.pin)}</p></div>` : ''}
        <div><h4>Summary</h4><p>${o.promoDiscount ? `Promo ${escapeHtml(o.promoCode || '')}: −${formatCurrency(o.promoDiscount)}<br>` : ''}Total paid on delivery: <strong>${formatCurrency(Store.orders.totalOf(o))}</strong></p></div>
      </div>
    </div>
    <footer class="order-actions">
      <button type="button" class="action-btn" data-toggle-order>Details</button>
      <button type="button" class="action-btn" data-reorder="${escapeHtml(o.orderNumber)}"><span class="material-symbols-outlined">replay</span> Order again</button>
      <a class="action-btn" target="_blank" rel="noopener" href="${whatsappUrl(`Hi ${SITE_CONFIG.businessName}! I have a question about my order ${o.orderNumber}.`)}"><span class="material-symbols-outlined">chat</span> Need help?</a>
      ${st === 'Processing' ? `<button type="button" class="action-btn danger" data-cancel="${escapeHtml(o.orderNumber)}"><span class="material-symbols-outlined">cancel</span> Cancel order</button>` : ''}
    </footer>
  </article>`;
}

function onOrdersClick(e) {
  const f = e.target.closest('[data-ofilter]');
  if (f) { ordersFilter = f.dataset.ofilter; renderOrders(); return; }

  const toggle = e.target.closest('[data-toggle-order]');
  if (toggle) { toggle.closest('.order-card').classList.toggle('open'); return; }

  const cancel = e.target.closest('[data-cancel]');
  if (cancel) {
    const no = cancel.dataset.cancel;
    if (!confirm(`Cancel order ${no}? This cannot be undone.`)) return;
    Store.orders.update(no, { status: 'Cancelled', cancelledAt: new Date().toISOString() });
    renderOrders(); showNotification('Order cancelled.', 'info'); return;
  }

  const again = e.target.closest('[data-reorder]');
  if (again) {
    const order = Store.orders.get(again.dataset.reorder); if (!order) return;
    let added = 0, missing = 0;
    (order.items || []).forEach(i => {
      if (!getArtwork(i.id)) { missing++; return; }
      if (Store.cart.add(i.id)) added++;
    });
    if (added) { showNotification(`${added} artwork${added === 1 ? '' : 's'} added to your bag`, 'success'); setTimeout(() => location.href = pageUrl('pages/bag.html'), 700); }
    else showNotification(missing ? 'Those artworks are no longer available.' : 'These items are already in your bag.', 'info');
    return;
  }

  if (e.target.closest('[data-claim]')) {
    const user = authManager.getCurrentUser();
    Store.orders.all().filter(o => !o.userId).forEach(o => Store.orders.update(o.orderNumber, { userId: user.id, userEmail: user.email }));
    renderOrders(); showNotification('Earlier orders added to your account.', 'success');
  }
}
