// ═══════════════════════════════════════════════════════════════
// auth.js — frontend-only authentication (LocalStorage).
// Accounts live in this browser only. When the real backend is
// built, replace the bodies of register/login/logout/updateProfile/
// changePassword/resetPassword with API calls; the UI stays as is.
// ⚠ Passwords here are only lightly hashed — fine for a demo
//   frontend, NOT for production.
// ═══════════════════════════════════════════════════════════════

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.storageKey = 'iartworks_user';
    this.usersKey = 'iartworks_users';
    this.pendingAction = null;     // callback to run after a successful login
    this.resetEmail = null;        // email being reset in the forgot-password flow
    this.init();
  }

  init() {
    this.loadCurrentUser();
    this.setupEventListeners();
    const run = () => {
      this.updateUI();
      // ?login=1&next=pages/dashboard.html  → open login, then continue
      if (getQueryParam('login') === '1' && !this.isLoggedIn()) {
        this.showAuthModal('login', 'Please sign in to continue.');
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  }

  // ── Session storage ───────────────────────────────────────────
  // "Remember me" → localStorage (persists); otherwise sessionStorage (until tab closes).
  loadCurrentUser() {
    let saved = null;
    try { saved = sessionStorage.getItem(this.storageKey) || localStorage.getItem(this.storageKey); } catch (e) {}
    if (!saved) { this.currentUser = null; return; }
    try {
      const sessionUser = JSON.parse(saved);
      // Always refresh from the users list so profile edits are current.
      const fresh = this.getAllUsers().find(u => u.id === sessionUser.id);
      if (!fresh) { this.currentUser = null; this.clearSession(); return; }
      this.currentUser = this.publicUser(fresh);
    } catch (e) { this.currentUser = null; }
  }

  persistSession(remember = true) {
    this.clearSession();
    try { (remember ? localStorage : sessionStorage).setItem(this.storageKey, JSON.stringify(this.currentUser)); } catch (e) {}
  }
  clearSession() {
    try { localStorage.removeItem(this.storageKey); sessionStorage.removeItem(this.storageKey); } catch (e) {}
  }
  isRemembered() { try { return !!localStorage.getItem(this.storageKey); } catch (e) { return false; } }

  publicUser(user) { const u = { ...user }; delete u.password; return u; }
  getAllUsers() { const list = getFromStorage(this.usersKey, []); return Array.isArray(list) ? list : []; }
  saveAllUsers(users) { saveToStorage(this.usersKey, users); }
  isLoggedIn() { return this.currentUser !== null; }
  getCurrentUser() { return this.currentUser; }

  // ── Core operations ───────────────────────────────────────────
  register({ fullName, email, password, phone }) {
    fullName = String(fullName || '').trim();
    email = String(email || '').trim().toLowerCase();
    phone = String(phone || '').trim();

    if (fullName.length < 2) return { success: false, message: 'Please enter your full name.', field: 'fullName' };
    if (!validateEmail(email)) return { success: false, message: 'Please enter a valid email address.', field: 'email' };
    if (phone && !validatePhone(phone)) return { success: false, message: 'Enter a valid 10-digit phone number or leave it empty.', field: 'phone' };
    if (!password || password.length < 6) return { success: false, message: 'Password must be at least 6 characters.', field: 'password' };

    const users = this.getAllUsers();
    if (users.find(u => u.email === email)) return { success: false, message: 'This email is already registered. Try signing in.', field: 'email' };

    const newUser = {
      id: generateId('user'),
      fullName, email, phone,
      password: this.hashPassword(password),
      address: { line1: '', line2: '', city: '', state: '', pin: '' },
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveAllUsers(users);

    this.currentUser = this.publicUser(newUser);
    this.persistSession(true);
    this.updateUI();
    return { success: true, message: 'Account created successfully!', user: this.currentUser };
  }

  login(email, password, remember = false) {
    email = String(email || '').trim().toLowerCase();
    if (!email || !password) return { success: false, message: 'Email and password are required.' };
    if (!validateEmail(email)) return { success: false, message: 'Please enter a valid email address.', field: 'email' };

    const user = this.getAllUsers().find(u => u.email === email);
    if (!user || user.password !== this.hashPassword(password)) {
      return { success: false, message: 'Incorrect email or password.' };
    }
    this.currentUser = this.publicUser(user);
    this.persistSession(remember);
    this.updateUI();
    return { success: true, message: 'Login successful!', user: this.currentUser };
  }

  logout() {
    this.currentUser = null;
    this.clearSession();
    this.updateUI();
    const dd = document.querySelector('.user-profile-dropdown'); if (dd) dd.remove();
    const protectedPage = /(dashboard|profile|orders)\.html/.test(location.pathname);
    if (protectedPage) { location.href = pageUrl('index.html'); return; }
    showNotification('You have been logged out.', 'info');
  }

  updateProfile(updates) {
    if (!this.currentUser) return { success: false, message: 'Please log in first.' };
    const clean = {};
    if ('fullName' in updates) {
      const n = String(updates.fullName).trim();
      if (n.length < 2) return { success: false, message: 'Please enter your full name.', field: 'fullName' };
      clean.fullName = n;
    }
    if ('phone' in updates) {
      const p = String(updates.phone).trim();
      if (p && !validatePhone(p)) return { success: false, message: 'Enter a valid 10-digit phone number.', field: 'phone' };
      clean.phone = p;
    }
    if ('address' in updates) clean.address = { ...(this.currentUser.address || {}), ...updates.address };

    const users = this.getAllUsers();
    const i = users.findIndex(u => u.id === this.currentUser.id);
    if (i === -1) return { success: false, message: 'Account not found.' };
    users[i] = { ...users[i], ...clean };
    this.saveAllUsers(users);
    this.currentUser = this.publicUser(users[i]);
    this.persistSession(this.isRemembered());
    this.updateUI();
    return { success: true, message: 'Profile updated successfully!' };
  }

  changePassword(currentPassword, newPassword) {
    if (!this.currentUser) return { success: false, message: 'Please log in first.' };
    const users = this.getAllUsers();
    const user = users.find(u => u.id === this.currentUser.id);
    if (!user || user.password !== this.hashPassword(currentPassword)) return { success: false, message: 'Current password is incorrect.', field: 'currentPassword' };
    if (!newPassword || newPassword.length < 6) return { success: false, message: 'New password must be at least 6 characters.', field: 'newPassword' };
    if (newPassword === currentPassword) return { success: false, message: 'New password must be different from the current one.', field: 'newPassword' };
    user.password = this.hashPassword(newPassword);
    this.saveAllUsers(users);
    return { success: true, message: 'Password changed successfully!' };
  }

  // Frontend-only reset (no email can be sent without a backend).
  resetPassword(email, newPassword) {
    email = String(email || '').trim().toLowerCase();
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    if (!user) return { success: false, message: 'No account found with that email.', field: 'email' };
    if (!newPassword || newPassword.length < 6) return { success: false, message: 'New password must be at least 6 characters.', field: 'newPassword' };
    user.password = this.hashPassword(newPassword);
    this.saveAllUsers(users);
    return { success: true, message: 'Password updated. You can sign in now.' };
  }

  deleteAccount() {
    if (!this.currentUser) return { success: false, message: 'Please log in first.' };
    const id = this.currentUser.id;
    this.saveAllUsers(this.getAllUsers().filter(u => u.id !== id));
    this.currentUser = null; this.clearSession();
    return { success: true };
  }

  // Run `callback` now if logged in, otherwise ask for login first.
  requireLogin(callback, message = 'Please sign in to continue.') {
    if (this.isLoggedIn()) { callback(); return true; }
    this.pendingAction = callback;
    this.showAuthModal('login', message);
    return false;
  }

  // ── Header UI ─────────────────────────────────────────────────
  getFirstName() { return this.currentUser ? (this.currentUser.fullName || '').trim().split(/\s+/)[0] : ''; }
  getUserInitials() {
    if (!this.currentUser) return '??';
    const parts = (this.currentUser.fullName || '').trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] || ''))).toUpperCase();
  }

  updateUI() {
    document.querySelectorAll('#profileBtn').forEach(btn => {
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-haspopup', 'true');
      if (this.isLoggedIn()) {
        btn.innerHTML = `<span class="material-symbols-outlined action_icon">account_circle</span>` +
                        `<span class="action_name">${escapeHtml(this.getFirstName())}</span>`;
      } else {
        btn.innerHTML = `<span class="material-symbols-outlined action_icon">person</span>` +
                        `<span class="action_name">Login</span>`;
      }
    });
    document.dispatchEvent(new CustomEvent('auth:changed'));
  }

  // ── Dropdown ──────────────────────────────────────────────────
  toggleUserDropdown() {
    let dd = document.querySelector('.user-profile-dropdown');
    if (dd) { dd.remove(); return; }
    dd = document.createElement('div');
    dd.className = 'user-profile-dropdown show';
    dd.innerHTML = `
      <div class="dropdown-header">
        <div class="user-avatar">${escapeHtml(this.getUserInitials())}</div>
        <div class="user-name">${escapeHtml(this.currentUser.fullName)}</div>
        <div class="user-email">${escapeHtml(this.currentUser.email)}</div>
      </div>
      <div class="dropdown-menu">
        <a href="${pageUrl('pages/dashboard.html')}" class="dropdown-item"><span class="material-symbols-outlined">dashboard</span><span>Dashboard</span></a>
        <a href="${pageUrl('pages/profile.html')}" class="dropdown-item"><span class="material-symbols-outlined">person</span><span>My Profile</span></a>
        <a href="${pageUrl('pages/orders.html')}" class="dropdown-item"><span class="material-symbols-outlined">shopping_bag</span><span>My Orders</span></a>
        <a href="${pageUrl('pages/wishlist.html')}" class="dropdown-item"><span class="material-symbols-outlined">favorite</span><span>Wishlist</span></a>
        <div class="dropdown-divider"></div>
        <a href="${pageUrl('pages/profile.html')}#security" class="dropdown-item"><span class="material-symbols-outlined">settings</span><span>Settings</span></a>
      </div>
      <div class="dropdown-footer">
        <button type="button" class="logout-btn" id="logoutBtn"><span class="material-symbols-outlined">logout</span><span>Logout</span></button>
      </div>`;
    document.body.appendChild(dd);
    dd.querySelector('#logoutBtn').addEventListener('click', () => this.logout());
  }

  // ── Modal ─────────────────────────────────────────────────────
  showAuthModal(mode = 'login', notice = '') {
    let modal = document.getElementById('authModal');
    if (!modal) { modal = this.createAuthModal(); document.body.appendChild(modal); }
    this.switchAuthMode(mode);
    modal.classList.add('show');
    document.body.classList.add('no-scroll');
    if (notice) this.showMessage(notice, 'info');
    setTimeout(() => { const f = modal.querySelector('.auth-form.active input'); if (f) f.focus(); }, 60);
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('show');
    document.body.classList.remove('no-scroll');
    this.pendingAction = null;
  }

  createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'auth-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="auth-container">
        <button type="button" class="auth-close" aria-label="Close" data-auth-close>&times;</button>
        <div class="auth-header">
          <div class="auth-logo">ITY</div>
          <h2 id="authTitle">Welcome Back</h2>
          <p id="authSubtitle">Sign in to your account</p>
        </div>
        <div class="auth-body">
          <div id="authMessage" class="auth-message" role="status"></div>

          <form id="loginForm" class="auth-form active" novalidate>
            <div class="form-group">
              <label for="loginEmail">Email Address</label>
              <input type="email" id="loginEmail" name="email" placeholder="your@email.com" autocomplete="email">
            </div>
            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" name="password" placeholder="Enter your password" autocomplete="current-password">
              <button type="button" class="password-toggle" data-toggle-pw="loginPassword" aria-label="Show password"><span class="material-symbols-outlined">visibility</span></button>
            </div>
            <div class="form-options">
              <label class="remember-me"><input type="checkbox" name="remember" checked><span>Remember me</span></label>
              <a href="#" class="forgot-password" data-auth-mode="forgot">Forgot password?</a>
            </div>
            <button type="submit" class="auth-submit-btn">Sign In</button>
          </form>

          <form id="registerForm" class="auth-form" novalidate>
            <div class="form-group">
              <label for="regName">Full Name</label>
              <input type="text" id="regName" name="fullName" placeholder="John Doe" autocomplete="name">
            </div>
            <div class="form-group">
              <label for="regEmail">Email Address</label>
              <input type="email" id="regEmail" name="email" placeholder="your@email.com" autocomplete="email">
            </div>
            <div class="form-group">
              <label for="regPhone">Phone Number (Optional)</label>
              <input type="tel" id="regPhone" name="phone" placeholder="10-digit mobile number" autocomplete="tel" inputmode="numeric">
            </div>
            <div class="form-group">
              <label for="regPassword">Password</label>
              <input type="password" id="regPassword" name="password" placeholder="At least 6 characters" autocomplete="new-password">
              <button type="button" class="password-toggle" data-toggle-pw="regPassword" aria-label="Show password"><span class="material-symbols-outlined">visibility</span></button>
            </div>
            <div class="form-group">
              <label for="regConfirm">Confirm Password</label>
              <input type="password" id="regConfirm" name="confirm" placeholder="Re-enter password" autocomplete="new-password">
            </div>
            <button type="submit" class="auth-submit-btn">Create Account</button>
          </form>

          <form id="forgotForm" class="auth-form" novalidate>
            <div class="form-group">
              <label for="forgotEmail">Account Email</label>
              <input type="email" id="forgotEmail" name="email" placeholder="your@email.com" autocomplete="email">
            </div>
            <div class="form-group" id="forgotNewWrap" style="display:none">
              <label for="forgotNew">New Password</label>
              <input type="password" id="forgotNew" name="newPassword" placeholder="At least 6 characters" autocomplete="new-password">
              <button type="button" class="password-toggle" data-toggle-pw="forgotNew" aria-label="Show password"><span class="material-symbols-outlined">visibility</span></button>
            </div>
            <button type="submit" class="auth-submit-btn" id="forgotSubmit">Find My Account</button>
          </form>

          <div class="auth-toggle">
            <span id="authToggleText">Don't have an account?</span>
            <a href="#" id="authToggleLink" data-auth-toggle>Sign Up</a>
          </div>
        </div>
      </div>`;

    // Event wiring (no inline handlers)
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.closest('[data-auth-close]')) { this.closeAuthModal(); return; }
      const pw = e.target.closest('[data-toggle-pw]');
      if (pw) { this.togglePassword(pw.dataset.togglePw); return; }
      const modeLink = e.target.closest('[data-auth-mode]');
      if (modeLink) { e.preventDefault(); this.switchAuthMode(modeLink.dataset.authMode); return; }
      if (e.target.closest('[data-auth-toggle]')) { e.preventDefault(); this.toggleAuthMode(); }
    });
    modal.querySelector('#loginForm').addEventListener('submit', e => this.handleLogin(e));
    modal.querySelector('#registerForm').addEventListener('submit', e => this.handleRegister(e));
    modal.querySelector('#forgotForm').addEventListener('submit', e => this.handleForgot(e));
    return modal;
  }

  switchAuthMode(mode) {
    const forms = { login: 'loginForm', register: 'registerForm', forgot: 'forgotForm' };
    if (!forms[mode]) mode = 'login';
    Object.entries(forms).forEach(([m, id]) => {
      const f = document.getElementById(id); if (f) f.classList.toggle('active', m === mode);
    });
    const copy = {
      login:    ['Welcome Back', 'Sign in to your account', "Don't have an account?", 'Sign Up'],
      register: ['Create Account', 'Join I-ArtWorks today', 'Already have an account?', 'Sign In'],
      forgot:   ['Reset Password', 'Enter your account email to set a new password', 'Remembered it?', 'Sign In']
    }[mode];
    document.getElementById('authTitle').textContent = copy[0];
    document.getElementById('authSubtitle').textContent = copy[1];
    document.getElementById('authToggleText').textContent = copy[2];
    document.getElementById('authToggleLink').textContent = copy[3];
    document.getElementById('authModal').dataset.mode = mode;
    if (mode === 'forgot') this.resetForgotFlow();
    this.hideMessage();
    document.querySelectorAll('#authModal .field-error').forEach(el => el.remove());
    document.querySelectorAll('#authModal .input-invalid').forEach(el => el.classList.remove('input-invalid'));
  }

  toggleAuthMode() {
    const mode = document.getElementById('authModal')?.dataset.mode || 'login';
    this.switchAuthMode(mode === 'login' ? 'register' : 'login');
  }

  resetForgotFlow() {
    this.resetEmail = null;
    const wrap = document.getElementById('forgotNewWrap'); if (wrap) wrap.style.display = 'none';
    const em = document.getElementById('forgotEmail'); if (em) em.readOnly = false;
    const btn = document.getElementById('forgotSubmit'); if (btn) btn.textContent = 'Find My Account';
  }

  // ── Form handlers ─────────────────────────────────────────────
  afterAuthSuccess(form, message) {
    this.showMessage(message, 'success');
    const action = this.pendingAction; this.pendingAction = null;
    setTimeout(() => {
      this.closeAuthModal(); form.reset();
      if (action) { action(); return; }
      const next = getQueryParam('next');
      if (next && getQueryParam('login') === '1' && /^[\w\-./]+(\?[\w=&%\-.]*)?(#[\w\-]*)?$/.test(next) && !next.startsWith('//')) {
        location.href = pageUrl(next);
      }
    }, 700);
  }

  handleLogin(event) {
    event.preventDefault();
    const form = event.target; const fd = new FormData(form);
    ['email', 'password'].forEach(n => setFieldError(form.elements[n], ''));
    const result = this.login(fd.get('email'), fd.get('password'), fd.get('remember') === 'on');
    if (result.success) { this.afterAuthSuccess(form, result.message); return; }
    if (result.field && form.elements[result.field]) setFieldError(form.elements[result.field], result.message);
    this.showMessage(result.message, 'error');
  }

  handleRegister(event) {
    event.preventDefault();
    const form = event.target; const fd = new FormData(form);
    ['fullName', 'email', 'phone', 'password', 'confirm'].forEach(n => setFieldError(form.elements[n], ''));
    if (fd.get('password') !== fd.get('confirm')) {
      setFieldError(form.elements.confirm, 'Passwords do not match.');
      this.showMessage('Passwords do not match.', 'error'); return;
    }
    const result = this.register({
      fullName: fd.get('fullName'), email: fd.get('email'), phone: fd.get('phone'), password: fd.get('password')
    });
    if (result.success) { this.afterAuthSuccess(form, result.message); return; }
    if (result.field && form.elements[result.field]) setFieldError(form.elements[result.field], result.message);
    this.showMessage(result.message, 'error');
  }

  handleForgot(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.elements.email; const newInput = form.elements.newPassword;
    setFieldError(emailInput, ''); setFieldError(newInput, '');

    if (!this.resetEmail) {                       // step 1: find account
      const email = emailInput.value.trim().toLowerCase();
      if (!validateEmail(email)) { setFieldError(emailInput, 'Please enter a valid email address.'); return; }
      if (!this.getAllUsers().some(u => u.email === email)) { setFieldError(emailInput, 'No account found with that email.'); return; }
      this.resetEmail = email; emailInput.readOnly = true;
      document.getElementById('forgotNewWrap').style.display = '';
      document.getElementById('forgotSubmit').textContent = 'Set New Password';
      this.showMessage('Account found. Choose a new password.', 'info');
      newInput.focus(); return;
    }
    const result = this.resetPassword(this.resetEmail, newInput.value);   // step 2
    if (!result.success) { setFieldError(newInput, result.message); return; }
    form.reset(); this.switchAuthMode('login');
    this.showMessage(result.message, 'success');
  }

  showMessage(message, type = 'success') {
    const el = document.getElementById('authMessage');
    if (el) { el.textContent = message; el.className = `auth-message ${type} show`; }
  }
  hideMessage() { const el = document.getElementById('authMessage'); if (el) el.classList.remove('show'); }

  togglePassword(fieldId) {
    const field = document.getElementById(fieldId); if (!field) return;
    const btn = field.parentElement.querySelector('.password-toggle');
    const icon = btn.querySelector('.material-symbols-outlined');
    const show = field.type === 'password';
    field.type = show ? 'text' : 'password';
    icon.textContent = show ? 'visibility_off' : 'visibility';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  }

  // Lightweight demo hash (kept identical to the previous version so existing accounts still work).
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) { hash = ((hash << 5) - hash) + password.charCodeAt(i); hash = hash & hash; }
    return hash.toString();
  }

  setupEventListeners() {
    document.addEventListener('click', e => {
      // profile / login button in the header (and in the mobile drawer)
      const trigger = e.target.closest('#profileBtn, [data-open-account]');
      if (trigger) {
        e.preventDefault();
        if (this.isLoggedIn()) this.toggleUserDropdown(); else this.showAuthModal('login');
        return;
      }
      // click outside the dropdown closes it
      const dd = document.querySelector('.user-profile-dropdown');
      if (dd && !dd.contains(e.target)) dd.remove();
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      this.closeAuthModal();
      const dd = document.querySelector('.user-profile-dropdown'); if (dd) dd.remove();
    });
  }
}

const authManager = new AuthManager();
window.authManager = authManager;

// Used by dashboard / profile / orders: if nobody is signed in, go home,
// open the login dialog, and come back here afterwards.
function requireAccountPage() {
  if (authManager.isLoggedIn()) return true;
  const here = location.pathname.split('/').pop() || 'index.html';
  location.replace(pageUrl('index.html') + '?login=1&next=' + encodeURIComponent('pages/' + here));
  return false;
}
