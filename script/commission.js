// ═══════════════════════════════════════════════════════════════
// commission.js — custom painting request form (pages/commission.html)
// Validates → saves to LocalStorage → opens a pre-filled WhatsApp
// message → shows the success dialog.
// ═══════════════════════════════════════════════════════════════

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
let selectedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('commissionForm');
  if (!form) return;
  form.setAttribute('novalidate', '');
  setupFormValidation(form);
  setupFileUpload();
  setupCustomSize();
  prefillFromAccount();
  setupSuccessModal();
  document.addEventListener('auth:changed', prefillFromAccount);

  // WhatsApp floating button
  if (!document.getElementById('whatsappFloat')) {
    const a = document.createElement('a');
    a.id = 'whatsappFloat'; a.className = 'whatsapp-float'; a.title = 'Chat on WhatsApp'; a.setAttribute('aria-label', 'Chat on WhatsApp');
    a.target = '_blank'; a.rel = 'noopener';
    a.href = whatsappUrl(`Hi ${SITE_CONFIG.businessName}! 👋\n\nI'm interested in commissioning custom artwork.\n\nCan you share details about artists, pricing and timeline?\n\nThank you!`);
    a.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    document.body.appendChild(a);
  }
});

function prefillFromAccount() {
  const user = authManager.getCurrentUser(); if (!user) return;
  const set = (id, v) => { const el = document.getElementById(id); if (el && !el.value && v) el.value = v; };
  set('full-name', user.fullName); set('email', user.email); set('phone', user.phone);
}

function setupCustomSize() {
  const size = document.getElementById('size'); const wrap = document.getElementById('customSizeGroup');
  if (!size || !wrap) return;
  size.addEventListener('change', () => {
    const custom = size.value === 'custom';
    wrap.hidden = !custom;
    if (!custom) { const c = document.getElementById('custom-size'); c.value = ''; setFieldError(c, ''); }
  });
}

// ── Validation ───────────────────────────────────────────────────
const FIELD_RULES = [
  { id: 'full-name',        test: v => v.trim().length >= 2,  msg: 'Please enter your full name.' },
  { id: 'email',            test: v => validateEmail(v),      msg: 'Please enter a valid email address.' },
  { id: 'phone',            test: v => v.trim() === '' || validatePhone(v), msg: 'Enter a valid 10-digit phone number (or leave empty).' },
  { id: 'portrait-type',    test: v => v !== '',              msg: 'Please select a portrait type.' },
  { id: 'medium',           test: v => v !== '',              msg: 'Please select a medium.' },
  { id: 'size',             test: v => v !== '',              msg: 'Please select a size.' },
  { id: 'budget',           test: v => v === '' || Number(v) >= 100, msg: 'Budget should be at least ₹100 (or leave empty).' },
  { id: 'special-requests', test: v => v.trim().length >= 20, msg: 'Please describe your idea in at least 20 characters.' }
];

function validateField(rule) {
  const el = document.getElementById(rule.id); if (!el) return true;
  const ok = rule.test(el.value);
  setFieldError(el, ok ? '' : rule.msg);
  return ok;
}

function validateForm() {
  let firstBad = null;
  FIELD_RULES.forEach(rule => { if (!validateField(rule) && !firstBad) firstBad = document.getElementById(rule.id); });
  const size = document.getElementById('size'); const custom = document.getElementById('custom-size');
  if (size.value === 'custom') {
    const bad = custom.value.trim().length < 3;
    setFieldError(custom, bad ? 'Please describe the custom size (e.g. 20" × 30").' : '');
    if (bad && !firstBad) firstBad = custom;
  }
  if (firstBad) { firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); firstBad.focus({ preventScroll: true }); }
  return !firstBad;
}

function setupFormValidation(form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm()) { showNotification('Please fix the highlighted fields.', 'error'); return; }
    submitCommissionRequest(form);
  });
  FIELD_RULES.forEach(rule => {
    const el = document.getElementById(rule.id); if (!el) return;
    el.addEventListener('blur', () => validateField(rule));
    el.addEventListener('input', () => { if (el.classList.contains('input-invalid')) validateField(rule); });
    el.addEventListener('change', () => { if (el.classList.contains('input-invalid')) validateField(rule); });
  });
}

// ── Submit ───────────────────────────────────────────────────────
function optionText(id) { const el = document.getElementById(id); return el && el.value ? el.options[el.selectedIndex].text : ''; }

function submitCommissionRequest(form) {
  const sizeVal = document.getElementById('size').value;
  const sizeText = sizeVal === 'custom' ? `Custom: ${document.getElementById('custom-size').value.trim()}` : optionText('size');
  const budget = document.getElementById('budget').value;
  const fileNote = selectedFiles.length
    ? `\n\n📎 Reference images (${selectedFiles.length}): ${selectedFiles.map(f => f.name).join(', ')} — I will attach them in this chat.`
    : '';
  const user = authManager.getCurrentUser();

  const entry = {
    id: generateId('com'),
    userId: user ? user.id : null,
    fullName: document.getElementById('full-name').value.trim(),
    email: document.getElementById('email').value.trim().toLowerCase(),
    phone: document.getElementById('phone').value.trim(),
    portraitType: optionText('portrait-type'),
    medium: optionText('medium'),
    size: sizeText,
    budget: budget ? `₹${Number(budget).toLocaleString('en-IN')}` : '',
    timeline: optionText('timeline'),
    specialRequests: document.getElementById('special-requests').value.trim() + fileNote,
    referenceFiles: selectedFiles.map(f => f.name),
    status: 'Submitted',
    submittedAt: new Date().toLocaleString('en-IN'),
    submittedISO: new Date().toISOString(),
    source: 'commission-page'
  };

  Store.commissions.add(entry);
  window.open(whatsappUrl(buildCommissionMessage(entry)), '_blank', 'noopener');
  showSuccessModal();

  form.reset();
  selectedFiles = []; renderFileList();
  document.getElementById('customSizeGroup').hidden = true;
  form.querySelectorAll('.field-error').forEach(n => n.remove());
  form.querySelectorAll('.input-invalid').forEach(n => n.classList.remove('input-invalid'));
  prefillFromAccount();
}

// ── Success dialog ───────────────────────────────────────────────
function showSuccessModal() {
  const modal = document.getElementById('successModal'); if (!modal) return;
  modal.classList.add('show'); document.body.classList.add('no-scroll');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.classList.remove('show');
  document.body.classList.remove('no-scroll');
}
function setupSuccessModal() {
  document.querySelectorAll('[data-close-success]').forEach(b => b.addEventListener('click', closeSuccessModal));
}
function quickWhatsAppInquiry() {
  window.open(whatsappUrl(`Hi ${SITE_CONFIG.businessName}! 👋\n\nI have a question about commissioning artwork.\n\nCan you help me?`), '_blank', 'noopener');
}

// ── Reference image upload ───────────────────────────────────────
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function addFiles(fileList) {
  const incoming = Array.from(fileList);
  for (const file of incoming) {
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) { showNotification(`"${file.name}" is not a supported image (use PNG or JPG).`, 'error'); continue; }
    if (file.size > MAX_FILE_BYTES) { showNotification(`"${file.name}" is larger than 5 MB.`, 'error'); continue; }
    if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) continue;
    if (selectedFiles.length >= MAX_FILES) { showNotification(`Maximum ${MAX_FILES} files allowed.`, 'error'); break; }
    selectedFiles.push(file);
  }
  renderFileList();
}

function renderFileList() {
  const list = document.getElementById('file-list'); if (!list) return;
  list.innerHTML = '';
  selectedFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    const label = document.createElement('span');
    label.innerHTML = '<i class="fa-solid fa-image"></i> ';
    label.appendChild(document.createTextNode(`${file.name} (${formatFileSize(file.size)})`));
    const btn = document.createElement('button');
    btn.type = 'button'; btn.setAttribute('aria-label', `Remove ${file.name}`);
    btn.textContent = '×'; btn.className = 'file-remove';
    btn.addEventListener('click', () => { selectedFiles.splice(index, 1); renderFileList(); });
    item.append(label, btn); list.appendChild(item);
  });
}

function setupFileUpload() {
  const input = document.getElementById('reference-images');
  const label = document.querySelector('.file-label');
  if (!input) return;
  input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
  if (!label) return;
  ['dragenter', 'dragover'].forEach(ev => label.addEventListener(ev, e => { e.preventDefault(); label.classList.add('drag-over'); }));
  ['dragleave', 'drop'].forEach(ev => label.addEventListener(ev, e => { e.preventDefault(); label.classList.remove('drag-over'); }));
  label.addEventListener('drop', e => addFiles(e.dataTransfer.files));
}
