// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupFormValidation();
    setupFileUpload();
    displayBagIcon();
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
        phone: document.getElementById('phone').value,
        portraitType: document.getElementById('portrait-type').value,
        medium: document.getElementById('medium').value,
        size: document.getElementById('size').value,
        budget: document.getElementById('budget').value,
        timeline: document.getElementById('timeline').value,
        specialRequests: document.getElementById('special-requests').value,
        submittedAt: new Date().toISOString()
    };
    
    // Store in localStorage (in production, send to server)
    let commissions = JSON.parse(localStorage.getItem('commissions') || '[]');
    commissions.push(formData);
    localStorage.setItem('commissions', JSON.stringify(commissions));
    
    // Show success modal
    showSuccessModal();
    
    // Reset form
    document.getElementById('commissionForm').reset();
    
    // Clear file list
    const fileList = document.getElementById('file-list');
    if (fileList) {
        fileList.innerHTML = '';
    }
    
    // Send confirmation email (simulated)
    console.log('Commission request submitted:', formData);
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
    const fileList = document.getElementById('file-list');
    
    if (fileInput && fileList) {
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

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeSuccessModal();
    }
});

// Add real-time validation feedback
document.addEventListener('DOMContentLoaded', function() {
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
});
console.log("commission.js loaded");