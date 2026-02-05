// Wishlist Manager Class
class WishlistManager {
    constructor() {
        this.wishlist = [];
        this.storageKey = 'iartworks_wishlist';
        this.init();
    }

    init() {
        console.log('Wishlist Manager Initializing...');
        this.loadWishlist();
        this.updateWishlistBadge();
        this.setupEventListeners();
    }

    loadWishlist() {
        const saved = localStorage.getItem(this.storageKey);
        this.wishlist = saved ? JSON.parse(saved) : [];
        console.log('Loaded wishlist:', this.wishlist.length, 'items');
    }

    saveWishlist() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.wishlist));
        this.updateWishlistBadge();
        console.log('Saved wishlist:', this.wishlist.length, 'items');
    }

    isInWishlist(itemId) {
        return this.wishlist.some(item => item.id === itemId);
    }

    addToWishlist(artwork) {
        console.log('Adding to wishlist:', artwork.title);
        if (!this.isInWishlist(artwork.id)) {
            const wishlistItem = {
                id: artwork.id,
                title: artwork.title,
                artist: artwork.artist,
                image: artwork.image,
                price: artwork.original_price,
                discountPrice: this.calculateDiscountPrice(artwork.original_price, artwork.discount_percentage),
                discount: artwork.discount_percentage,
                size: artwork.size,
                medium: artwork.medium,
                addedDate: new Date().toISOString(),
                inStock: true
            };
            
            this.wishlist.push(wishlistItem);
            this.saveWishlist();
            this.showToast('Added to Wishlist!', `${artwork.title} has been added`, 'success');
            return true;
        }
        console.log('Already in wishlist');
        return false;
    }

    removeFromWishlist(itemId) {
        console.log('Removing from wishlist:', itemId);
        const index = this.wishlist.findIndex(item => item.id === itemId);
        if (index !== -1) {
            const removed = this.wishlist.splice(index, 1)[0];
            this.saveWishlist();
            this.showToast('Removed', `${removed.title} removed from wishlist`, 'info');
            return true;
        }
        return false;
    }

    toggleWishlist(artwork) {
        if (this.isInWishlist(artwork.id)) {
            this.removeFromWishlist(artwork.id);
            return false;
        } else {
            this.addToWishlist(artwork);
            return true;
        }
    }

    clearWishlist() {
        if (confirm('Are you sure you want to clear your entire wishlist?')) {
            this.wishlist = [];
            this.saveWishlist();
            this.showToast('Wishlist Cleared', 'All items removed', 'info');
            if (window.location.pathname.includes('wishlist.html')) {
                this.renderWishlistPage();
            }
        }
    }

    getWishlist() {
        return this.wishlist;
    }

    getWishlistCount() {
        return this.wishlist.length;
    }

    calculateDiscountPrice(price, discount) {
        return Math.round(price - (price * discount / 100));
    }

    getTotalValue() {
        return this.wishlist.reduce((total, item) => total + item.discountPrice, 0);
    }

    updateWishlistBadge() {
        const badge = document.querySelector('.wishlist-badge');
        if (badge) {
            const count = this.getWishlistCount();
            if (count > 0) {
                badge.textContent = count;
                badge.classList.add('show');
            } else {
                badge.classList.remove('show');
            }
        }
    }

    setupEventListeners() {
        const wishlistBtn = document.getElementById('wishlistBtn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'pages/wishlist.html';
            });
        }
    }

    addWishlistButtons() {
        console.log('Adding wishlist buttons...');
        const artworkCards = document.querySelectorAll('.artwork-card');
        console.log('Found artwork cards:', artworkCards.length);
        
        let buttonsAdded = 0;
        
        artworkCards.forEach((card) => {
            // Check if button already exists
            if (card.querySelector('.wishlist-btn')) {
                console.log('Button already exists, skipping');
                return;
            }

            const artImg = card.querySelector('.art-img');
            if (!artImg) {
                console.log('No art-img found');
                return;
            }

            // Get artwork title
            const titleElement = card.querySelector('.art-title');
            if (!titleElement) {
                console.log('No title element found');
                return;
            }
            
            const title = titleElement.textContent.trim();
            const artwork = artworks.find(art => art.title === title);
            
            if (!artwork) {
                console.log('Artwork not found for title:', title);
                return;
            }

            // Create wishlist button
            const wishlistBtn = document.createElement('button');
            wishlistBtn.className = 'wishlist-btn';
            wishlistBtn.setAttribute('type', 'button');
            wishlistBtn.setAttribute('aria-label', 'Add to wishlist');
            wishlistBtn.innerHTML = '<span class="material-symbols-outlined">favorite</span>';
            
            // Set initial state
            if (this.isInWishlist(artwork.id)) {
                wishlistBtn.classList.add('active');
            }

            // CRITICAL FIX: Use addEventListener instead of onclick
            // This ensures proper event handling and prevents overlay interference
            wishlistBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // Extra stop for nested elements
                console.log('❤️ Wishlist button clicked for:', artwork.title);
                
                const isAdded = this.toggleWishlist(artwork);
                if (isAdded) {
                    wishlistBtn.classList.add('active');
                } else {
                    wishlistBtn.classList.remove('active');
                }
            }, true); // Use capture phase

            // Add to DOM
            artImg.appendChild(wishlistBtn);
            buttonsAdded++;
            console.log('✓ Added button for:', artwork.title);
        });
        
        console.log('✅ Total buttons added:', buttonsAdded);
    }

    // Render wishlist page
    renderWishlistPage() {
        const container = document.getElementById('wishlistContainer');
        if (!container) return;

        if (this.wishlist.length === 0) {
            container.innerHTML = this.getEmptyWishlistHTML();
            return;
        }

        const stats = this.getWishlistStats();
        
        container.innerHTML = `
            <div class="wishlist-page">
                <div class="wishlist-header">
                    <h1>My Wishlist</h1>
                    <p>Your curated collection of favorite artworks</p>
                    <div class="wishlist-stats">
                        <div class="wishlist-stat">
                            <div class="wishlist-stat-number">${stats.count}</div>
                            <div class="wishlist-stat-label">Artworks</div>
                        </div>
                        <div class="wishlist-stat">
                            <div class="wishlist-stat-number">₹${stats.totalValue.toLocaleString()}</div>
                            <div class="wishlist-stat-label">Total Value</div>
                        </div>
                        <div class="wishlist-stat">
                            <div class="wishlist-stat-number">₹${stats.totalSavings.toLocaleString()}</div>
                            <div class="wishlist-stat-label">Potential Savings</div>
                        </div>
                    </div>
                </div>

                <div class="wishlist-actions">
                    <div class="wishlist-filter">
                        <button class="filter-btn active" data-filter="all">All (${this.wishlist.length})</button>
                        <button class="filter-btn" data-filter="in-stock">In Stock</button>
                        <button class="filter-btn" data-filter="discounted">On Sale</button>
                    </div>
                    <div class="wishlist-actions-right">
                        <button class="action-btn" onclick="wishlistManager.shareWishlist()">
                            <span class="material-symbols-outlined">share</span>
                            Share
                        </button>
                        <button class="action-btn" onclick="wishlistManager.addAllToCart()">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            Add All to Cart
                        </button>
                        <button class="action-btn" onclick="wishlistManager.clearWishlist()">
                            <span class="material-symbols-outlined">delete</span>
                            Clear All
                        </button>
                    </div>
                </div>

                <div class="wishlist-grid">
                    ${this.wishlist.map(item => this.getWishlistItemHTML(item)).join('')}
                </div>
            </div>
        `;

        this.setupFilterButtons();
    }

    getWishlistStats() {
        const count = this.wishlist.length;
        const totalValue = this.wishlist.reduce((sum, item) => sum + item.discountPrice, 0);
        const totalOriginal = this.wishlist.reduce((sum, item) => sum + item.price, 0);
        const totalSavings = totalOriginal - totalValue;

        return { count, totalValue, totalOriginal, totalSavings };
    }

    getWishlistItemHTML(item) {
        return `
            <div class="wishlist-item" data-id="${item.id}">
                <div class="wishlist-item-image">
                    <img src="${item.image}" alt="${item.title}">
                    <button class="wishlist-remove-btn" onclick="wishlistManager.removeFromWishlist(${item.id}); wishlistManager.renderWishlistPage();">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                    <div class="wishlist-item-stock ${item.inStock ? '' : 'out-of-stock'}">
                        ${item.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                </div>
                <div class="wishlist-item-details">
                    <h3 class="wishlist-item-title">${item.title}</h3>
                    <p class="wishlist-item-artist">by ${item.artist}</p>
                    <div class="wishlist-item-meta">
                        <span>Size: ${item.size}</span>
                        <span>Medium: ${item.medium}</span>
                    </div>
                    <div class="wishlist-item-price">
                        <span class="current-price">₹${item.discountPrice.toLocaleString()}</span>
                        ${item.discount > 0 ? `
                            <span class="original-price">₹${item.price.toLocaleString()}</span>
                            <span class="discount-badge">${item.discount}% OFF</span>
                        ` : ''}
                    </div>
                    <div class="wishlist-item-actions">
                        <button class="add-to-cart-btn" onclick="wishlistManager.addToCartFromWishlist(${item.id})" ${!item.inStock ? 'disabled' : ''}>
                            <span class="material-symbols-outlined">shopping_bag</span>
                            ${item.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button class="view-details-btn" onclick="window.location.href='product-detail.html?id=${item.id}'">
                            <span class="material-symbols-outlined">visibility</span>
                            View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getEmptyWishlistHTML() {
        return `
            <div class="wishlist-empty">
                <div class="wishlist-empty-icon">💝</div>
                <h2>Your Wishlist is Empty</h2>
                <p>Start adding artworks you love to your wishlist</p>
                <a href="../index.html#gallery" class="browse-artworks-btn">Browse Artworks</a>
            </div>
        `;
    }

    setupFilterButtons() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                const items = document.querySelectorAll('.wishlist-item');

                items.forEach(item => {
                    const itemId = parseInt(item.dataset.id);
                    const wishlistItem = this.wishlist.find(i => i.id === itemId);

                    let show = true;
                    if (filter === 'in-stock') {
                        show = wishlistItem.inStock;
                    } else if (filter === 'discounted') {
                        show = wishlistItem.discount > 0;
                    }

                    item.style.display = show ? 'block' : 'none';
                });
            });
        });
    }

    addToCartFromWishlist(itemId) {
        const artwork = artworks.find(art => art.id === itemId);
        if (artwork && typeof addCart === 'function') {
            addCart(itemId);
            this.showToast('Added to Cart!', `${artwork.title} added to cart`, 'success');
        }
    }

    addAllToCart() {
        const inStockItems = this.wishlist.filter(item => item.inStock);
        
        if (inStockItems.length === 0) {
            this.showToast('No Items', 'No items available to add to cart', 'info');
            return;
        }

        if (typeof addCart === 'function') {
            inStockItems.forEach(item => {
                addCart(item.id);
            });
            this.showToast('Success!', `${inStockItems.length} items added to cart`, 'success');
        }
    }

    shareWishlist() {
        const modal = document.createElement('div');
        modal.className = 'modal share-wishlist-modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
                <h2>Share Your Wishlist</h2>
                <div class="share-options">
                    <div class="share-option" onclick="wishlistManager.shareVia('whatsapp')">
                        <span class="material-symbols-outlined">chat</span>
                        <div class="share-option-label">WhatsApp</div>
                    </div>
                    <div class="share-option" onclick="wishlistManager.shareVia('email')">
                        <span class="material-symbols-outlined">email</span>
                        <div class="share-option-label">Email</div>
                    </div>
                    <div class="share-option" onclick="wishlistManager.shareVia('facebook')">
                        <span class="material-symbols-outlined">group</span>
                        <div class="share-option-label">Facebook</div>
                    </div>
                    <div class="share-option" onclick="wishlistManager.shareVia('twitter')">
                        <span class="material-symbols-outlined">chat_bubble</span>
                        <div class="share-option-label">Twitter</div>
                    </div>
                </div>
                <div class="share-link-container">
                    <p style="margin-bottom: 0.5rem; font-weight: 600;">Or copy link:</p>
                    <div class="share-link-input">
                        <input type="text" value="${window.location.href}" readonly id="shareLink">
                        <button class="copy-link-btn" onclick="wishlistManager.copyShareLink()">Copy</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    shareVia(platform) {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`Check out my wishlist of ${this.wishlist.length} amazing artworks on I-ArtWorks!`);
        
        let shareUrl = '';
        switch(platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text}%20${url}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=My I-ArtWorks Wishlist&body=${text}%20${url}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    }

    copyShareLink() {
        const input = document.getElementById('shareLink');
        input.select();
        document.execCommand('copy');
        
        const btn = event.target;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    }

    showToast(title, message, type = 'success') {
        const existing = document.querySelector('.wishlist-toast');
        if (existing) existing.remove();

        const icons = {
            success: '✓',
            info: 'ℹ',
            error: '✕'
        };

        const toast = document.createElement('div');
        toast.className = 'wishlist-toast';
        toast.innerHTML = `
            <div class="wishlist-toast-icon">${icons[type] || icons.success}</div>
            <div class="wishlist-toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="wishlist-toast-close" onclick="this.closest('.wishlist-toast').remove()">×</button>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
}

// Initialize wishlist manager
const wishlistManager = new WishlistManager();

// Initialize wishlist buttons after page load
function initWishlistButtons() {
    console.log('🔄 initWishlistButtons called');
    if (typeof artworks !== 'undefined' && artworks.length > 0) {
        const cards = document.querySelectorAll('.artwork-card');
        if (cards.length > 0) {
            console.log('✅ Found', cards.length, 'artwork cards, adding wishlist buttons');
            wishlistManager.addWishlistButtons();
        } else {
            console.log('⏳ No artwork cards found yet, will retry...');
        }
    } else {
        console.log('⚠️ Artworks not loaded yet');
    }
}

// Multiple initialization methods to ensure buttons are added
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOMContentLoaded event fired');
        if (window.location.pathname.includes('wishlist.html')) {
            wishlistManager.renderWishlistPage();
        } else {
            setTimeout(initWishlistButtons, 500);
            setTimeout(initWishlistButtons, 1000);
            setTimeout(initWishlistButtons, 2000);
        }
    });
} else {
    console.log('📄 DOM already loaded');
    if (window.location.pathname.includes('wishlist.html')) {
        wishlistManager.renderWishlistPage();
    } else {
        setTimeout(initWishlistButtons, 100);
        setTimeout(initWishlistButtons, 500);
        setTimeout(initWishlistButtons, 1000);
    }
}

// Also try on window load
window.addEventListener('load', () => {
    console.log('🪟 Window load event fired');
    setTimeout(initWishlistButtons, 100);
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.wishlistManager = wishlistManager;
    window.initWishlistButtons = initWishlistButtons;
}
