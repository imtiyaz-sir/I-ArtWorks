// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS - Reusable helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Format currency to Indian Rupees
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate discount price
 */
function calculateDiscount(original, percentage) {
  const discountAmount = (original * percentage) / 100;
  return Math.round(original - discountAmount);
}

/**
 * Calculate savings
 */
function calculateSavings(original, percentage) {
  return Math.round((original * percentage) / 100);
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'success', duration = 3000) {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);
  
  // Add show class for animation
  setTimeout(() => notification.classList.add('show'), 10);

  // Remove after duration
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/**
 * Get notification icon
 */
function getNotificationIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };
  return icons[type] || icons.info;
}

/**
 * Validate email
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number
 */
function validatePhone(phone) {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/\D/g, ''));
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Get item from localStorage with fallback
 */
function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Save item to localStorage
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Format date
 */
function formatDate(date, format = 'DD MMM YYYY') {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const monthName = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()];
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('MMM', monthName)
    .replace('YYYY', year);
}

/**
 * Filter array of objects
 */
function filterByProperty(array, property, value) {
  return array.filter(item => item[property] === value);
}

/**
 * Sort array of objects
 */
function sortByProperty(array, property, order = 'asc') {
  return [...array].sort((a, b) => {
    if (a[property] < b[property]) return order === 'asc' ? -1 : 1;
    if (a[property] > b[property]) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Lazy load images
 */
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

/**
 * Copy to clipboard
 */
function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!', 'success');
    return true;
  }).catch(err => {
    console.error('Failed to copy:', err);
    showNotification('Failed to copy', 'error');
    return false;
  });
}

/**
 * Generate unique ID
 */
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Truncate text
 */
function truncateText(text, maxLength = 50) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Get query parameter
 */
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

/**
 * Add animation to element
 */
function animateElement(element, animationName, duration = 300) {
  return new Promise(resolve => {
    element.style.animation = `${animationName} ${duration}ms ease`;
    setTimeout(() => {
      element.style.animation = '';
      resolve();
    }, duration);
  });
}
