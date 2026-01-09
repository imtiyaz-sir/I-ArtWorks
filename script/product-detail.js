// Configuration - Replace with your actual WhatsApp number
const WHATSAPP_NUMBER = '+916006202075'; // Format: country code + number (no + or -)
const BUSINESS_NAME = 'I-ArtWorks';

let currentProduct = null;
let isInWishlist = false;

// Load product on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProduct();
    setupAccordion();
    setupWhatsAppIntegration();
    displayBagIcon();
});

// Get product ID from URL
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id')) || 1; // Default to first product
}

// Load product details
function loadProduct() {
    const productId = getProductIdFromURL();
    currentProduct = artworks.find(art => art.id === productId);

    if (!currentProduct) {
        // Redirect to gallery if product not found
        window.location.href = '../index.html#gallery';
        return;
    }

    displayProductDetails();
    loadSimilarProducts();
    checkWishlistStatus();
}

// Display product details
function displayProductDetails() {
    const art = currentProduct;
    
    // Calculate prices
    let discount = (art.original_price * art.discount_percentage) / 100;
    let currentPrice = Math.round(art.original_price - discount);
    let savings = Math.round(discount);

    // Update page title and meta
    document.getElementById('pageTitle').textContent = `${art.title} - ${art.artist} | I-ArtWorks`;
    document.getElementById('pageDescription').content = `${art.title} by ${art.artist}. ${art.medium} on ${art.size}. Buy original artwork online.`;

    // Update breadcrumb
    document.getElementById('breadcrumbTitle').textContent = art.title;

    // Update main image
    document.getElementById('mainImage').src = art.image;
    document.getElementById('mainImage').alt = art.title;

    // Update badge
    const badge = document.getElementById('imageBadge');
    badge.textContent = art.label;
    badge.className = `image-badge label-${art.label.toLowerCase()}`;

    // Generate thumbnails (using same image for demo - you can add more images)
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    thumbnailGallery.innerHTML = `
        <div class="thumbnail active" onclick="changeMainImage('${art.image}', this)">
            <img src="${art.image}" alt="${art.title}">
        </div>
    `;

    // Update product details
    document.getElementById('productTitle').textContent = art.title;
    document.getElementById('artistName').textContent = art.artist;
    
    // Update prices
    document.getElementById('currentPrice').textContent = currentPrice.toLocaleString();
    document.getElementById('originalPrice').textContent = art.original_price.toLocaleString();
    document.getElementById('discountPercent').textContent = art.discount_percentage;
    document.getElementById('savingsAmount').textContent = savings.toLocaleString();

    // Update product info
    document.getElementById('productSize').textContent = art.size;
    document.getElementById('productMedium').textContent = art.medium;
    document.getElementById('productStyle').textContent = art.meta || 'ABSTRACT';
    document.getElementById('deliveryDate').textContent = art.delivery_date;

    // Update return period
    document.getElementById('returnPeriod').textContent = `${art.return_period} Days Return`;
    document.getElementById('returnPeriodText').textContent = `${art.return_period} days`;

    // Add event listeners
    document.getElementById('addToCartBtn').addEventListener('click', handleAddToCart);
    document.getElementById('buyNowBtn').addEventListener('click', handleBuyNow);
}

// Change main image
function changeMainImage(imageSrc, thumbnail) {
    document.getElementById('mainImage').src = imageSrc;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Open image zoom
function openImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    const zoomedImage = document.getElementById('zoomedImage');
    zoomedImage.src = document.getElementById('mainImage').src;
    modal.style.display = 'block';
}

// Close image zoom
function closeImageZoom() {
    document.getElementById('imageZoomModal').style.display = 'none';
}

// Setup accordion
function setupAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const isActive = accordionItem.classList.contains('active');
            
            // Close all accordion items
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });
}

// Handle Add to Cart
function handleAddToCart() {
    if (!currentProduct) return;

    // Check if already in cart
    let iartwork = JSON.parse(localStorage.getItem('iartwork') || '[]');
    
    if (iartwork.includes(currentProduct.id)) {
        showNotification('Item already in cart!', 'info');
        return;
    }

    iartwork.push(currentProduct.id);
    localStorage.setItem('iartwork', JSON.stringify(iartwork));
    displayBagIcon();
    showNotification('Added to cart successfully!', 'success');
}

// Handle Buy Now
function handleBuyNow() {
    if (!currentProduct) return;

    // Add to cart if not already there
    let iartwork = JSON.parse(localStorage.getItem('iartwork') || '[]');
    
    if (!iartwork.includes(currentProduct.id)) {
        iartwork.push(currentProduct.id);
        localStorage.setItem('iartwork', JSON.stringify(iartwork));
    }

    // Redirect to bag page
    window.location.href = 'bag.html';
}

// Toggle Wishlist
function toggleWishlist() {
    const wishlistBtn = document.getElementById('wishlistBtn');
    isInWishlist = !isInWishlist;
    
    if (isInWishlist) {
        wishlistBtn.classList.add('active');
        showNotification('Added to wishlist!', 'success');
        // Save to localStorage
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (!wishlist.includes(currentProduct.id)) {
            wishlist.push(currentProduct.id);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    } else {
        wishlistBtn.classList.remove('active');
        showNotification('Removed from wishlist', 'info');
        // Remove from localStorage
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        wishlist = wishlist.filter(id => id !== currentProduct.id);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
}

// Check wishlist status
function checkWishlistStatus() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    isInWishlist = wishlist.includes(currentProduct.id);
    
    if (isInWishlist) {
        document.getElementById('wishlistBtn').classList.add('active');
    }
}

// Load similar products
function loadSimilarProducts() {
    const similarGrid = document.getElementById('similarGrid');
    
    // Get 4 random products excluding current
    const similarProducts = artworks
        .filter(art => art.id !== currentProduct.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    let html = '';
    similarProducts.forEach(art => {
        let discount = (art.original_price * art.discount_percentage) / 100;
        let price = Math.round(art.original_price - discount);

        html += `
        <div class="similar-item" onclick="navigateToProduct(${art.id})">
            <img src="${art.image}" alt="${art.title}">
            <div class="similar-item-details">
                <h4>${art.title}</h4>
                <p class="similar-item-artist">${art.artist}</p>
                <p class="similar-item-price">₹${price.toLocaleString()}</p>
            </div>
        </div>`;
    });

    similarGrid.innerHTML = html;
}

// Navigate to product
function navigateToProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// View artist profile
function viewArtistProfile() {
    showNotification('Artist profiles coming soon!', 'info');
    // In future: window.location.href = `artist-profile.html?artist=${currentProduct.artist}`;
}

// ========== WhatsApp Integration ==========

function setupWhatsAppIntegration() {
    // Main WhatsApp inquiry button
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', sendProductInquiry);
    }

    // Floating WhatsApp button
    const whatsappFloat = document.getElementById('whatsappFloat');
    if (whatsappFloat) {
        whatsappFloat.addEventListener('click', function(e) {
            e.preventDefault();
            sendGeneralInquiry();
        });
    }
}

// Send product-specific inquiry via WhatsApp
function sendProductInquiry() {
    if (!currentProduct) return;

    const discount = (currentProduct.original_price * currentProduct.discount_percentage) / 100;
    const price = Math.round(currentProduct.original_price - discount);

    const message = `Hi ${BUSINESS_NAME}! 👋

I'm interested in this artwork:

*${currentProduct.title}*
by ${currentProduct.artist}

📐 Size: ${currentProduct.size}
🎨 Medium: ${currentProduct.medium}
💰 Price: ₹${price.toLocaleString()}

Can you provide more details?

Link: ${window.location.href}`;

    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

// Send general inquiry via WhatsApp
function sendGeneralInquiry() {
    const message = `Hi ${BUSINESS_NAME}! 👋

I'm browsing your art gallery and would like to know more about your collection.

Can you help me?`;

    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

// ========== Share Functions ==========

function shareOnWhatsApp() {
    if (!currentProduct) return;

    const message = `Check out this beautiful artwork! 🎨

*${currentProduct.title}*
by ${currentProduct.artist}

${window.location.href}`;

    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

function shareOnFacebook() {
    const facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(facebookURL, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
    const text = `Check out "${currentProduct.title}" by ${currentProduct.artist} on I-ArtWorks!`;
    const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(twitterURL, '_blank', 'width=600,height=400');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy link', 'error');
    });
}

// ========== Review Functions ==========

function openReviewModal() {
    showNotification('Review submission feature coming soon!', 'info');
    // In future: Open a modal with review form
}

// ========== Helper Functions ==========

function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    let bgColor = '#2bb673';
    if (type === 'error') bgColor = '#f54e77';
    if (type === 'info') bgColor = '#3498db';

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function displayBagIcon() {
    let iItemsStr = localStorage.getItem('iartwork');
    let iartwork = iItemsStr ? JSON.parse(iItemsStr) : [];
    let bagItemCountElement = document.querySelector('.bag-item-count');
    
    if (bagItemCountElement) {
        if (iartwork.length > 0) {
            bagItemCountElement.style.visibility = 'visible';
            bagItemCountElement.innerText = iartwork.length;
        } else {
            bagItemCountElement.style.visibility = 'hidden';
        }
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('imageZoomModal');
    if (event.target === modal) {
        closeImageZoom();
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    
    .label-new { background: linear-gradient(135deg, #38d39f, #2bb673); }
    .label-featured { background: linear-gradient(135deg, #f54e77, #ff7ca3); }
    .label-limited { background: linear-gradient(135deg, #5a6bf4, #8796ff); }
    .label-curated { background: linear-gradient(135deg, #8e2de2, #ffcc70); }
`;
document.head.appendChild(style);