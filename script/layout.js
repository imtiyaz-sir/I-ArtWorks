// ═══════════════════════════════════════════════════════════════
// layout.js — behaviour shared by every page's header:
//   • mobile hamburger + slide-in menu (works on all pages)
//   • header shadow on scroll, active nav link
//   • badges (bag / wishlist) kept in sync
//   • generic modal behaviour (Escape / click outside)
// (This file replaces the missing ui-enhancer.js.)
// ═══════════════════════════════════════════════════════════════

(function () {
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    // footer: year + social links (no dead links: hidden unless configured)
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
    document.querySelectorAll('[data-social]').forEach(a => {
      const key = a.dataset.social;
      const url = key === 'whatsapp' ? whatsappUrl(`Hi ${SITE_CONFIG.businessName}! I'd like to know more about your art collection.`) : SITE_CONFIG.social[key];
      if (url) { a.href = url; a.hidden = false; } else a.hidden = true;
    });

    const header = document.querySelector('header');
    if (!header) { Store.refreshBadges(); return; }

    // 1. Hamburger button (present on every page)
    let menuBtn = header.querySelector('.menu-btn');
    if (!menuBtn) {
      menuBtn = document.createElement('button');
      menuBtn.className = 'menu-btn';
      menuBtn.type = 'button';
      menuBtn.textContent = '☰';
      header.insertBefore(menuBtn, header.firstChild);
    }
    menuBtn.type = 'button';
    menuBtn.setAttribute('aria-label', 'Open menu');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-controls', 'mobileDrawer');

    // 2. Drawer
    const overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    const drawer = document.createElement('aside');
    drawer.className = 'mobile-drawer';
    drawer.id = 'mobileDrawer';
    drawer.setAttribute('aria-label', 'Main menu');
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    function buildDrawer() {
      const loggedIn = window.authManager && authManager.isLoggedIn();
      const navLinks = Array.from(header.querySelectorAll('.nav_bar a')).map(a =>
        `<a href="${a.getAttribute('href')}" class="drawer-link"><span class="material-symbols-outlined">${iconFor(a.textContent)}</span>${escapeHtml(a.textContent.trim())}</a>`).join('');
      drawer.innerHTML = `
        <div class="drawer-head">
          <img src="${assetUrl('images/logo.png')}" alt="I-ArtWorks" class="drawer-logo">
          <button type="button" class="drawer-close" aria-label="Close menu">&times;</button>
        </div>
        <nav class="drawer-nav">
          <a href="${pageUrl('index.html')}" class="drawer-link"><span class="material-symbols-outlined">home</span>Home</a>
          ${navLinks}
          <div class="drawer-divider"></div>
          <a href="${pageUrl('pages/wishlist.html')}" class="drawer-link"><span class="material-symbols-outlined">favorite</span>Wishlist</a>
          <a href="${pageUrl('pages/bag.html')}" class="drawer-link"><span class="material-symbols-outlined">shopping_bag</span>My Bag</a>
          <div class="drawer-divider"></div>
          ${loggedIn ? `
            <a href="${pageUrl('pages/dashboard.html')}" class="drawer-link"><span class="material-symbols-outlined">dashboard</span>Dashboard</a>
            <a href="${pageUrl('pages/profile.html')}" class="drawer-link"><span class="material-symbols-outlined">person</span>My Profile</a>
            <a href="${pageUrl('pages/orders.html')}" class="drawer-link"><span class="material-symbols-outlined">receipt_long</span>My Orders</a>
            <button type="button" class="drawer-link drawer-btn" data-drawer-logout><span class="material-symbols-outlined">logout</span>Logout (${escapeHtml(authManager.getFirstName())})</button>
          ` : `
            <button type="button" class="drawer-link drawer-btn" data-open-account><span class="material-symbols-outlined">login</span>Login / Sign Up</button>
          `}
        </nav>`;
    }
    function iconFor(text) {
      const t = text.trim().toLowerCase();
      return t.includes('gallery') ? 'palette' : t.includes('commission') ? 'brush' : t.includes('about') ? 'info' : t.includes('contact') ? 'mail' : 'chevron_right';
    }

    function openDrawer() {
      buildDrawer();
      drawer.classList.add('open'); overlay.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true'); document.body.classList.add('no-scroll');
    }
    function closeDrawer() {
      drawer.classList.remove('open'); overlay.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('no-scroll');
    }
    menuBtn.addEventListener('click', () => drawer.classList.contains('open') ? closeDrawer() : openDrawer());
    overlay.addEventListener('click', closeDrawer);
    drawer.addEventListener('click', e => {
      if (e.target.closest('.drawer-close')) { closeDrawer(); return; }
      if (e.target.closest('[data-drawer-logout]')) { closeDrawer(); authManager.logout(); return; }
      if (e.target.closest('[data-open-account]')) { closeDrawer(); return; }   // auth.js opens the modal
      if (e.target.closest('a')) closeDrawer();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) closeDrawer(); });

    // 3. Header shadow on scroll
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // 4. Active nav link
    const here = location.pathname.split('/').pop() || 'index.html';
    header.querySelectorAll('.nav_bar a').forEach(a => {
      const target = (a.getAttribute('href') || '').split('#')[0].split('/').pop();
      a.classList.toggle('active', target !== '' && target === here && here !== 'index.html');
    });

    Store.refreshBadges();
  });

  // 5. Generic modal behaviour for .modal elements
  document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('modal') && e.target.classList.contains('show')) {
      if (e.target.dataset.removeOnClose) e.target.remove(); else e.target.classList.remove('show');
      document.body.classList.remove('no-scroll');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal.show').forEach(m => {
      if (m.dataset.removeOnClose) m.remove(); else m.classList.remove('show');
    });
    document.body.classList.remove('no-scroll');
  });
})();
