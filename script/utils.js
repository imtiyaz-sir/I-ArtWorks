// ═══════════════════════════════════════════════════════════════
// utils.js — shared helpers used by EVERY page (load this first,
// right after data/artworks.js).
// ═══════════════════════════════════════════════════════════════

// ── Site configuration (edit here) ─────────────────────────────
const SITE_CONFIG = {
  businessName: 'I-ArtWorks',
  whatsappNumber: '916006202075', // digits only: country code + number, no "+" or spaces
  convenienceFee: 78,
  currencyLocale: 'en-IN',
  // Paste your real profile URLs here; icons with an empty URL stay hidden in the footer.
  social: { instagram: '', facebook: '' }
};

// ── Path resolution ────────────────────────────────────────────
// Works from file://, localhost, GitHub Pages sub-folders and custom
// domains: the site root is derived from this script's own URL.
const SITE_ROOT = (function () {
  const el = document.currentScript;
  if (el && el.src) return new URL('../', el.src).href;
  return new URL(location.pathname.includes('/pages/') ? '../' : './', location.href).href;
})();

function assetUrl(path) { return new URL(path, SITE_ROOT).href; }
function pageUrl(path)  { return new URL(path, SITE_ROOT).href; }

const IMG_PLACEHOLDER =
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">' +
    '<rect width="600" height="800" fill="#f0f1f5"/>' +
    '<text x="300" y="400" font-family="sans-serif" font-size="28" fill="#a0a4b8" text-anchor="middle">I-ArtWorks</text></svg>');

// Builds an <img> tag with lazy-loading and a broken-image fallback.
function imgTag(src, alt, cls = '', extra = '') {
  return `<img class="${cls}" src="${assetUrl(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" ${extra} ` +
         `onerror="this.onerror=null;this.src=IMG_PLACEHOLDER">`;
}

// ── Safety ─────────────────────────────────────────────────────
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

// ── Artwork helpers ────────────────────────────────────────────
function getArtwork(id) {
  id = Number(id);
  return (typeof artworks !== 'undefined' ? artworks : []).find(a => a.id === id) || null;
}
function salePrice(art) {
  return Math.round(art.original_price - (art.original_price * art.discount_percentage) / 100);
}
function savingsOf(art) { return art.original_price - salePrice(art); }
function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString(SITE_CONFIG.currencyLocale);
}
function deliveryDateFor(art, fromDate = new Date()) {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + (art && art.delivery_days ? art.delivery_days : 7));
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function labelClass(label) {
  const l = String(label || '').toLowerCase();
  return ['new', 'featured', 'curated', 'limited'].includes(l) ? 'label-' + l : 'label-default';
}

// ── Validation ─────────────────────────────────────────────────
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim()); }
function validatePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
}
function validatePin(pin) { return /^[1-9][0-9]{5}$/.test(String(pin || '').trim()); }

// Inline field errors (used by every form).
function setFieldError(input, message) {
  if (!input) return;
  const group = input.closest('.form-group') || input.parentElement;
  let err = group.querySelector('.field-error');
  if (message) {
    if (!err) { err = document.createElement('div'); err.className = 'field-error'; err.setAttribute('role', 'alert'); group.appendChild(err); }
    err.textContent = message;
    input.classList.add('input-invalid');
    input.setAttribute('aria-invalid', 'true');
  } else {
    if (err) err.remove();
    input.classList.remove('input-invalid');
    input.removeAttribute('aria-invalid');
  }
}

// ── Storage (safe wrappers) ────────────────────────────────────
function getFromStorage(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch (e) { console.warn('Storage read failed:', key, e); return fallback; }
}
function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { console.warn('Storage write failed:', key, e); return false; }
}
function removeFromStorage(key) { try { localStorage.removeItem(key); } catch (e) {} }

// ── Toast notifications (single implementation for the whole site) ──
function showNotification(message, type = 'success', duration = 3000) {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  let host = document.getElementById('toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  const toast = document.createElement('div');
  toast.className = `site-toast site-toast-${type}`;
  toast.innerHTML = `<span class="site-toast-icon">${icons[type] || icons.info}</span><span>${escapeHtml(message)}</span>`;
  host.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, duration);
  while (host.children.length > 3) host.firstChild.remove();
}

// ── Misc ───────────────────────────────────────────────────────
function debounce(fn, wait = 250) {
  let t; return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
}
function getQueryParam(name) { return new URLSearchParams(location.search).get(name); }
function generateId(prefix = 'id') { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9); }
function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function whatsappUrl(message) {
  return `https://wa.me/${String(SITE_CONFIG.whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch (e) { /* fall through */ }
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
  ta.remove(); return ok;
}

// ── Commission requests (shared by the commission page and the home-page quick form) ──
function buildCommissionMessage(d) {
  return [
    '🎨 *NEW COMMISSION REQUEST* 🎨', '',
    '*Customer Details:*',
    `👤 Name: ${d.fullName}`,
    `📧 Email: ${d.email}`,
    `📱 Phone: ${d.phone || 'Not provided'}`, '',
    '*Artwork Requirements:*',
    `🖼️ Type: ${d.portraitType}`,
    `🎨 Medium: ${d.medium || 'Not specified'}`,
    `📐 Size: ${d.size}`,
    `💰 Budget: ${d.budget || 'Not specified'}`,
    `⏰ Timeline: ${d.timeline || 'Flexible'}`, '',
    '*Description:*',
    d.specialRequests, '',
    `📅 Submitted: ${d.submittedAt}`,
    `_Sent from ${SITE_CONFIG.businessName} Commission Form_`
  ].join('\n');
}
