// ═══════════════════════════════════════════════════════════════
// dashboard.js — account overview (stats, recent orders, commissions)
// ═══════════════════════════════════════════════════════════════

function orderStatus(order) {
  if (order.status === 'Cancelled') return 'Cancelled';
  const placed = new Date(order.orderDate).getTime();
  const due = order.deliveryISO ? new Date(order.deliveryISO).getTime() : placed + 7 * 864e5;
  const now = Date.now();
  if (now >= due) return 'Delivered';
  if (now >= placed + 864e5) return 'Shipped';
  return 'Processing';
}

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAccountPage()) return;
  loadDashboard();
  document.addEventListener('store:changed', loadDashboard);
});

function loadDashboard() {
  const user = authManager.getCurrentUser(); if (!user) return;
  const orders = Store.orders.forUser(user.id);
  const active = orders.filter(o => orderStatus(o) !== 'Cancelled');

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('userName', user.fullName.trim().split(/\s+/)[0]);
  set('totalOrders', orders.length);
  set('wishlistCount', Store.wishlist.count());
  set('artworksCollected', active.reduce((n, o) => n + (o.items || []).length, 0));
  set('totalSpent', formatCurrency(active.reduce((s, o) => s + Store.orders.totalOf(o), 0)));

  renderRecentOrders(orders.slice(0, 3));
  renderCommissions(Store.commissions.forEmail(user.email).slice().reverse().slice(0, 3));
}

function renderRecentOrders(orders) {
  const box = document.getElementById('recentOrders'); if (!box) return;
  if (!orders.length) {
    box.innerHTML = `<p class="empty-note">No orders yet. <a href="${pageUrl('index.html')}#gallery">Start shopping</a> to see your orders here!</p>`;
    return;
  }
  box.innerHTML = orders.map(o => {
    const st = orderStatus(o);
    const items = o.items || [];
    return `
    <a class="recent-order" href="${pageUrl('pages/orders.html')}#${encodeURIComponent(o.orderNumber)}">
      <div class="ro-thumbs">${items.slice(0, 3).map(i => imgTag(i.image, i.title)).join('')}</div>
      <div class="ro-main">
        <strong>${escapeHtml(o.orderNumber)}</strong>
        <span>${items.length} item${items.length === 1 ? '' : 's'} · ${formatDate(o.orderDate)}</span>
      </div>
      <div class="ro-side"><span class="status-pill status-${st.toLowerCase()}">${st}</span><strong>${formatCurrency(Store.orders.totalOf(o))}</strong></div>
    </a>`;
  }).join('');
}

function renderCommissions(list) {
  const section = document.getElementById('commissionSection'); const box = document.getElementById('myCommissions');
  if (!section || !box) return;
  if (!list.length) { section.hidden = true; return; }
  section.hidden = false;
  box.innerHTML = list.map(c => `
    <div class="recent-order static">
      <div class="ro-main"><strong>${escapeHtml(c.portraitType || 'Custom artwork')}</strong>
        <span>${escapeHtml(c.size || '')}${c.medium ? ' · ' + escapeHtml(c.medium) : ''} · ${escapeHtml(c.submittedAt || '')}</span></div>
      <div class="ro-side"><span class="status-pill status-processing">${escapeHtml(c.status || 'Submitted')}</span></div>
    </div>`).join('');
}
