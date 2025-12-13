let bagItemsObjects;
let appliedPromoCode = null;
let promoDiscount = 0;

onLoad();

function onLoad() {
    loadbagItemsObjects();
    displayBagItems();
    displayBagSummary();
    displayBagIcon();
    setupEventListeners();
    showRecommendations();
}

function setupEventListeners() {
    // Place order button
    const placeOrderBtn = document.querySelector('.btn-place-order');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', handleClearCart);
    }

    // Promo code
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }

    // Allow Enter key for promo code
    const promoInput = document.getElementById('promoInput');
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyPromoCode();
            }
        });
    }
}

function loadbagItemsObjects() {
    bagItemsObjects = iartwork.map(itemId => {
        for (let i = 0; i < artworks.length; i++) {
            if (itemId == artworks[i].id) {
                return artworks[i];
            }
        }
    }).filter(item => item !== undefined);
}

function displayBagItems() {
    const containerElement = document.querySelector('.bag-Items-container');
    const emptyCart = document.getElementById('emptyCart');
    const itemCount = document.getElementById('itemCount');
    const clearCartBtn = document.getElementById('clearCartBtn');

    if (!containerElement) return;

    // Update item count
    if (itemCount) {
        itemCount.textContent = `(${bagItemsObjects.length} ${bagItemsObjects.length === 1 ? 'item' : 'items'})`;
    }

    // Show/hide clear cart button
    if (clearCartBtn) {
        clearCartBtn.style.display = bagItemsObjects.length > 0 ? 'block' : 'none';
    }

    if (bagItemsObjects.length === 0) {
        containerElement.style.display = 'none';
        if (emptyCart) {
            emptyCart.style.display = 'block';
        }
        return;
    }

    containerElement.style.display = 'flex';
    if (emptyCart) {
        emptyCart.style.display = 'none';
    }

    let innerHTML = '';
    bagItemsObjects.forEach(bagItems => {
        innerHTML += generateItemHTML(bagItems);
    });
    containerElement.innerHTML = innerHTML;
}

function generateItemHTML(art) {
    let discount = (art.original_price * art.discount_percentage) / 100;
    let price = Math.round(art.original_price - discount);

    return `
    <div class="bag-item-container">
        <div class="item-left-part">
            <img class="bag-item-img" src="${art.image}" alt="${art.title}">
        </div>
        <div class="item-right-part">
            <div class="company">${art.artist}</div>
            <div class="item-name">${art.title}</div>
            <div class="price-container">
                <span class="current-price">₹${price}</span>
                <span class="orignal-price">₹${art.original_price}</span>
                <span class="discount-percentage">(${art.discount_percentage}% OFF)</span>
            </div>
            <div class="return-period">
                <i class="fa-solid fa-rotate-left"></i>
                <span class="return-period-day">${art.return_period} days return available</span>
            </div>
            <div class="delivery-details">
                <i class="fa-solid fa-truck-fast"></i>
                Delivery by <span class="delivery-details-days">${art.delivery_date}</span>
            </div>
        </div>
        <div class="remove-from-cart" onclick="removeFromCart(${art.id})" title="Remove item">
            ×
        </div>
    </div>`;
}

function displayBagSummary() {
    const bagSummaryElement = document.querySelector('.bag-summary');
    if (!bagSummaryElement) return;

    let totalItem = bagItemsObjects.length;
    let totalMRP = 0;
    let totalDiscount = 0;

    bagItemsObjects.forEach(bagItem => {
        totalMRP += bagItem.original_price;
        let discount = (bagItem.original_price * bagItem.discount_percentage) / 100;
        totalDiscount += discount;
    });

    let CONVENIENCE_FEE = totalItem === 0 ? 0 : 78;
    let finalPayment = totalMRP - totalDiscount - promoDiscount + CONVENIENCE_FEE;

    bagSummaryElement.innerHTML = `
    <div class="bag-details-container">
        <div class="price-header">PRICE DETAILS (${totalItem} ${totalItem === 1 ? 'Item' : 'Items'})</div>
        
        <div class="price-item">
            <span class="price-item-tag">Total MRP</span>
            <span class="price-item-value">₹${totalMRP.toLocaleString()}</span>
        </div>
        
        <div class="price-item">
            <span class="price-item-tag">Discount on MRP</span>  
            <span class="price-item-value priceDetail-base-discount">-₹${totalDiscount.toLocaleString()}</span>  
        </div>
        
        ${promoDiscount > 0 ? `
        <div class="price-item">
            <span class="price-item-tag">Promo Code Discount (${appliedPromoCode})</span>  
            <span class="price-item-value priceDetail-base-discount">-₹${promoDiscount.toLocaleString()}</span>  
        </div>` : ''}
        
        <div class="price-item">
            <span class="price-item-tag">Convenience Fee</span>  
            <span class="price-item-value">${CONVENIENCE_FEE === 0 ? 'FREE' : '₹' + CONVENIENCE_FEE}</span>  
        </div>
        
        <div class="price-footer">
            <span class="price-item-tag">Total Amount</span>  
            <span class="price-item-value">₹${finalPayment.toLocaleString()}</span>
        </div>
        
        <button class="btn-place-order" ${totalItem === 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-check"></i> PLACE ORDER
        </button>
    </div>`;

    // Re-attach event listener after updating HTML
    const placeOrderBtn = document.querySelector('.btn-place-order');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }
}

function removeFromCart(itemId) {
    iartwork = iartwork.filter(bagItemId => bagItemId != itemId);
    localStorage.setItem('iartwork', JSON.stringify(iartwork));
    loadbagItemsObjects();
    displayBagIcon();
    displayBagItems();
    displayBagSummary();
    showNotification('Item removed from cart', 'info');
}

function handleClearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        iartwork = [];
        localStorage.setItem('iartwork', JSON.stringify(iartwork));
        loadbagItemsObjects();
        displayBagIcon();
        displayBagItems();
        displayBagSummary();
        appliedPromoCode = null;
        promoDiscount = 0;
        showNotification('Cart cleared successfully', 'success');
    }
}

function applyPromoCode() {
    const promoInput = document.getElementById('promoInput');
    const promoMessage = document.getElementById('promoMessage');
    const code = promoInput.value.trim().toUpperCase();

    if (!code) {
        showPromoMessage('Please enter a promo code', 'error');
        return;
    }

    // Sample promo codes
    const promoCodes = {
        'ART10': { discount: 10, type: 'percentage' },
        'ART20': { discount: 20, type: 'percentage' },
        'SAVE500': { discount: 500, type: 'fixed' },
        'FIRSTBUY': { discount: 15, type: 'percentage' },
        'WELCOME': { discount: 100, type: 'fixed' },
        'IMTIYAZ': {discount: 700, type:  'fixed'},
    };

    if (promoCodes[code]) {
        const promo = promoCodes[code];
        
        // Calculate promo discount
        let totalMRP = bagItemsObjects.reduce((sum, item) => {
            let discount = (item.original_price * item.discount_percentage) / 100;
            return sum + (item.original_price - discount);
        }, 0);

        if (promo.type === 'percentage') {
            promoDiscount = Math.round((totalMRP * promo.discount) / 100);
        } else {
            promoDiscount = promo.discount;
        }

        appliedPromoCode = code;
        displayBagSummary();
        showPromoMessage(`Promo code applied! You saved ₹${promoDiscount}`, 'success');
        promoInput.value = '';
    } else {
        showPromoMessage('Invalid promo code', 'error');
    }
}

function showPromoMessage(message, type) {
    const promoMessage = document.getElementById('promoMessage');
    if (promoMessage) {
        promoMessage.textContent = message;
        promoMessage.className = `promo-message ${type}`;
        
        setTimeout(() => {
            promoMessage.textContent = '';
            promoMessage.className = 'promo-message';
        }, 3000);
    }
}

function handlePlaceOrder() {
    if (bagItemsObjects.length === 0) return;

    const loadingScreen = document.getElementById('loadingScreen');
    const confirmationScreen = document.getElementById('confirmationScreen');

    // Show loading screen
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }

    // Generate order number
    const orderNumber = 'AW-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Calculate delivery date (7 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const deliveryDateStr = deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    // Simulate order processing
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (confirmationScreen) {
            confirmationScreen.style.display = 'flex';
            
            // Update order details
            const orderNumberElement = document.getElementById('orderNumber');
            const deliveryDateElement = document.getElementById('deliveryDate');
            
            if (orderNumberElement) {
                orderNumberElement.textContent = orderNumber;
            }
            if (deliveryDateElement) {
                deliveryDateElement.textContent = deliveryDateStr;
            }
        }

        // Clear cart
        iartwork = [];
        localStorage.setItem('iartwork', JSON.stringify(iartwork));
        appliedPromoCode = null;
        promoDiscount = 0;
        
        // Save order to localStorage
        saveOrder(orderNumber, deliveryDateStr);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3000);
}

function saveOrder(orderNumber, deliveryDate) {
    const order = {
        orderNumber: orderNumber,
        items: bagItemsObjects,
        deliveryDate: deliveryDate,
        orderDate: new Date().toISOString(),
        promoCode: appliedPromoCode,
        promoDiscount: promoDiscount
    };

    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

function showRecommendations() {
    const recommendedSection = document.getElementById('recommendedSection');
    const recommendedGrid = document.getElementById('recommendedGrid');

    if (!recommendedSection || !recommendedGrid || bagItemsObjects.length === 0) return;

    // Get random artworks that aren't in cart
    const availableArtworks = artworks.filter(art => !iartwork.includes(art.id));
    const recommendations = availableArtworks
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    if (recommendations.length > 0) {
        recommendedSection.style.display = 'block';
        
        let html = '';
        recommendations.forEach(art => {
            let discount = (art.original_price * art.discount_percentage) / 100;
            let price = Math.round(art.original_price - discount);
            
            html += `
            <div class="recommended-item" onclick="addToCartFromRecommendation(${art.id})">
                <img src="${art.image}" alt="${art.title}">
                <h4>${art.title}</h4>
                <p class="price">₹${price}</p>
            </div>`;
        });
        
        recommendedGrid.innerHTML = html;
    }
}

function addToCartFromRecommendation(itemId) {
    if (!iartwork.includes(itemId)) {
        iartwork.push(itemId);
        localStorage.setItem('iartwork', JSON.stringify(iartwork));
        loadbagItemsObjects();
        displayBagIcon();
        displayBagItems();
        displayBagSummary();
        showRecommendations();
        showNotification('Item added to cart!', 'success');
    } else {
        showNotification('Item already in cart', 'info');
    }
}

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

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

// Add animation styles
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);