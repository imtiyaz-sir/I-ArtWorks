let iartwork;
onLoad();

function onLoad() {
  let iItemsStr = localStorage.getItem('iartwork');
  iartwork = iItemsStr ? JSON.parse(iItemsStr) : [];
  displayItemsOnHomePage();
  displayBagIcon();
  updateArtworkCount();
  setupViewToggle();
  setupFilterButton();
}

function addCart(itemId) {
  iartwork.push(itemId);
  localStorage.setItem('iartwork', JSON.stringify(iartwork));
  displayBagIcon();
  showNotification('Added to cart!');
}

console.log(iartwork);

function displayBagIcon() {
  let bagItemCountElement = document.querySelector('.bag-item-count');
  if (iartwork.length > 0) {
    bagItemCountElement.style.visibility = 'visible';
    bagItemCountElement.innerText = iartwork.length;
  } else {
    bagItemCountElement.style.visibility = 'hidden';
  }
}

// Update artwork count
function updateArtworkCount() {
  const countElement = document.getElementById('artworkCount');
  if (countElement) {
    countElement.innerText = artworks.length;
  }
}

// Setup view toggle functionality
function setupViewToggle() {
  const gridBtn = document.getElementById('gridBtn');
  const listBtn = document.getElementById('listBtn');
  const artGrid = document.querySelector('.art-grid');

  if (gridBtn && listBtn && artGrid) {
    gridBtn.addEventListener('click', () => {
      artGrid.classList.remove('list-view');
      artGrid.classList.add('grid-view');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    });

    listBtn.addEventListener('click', () => {
      artGrid.classList.remove('grid-view');
      artGrid.classList.add('list-view');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    });

    // Set initial active state
    gridBtn.classList.add('active');
  }
}

// Setup filter button
function setupFilterButton() {
  const filterBtn = document.getElementById('filterBtn');
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      showNotification('Filter feature coming soon!');
    });
  }
}

// Display artwork items
function displayItemsOnHomePage() {
  let displayItems = document.querySelector('.art-grid');
  if (!displayItems) return;

  let innerHtml = '';
  
  artworks.forEach(art => {
    let discount = (art.original_price * art.discount_percentage) / 100;
    let price = Math.round(art.original_price - discount);
    
    // Determine label class
    let labelClass = '';
    const labelLower = art.label.toLowerCase();
    if (labelLower === 'new') labelClass = 'label-new';
    else if (labelLower === 'featured') labelClass = 'label-featured';
    else if (labelLower === 'curated') labelClass = 'label-curated';
    else if (labelLower === 'limited') labelClass = 'label-limited';
    else labelClass = 'label-default';

    innerHtml += `
    <div class="artwork-card">
      <div class="art-img">
        <img class="art-thumb" src="${art.image}" alt="${art.title}">
        <div class="art-options-overlay">
          <button class="preview-btn" onclick="previewArt(${art.id})">👁️ Preview</button>
          <button class="add-cart-btn" onclick="addCart(${art.id})">🛒 Add to Cart</button>
        </div>
        <div class="art-label ${labelClass}">${art.label}</div>
      </div>

      <div class="art-details">
        <div class="art-title">${art.title}</div>
        <div class="art-artist">${art.artist}</div>
        <div class="art-meta">${art.meta}</div>
        <div class="art-info-row">
          <span class="art-info-label">Size</span>
          <span class="art-info-value">${art.size}</span>
        </div>
        <div class="art-info-row">
          <span class="art-info-label">Medium</span>
          <span class="art-info-value">${art.medium}</span>
        </div>
        <div class="price">
          <span class="current-price">₹${price}</span>
          <span class="original-price">₹${art.original_price}</span>
          <span class="discount">(${art.discount_percentage}% OFF)</span>
        </div>
      </div>
    </div>`;
  });

  displayItems.innerHTML = innerHtml;
}

// Preview artwork in modal
function previewArt(artId) {
  const artwork = artworks.find(art => art.id === artId);
  if (!artwork) return;

  const modal = document.getElementById('previewModal');
  const modalBody = document.getElementById('previewBody');

  let discount = (artwork.original_price * artwork.discount_percentage) / 100;
  let price = Math.round(artwork.original_price - discount);

  modalBody.innerHTML = `
    <img src="${artwork.image}" alt="${artwork.title}">
    <h2>${artwork.title}</h2>
    <p style="font-size: 1.2rem; color: #6c757d; margin-bottom: 1rem;">by ${artwork.artist}</p>
    <p style="margin-bottom: 1rem;"><strong>Medium:</strong> ${artwork.medium}</p>
    <p style="margin-bottom: 1rem;"><strong>Size:</strong> ${artwork.size}</p>
    <p style="margin-bottom: 1rem;"><strong>Category:</strong> ${artwork.meta}</p>
    <div style="margin: 1.5rem 0;">
      <span style="font-size: 2rem; font-weight: bold; color: #f54e77;">₹${price}</span>
      <span style="text-decoration: line-through; color: #7e818c; margin-left: 10px;">₹${artwork.original_price}</span>
      <span style="color: #ff905a; margin-left: 10px;">(${artwork.discount_percentage}% OFF)</span>
    </div>
    <p style="margin-bottom: 1rem;"><strong>Delivery:</strong> Expected by ${artwork.delivery_date}</p>
    <p style="margin-bottom: 1.5rem;"><strong>Return Policy:</strong> ${artwork.return_period} days return period</p>
    <button onclick="addCart(${artwork.id}); closePreviewModal();" style="background: #f54e77; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; width: 100%;">Add to Cart</button>
  `;

  modal.classList.add('show');
}

// Close preview modal
function closePreviewModal() {
  const modal = document.getElementById('previewModal');
  modal.classList.remove('show');
}



// Newsletter subscription
function handleNewsletter(event) {
  event.preventDefault();
  const message = document.getElementById('newsletterMessage');
  message.textContent = 'Thank you for subscribing!';
  message.style.color = '#2bb673';
  event.target.reset();
  
  setTimeout(() => {
    message.textContent = '';
  }, 3000);
}

// Smooth scroll to gallery
function scrollToGallery() {
  const gallery = document.getElementById('gallery');
  if (gallery) {
    gallery.scrollIntoView({ behavior: 'smooth' });
  }
}

// Notification system
function showNotification(message) {
  // Remove existing notification if any
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 150px;
    right: 50px;
    font-size:30px;
    font-weight:bolder;
    background: #2bb673;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    z-index: 3000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(notificationStyle);



// Close modals when clicking outside
window.addEventListener('click', (event) => {
  const previewModal = document.getElementById('previewModal');
  const commissionModal = document.getElementById('commissionModal');
  
  if (event.target === previewModal) {
    closePreviewModal();
  }
  if (event.target === commissionModal) {
    closeCommissionModal();
  }
});

// Initialize on load
displayItemsOnHomePage();