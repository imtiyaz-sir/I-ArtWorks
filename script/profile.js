// ═══════════════════════════════════════════════════════════════
// profile.js — edit personal info, shipping address, password;
// logout and delete account.
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAccountPage()) return;
  fillProfile();
  bindProfileForms();
  if (location.hash === '#security') setTimeout(() => document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' }), 100);
});

function fillProfile() {
  const u = authManager.getCurrentUser(); if (!u) return;
  const a = u.address || {};
  const v = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  document.getElementById('profileAvatar').textContent = authManager.getUserInitials();
  document.getElementById('profileHeading').textContent = u.fullName;
  document.getElementById('profileSince').textContent = 'Member since ' + formatDate(u.createdAt);
  v('pfName', u.fullName); v('pfEmail', u.email); v('pfPhone', u.phone);
  v('pfLine1', a.line1); v('pfLine2', a.line2); v('pfCity', a.city); v('pfState', a.state); v('pfPin', a.pin);
}

function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach(n => n.remove());
  form.querySelectorAll('.input-invalid').forEach(n => n.classList.remove('input-invalid'));
}

function bindProfileForms() {
  // Personal details
  const personal = document.getElementById('personalForm');
  personal.addEventListener('submit', e => {
    e.preventDefault(); clearErrors(personal);
    const res = authManager.updateProfile({ fullName: personal.elements.fullName.value, phone: personal.elements.phone.value });
    if (!res.success) { setFieldError(personal.elements[res.field], res.message); showNotification(res.message, 'error'); return; }
    fillProfile(); showNotification(res.message, 'success');
  });

  // Address
  const addr = document.getElementById('addressForm');
  addr.addEventListener('submit', e => {
    e.preventDefault(); clearErrors(addr);
    const f = addr.elements; let ok = true; let first = null;
    const check = (el, bad, msg) => { if (bad) { setFieldError(el, msg); ok = false; first = first || el; } };
    const any = [f.line1, f.city, f.state, f.pin].some(el => el.value.trim());
    if (any) {
      check(f.line1, f.line1.value.trim().length < 5, 'Please enter your address.');
      check(f.city, f.city.value.trim().length < 2, 'Please enter your city.');
      check(f.state, f.state.value.trim().length < 2, 'Please enter your state.');
      check(f.pin, !validatePin(f.pin.value), 'Enter a valid 6-digit PIN code.');
    }
    if (!ok) { first.focus(); return; }
    const res = authManager.updateProfile({ address: { line1: f.line1.value.trim(), line2: f.line2.value.trim(), city: f.city.value.trim(), state: f.state.value.trim(), pin: f.pin.value.trim() } });
    showNotification(res.success ? 'Address saved.' : res.message, res.success ? 'success' : 'error');
  });

  // Password
  const pw = document.getElementById('passwordForm');
  pw.addEventListener('submit', e => {
    e.preventDefault(); clearErrors(pw);
    const f = pw.elements;
    if (f.newPassword.value !== f.confirmPassword.value) { setFieldError(f.confirmPassword, 'Passwords do not match.'); return; }
    const res = authManager.changePassword(f.currentPassword.value, f.newPassword.value);
    if (!res.success) { setFieldError(f[res.field], res.message); return; }
    pw.reset(); showNotification(res.message, 'success');
  });

  [personal, addr, pw].forEach(form => Array.from(form.elements).forEach(el => el.addEventListener('input', () => setFieldError(el, ''))));

  document.getElementById('logoutAllBtn').addEventListener('click', () => authManager.logout());
  document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (!confirm('Delete your account permanently? Your saved profile will be removed from this device.')) return;
    const res = authManager.deleteAccount();
    if (res.success) { showNotification('Your account has been deleted.', 'info'); setTimeout(() => location.href = pageUrl('index.html'), 900); }
  });
  document.querySelectorAll('[data-toggle-pw]').forEach(btn => btn.addEventListener('click', () => {
    const f = document.getElementById(btn.dataset.togglePw); if (!f) return;
    const show = f.type === 'password'; f.type = show ? 'text' : 'password';
    btn.querySelector('.material-symbols-outlined').textContent = show ? 'visibility_off' : 'visibility';
  }));
}
