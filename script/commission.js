// Constants
const BUSINESS_NAME = "I Art Works";
const WHATSAPP_NUMBER = "916006202075"; // Enter number without '+' or spaces for API

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupFormValidation();
    setupFileUpload();
    displayBagIcon();
    setupWhatsAppFloating(); // Added this so the floating button appears
    setupRealTimeValidation(); // Added this to init the input listeners
});

// Display bag icon count
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

// Setup form validation and submission
function setupFormValidation() {
    const form = document.getElementById('commissionForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                submitCommissionRequest();
            }
        });
    }
}

// Validate form fields
function validateForm() {
    const requiredFields = [
        { id: 'full-name', name: 'Full Name' },
        { id: 'email', name: 'Email' },
        { id: 'portrait-type', name: 'Portrait Type' },
        { id: 'medium', name: 'Medium' },
        { id: 'size', name: 'Size' },
        { id: 'special-requests', name: 'Special Requests' }
    ];
    
    let isValid = true;
    let firstInvalidField = null;
    
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element && !element.value.trim()) {
            isValid = false;
            element.style.borderColor = '#f54e77';
            if (!firstInvalidField) {
                firstInvalidField = element;
            }
        } else if (element) {
            element.style.borderColor = '#ddd';
        }
    });
    
    // Validate email format
    const emailField = document.getElementById('email');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            isValid = false;
            emailField.style.borderColor = '#f54e77';
            showNotification('Please enter a valid email address', 'error');
            if (!firstInvalidField) {
                firstInvalidField = emailField;
            }
        }
    }
    
    if (!isValid) {
        if (firstInvalidField) {
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidField.focus();
        }
        showNotification('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

// Submit commission request
function submitCommissionRequest() {
    // Collect form data
    const formData = {
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value || 'Not provided',
        portraitType: document.getElementById('portrait-type').value,
        medium: document.getElementById('medium').value,
        size: document.getElementById('size').value,
        budget: document.getElementById('budget').value || 'Not specified',
        timeline: document.getElementById('timeline').value || 'Flexible',
        specialRequests: document.getElementById('special-requests').value,
        submittedAt: new Date().toLocaleString('en-IN')
    };
    
    // Store in localStorage
    let commissions = JSON.parse(localStorage.getItem('commissions') || '[]');
    commissions.push(formData);
    localStorage.setItem('commissions', JSON.stringify(commissions));
    
    // Send to WhatsApp
    sendCommissionToWhatsApp(formData);
    
    // Show success modal
    showSuccessModal();
    
    // Reset form
    document.getElementById('commissionForm').reset();
    
    // Clear file list
    const fileList = document.getElementById('file-list');
    if (fileList) {
        fileList.innerHTML = '';
    }
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('show');
        // Auto-scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Close success modal
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('show');
        // Redirect to home page after closing
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 500);
    }
}

// Setup file upload functionality
function setupFileUpload() {
    const fileInput = document.getElementById('reference-images');
    const fileList = document.getElementById('file-list');
    
    if (fileInput && fileList) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            
            // Limit to 5 files
            if (files.length > 5) {
                showNotification('Maximum 5 files allowed', 'error');
                fileInput.value = '';
                return;
            }
            
            // Display selected files
            fileList.innerHTML = '';
            files.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <span><i class="fa-solid fa-image"></i> ${file.name} (${formatFileSize(file.size)})</span>
                    <button type="button" onclick="removeFile(${index})"><i class="fa-solid fa-times"></i></button>
                `;
                fileList.appendChild(fileItem);
            });
        });
        
        // Drag and drop functionality
        const fileLabel = document.querySelector('.file-label');
        if (fileLabel) {
            fileLabel.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.borderColor = '#f54e77';
                this.style.background = '#fff';
            });
            
            fileLabel.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.style.borderColor = '#ddd';
                this.style.background = '#f9f9f9';
            });
            
            fileLabel.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = '#ddd';
                this.style.background = '#f9f9f9';
                
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 5) {
                    showNotification('Maximum 5 files allowed', 'error');
                    return;
                }
                
                // Trigger file input change
                const dataTransfer = new DataTransfer();
                files.forEach(file => dataTransfer.items.add(file));
                fileInput.files = dataTransfer.files;
                
                // Trigger change event
                fileInput.dispatchEvent(new Event('change'));
            });
        }
    }
}

// Remove file from selection
function removeFile(index) {
    const fileInput = document.getElementById('reference-images');
    
    if (fileInput) {
        const dataTransfer = new DataTransfer();
        const files = Array.from(fileInput.files);
        
        files.forEach((file, i) => {
            if (i !== index) {
                dataTransfer.items.add(file);
            }
        });
        
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const bgColor = type === 'error' ? '#f54e77' : '#2bb673';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 4000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles dynamically
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
`;
document.head.appendChild(style);

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeSuccessModal();
    }
});

// Setup Real-time validation
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#f54e77';
            } else {
                this.style.borderColor = '#ddd';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#f54e77';
        });
    });
}

// ========== WhatsApp Integration ==========

// Send commission details to WhatsApp
function sendCommissionToWhatsApp(formData) {
    // Format the message beautifully
    const message = `
🎨 *NEW COMMISSION REQUEST* 🎨

*Customer Details:*
━━━━━━━━━━━━━━━
👤 Name: ${formData.fullName}
📧 Email: ${formData.email}
📱 Phone: ${formData.phone}

*Artwork Requirements:*
━━━━━━━━━━━━━━━
🖼️ Portrait Type: ${formData.portraitType}
🎨 Medium: ${formData.medium}
📐 Size: ${formData.size}
💰 Budget: ${formData.budget}
⏰ Timeline: ${formData.timeline}

*Special Requests:*
━━━━━━━━━━━━━━━
${formData.specialRequests}

📅 *Submitted:* ${formData.submittedAt}

━━━━━━━━━━━━━━━
_Sent from ${BUSINESS_NAME} Commission Form_
`.trim();

    // Open WhatsApp with pre-filled message
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    // Open in new window/tab
    window.open(whatsappURL, '_blank');
}

// Setup WhatsApp floating button
function setupWhatsAppFloating() {
    // Create floating WhatsApp button if it doesn't exist
    if (!document.getElementById('whatsappFloat')) {
        const floatingBtn = document.createElement('a');
        floatingBtn.id = 'whatsappFloat';
        floatingBtn.className = 'whatsapp-float';
        floatingBtn.href = '#';
        floatingBtn.title = 'Chat on WhatsApp';
        floatingBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
        floatingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sendGeneralCommissionInquiry();
        });
        document.body.appendChild(floatingBtn);
        
        // Add floating button styles
        const floatStyle = document.createElement('style');
        floatStyle.textContent = `
            .whatsapp-float {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: #25D366;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                box-shadow: 0 5px 20px rgba(37, 211, 102, 0.5);
                z-index: 9999;
                transition: all 0.3s;
                animation: pulse 2s infinite;
                text-decoration: none;
            }
            .whatsapp-float:hover {
                transform: scale(1.1);
                box-shadow: 0 10px 30px rgba(37, 211, 102, 0.6);
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @media (max-width: 768px) {
                .whatsapp-float {
                    bottom: 20px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    font-size: 1.5rem;
                }
            }
        `;
        document.head.appendChild(floatStyle);
    }
}

// Send general commission inquiry
function sendGeneralCommissionInquiry() {
    const message = `Hi ${BUSINESS_NAME}! 👋

I'm interested in commissioning custom artwork.

Can you provide more details about:
• Available artists and their styles
• Pricing and timeline
• The commission process

Thank you!`;

    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

// Quick WhatsApp inquiry from page
function quickWhatsAppInquiry() {
    const message = `Hi ${BUSINESS_NAME}! 👋

I have a question about commissioning artwork.

Can you help me?`;

    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}
