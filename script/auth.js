// Authentication Manager Class
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'iartworks_user';
        this.usersKey = 'iartworks_users';
        this.init();
    }

    init() {
        console.log('Auth Manager Initializing...');
        this.loadCurrentUser();
        this.setupEventListeners();
        this.updateUI();
    }

    // Load current user from localStorage
    loadCurrentUser() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.currentUser = JSON.parse(saved);
            console.log('User loaded:', this.currentUser.email);
        }
    }

    // Save current user to localStorage
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem(this.storageKey);
        }
    }

    // Get all users from localStorage
    getAllUsers() {
        const saved = localStorage.getItem(this.usersKey);
        return saved ? JSON.parse(saved) : [];
    }

    // Save all users to localStorage
    saveAllUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Register new user
    register(userData) {
        const { fullName, email, password, phone } = userData;

        // Validation
        if (!this.validateEmail(email)) {
            return { success: false, message: 'Invalid email address' };
        }

        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        // Check if user already exists
        const users = this.getAllUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            id: this.generateId(),
            fullName,
            email,
            password: this.hashPassword(password), // In production, use proper hashing
            phone: phone || '',
            createdAt: new Date().toISOString(),
            orders: [],
            addresses: [],
            wishlist: [],
            cart: []
        };

        // Save user
        users.push(newUser);
        this.saveAllUsers(users);

        // Auto login
        this.currentUser = { ...newUser };
        delete this.currentUser.password; // Don't store password in current session
        this.saveCurrentUser();
        this.updateUI();

        console.log('User registered:', email);
        return { success: true, message: 'Account created successfully!', user: this.currentUser };
    }

    // Login user
    login(email, password, remember = false) {
        // Validation
        if (!email || !password) {
            return { success: false, message: 'Email and password are required' };
        }

        // Find user
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Check password
        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Login successful
        this.currentUser = { ...user };
        delete this.currentUser.password;
        this.saveCurrentUser();
        this.updateUI();

        console.log('User logged in:', email);
        return { success: true, message: 'Login successful!', user: this.currentUser };
    }

    // Logout user
    logout() {
        this.currentUser = null;
        this.saveCurrentUser();
        this.updateUI();
        console.log('User logged out');
        
        // Redirect to home if on protected page
        if (window.location.pathname.includes('dashboard') || 
            window.location.pathname.includes('profile')) {
            window.location.href = '../index.html';
        }
    }

    // Update user profile
    updateProfile(updates) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }

        // Update current user
        this.currentUser = { ...this.currentUser, ...updates };
        this.saveCurrentUser();

        // Update in users list
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === this.currentUser.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.saveAllUsers(users);
        }

        console.log('updated');
        return { success: true, message: 'Profile updated successfully!' };
    }

    // Change password
    changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }

        const users = this.getAllUsers();
        const user = users.find(u => u.id === this.currentUser.id);

        if (!user || user.password !== this.hashPassword(currentPassword)) {
            return { success: false, message: 'Current password is incorrect' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'New password must be at least 6 characters' };
        }

        // Update password
        user.password = this.hashPassword(newPassword);
        this.saveAllUsers(users);

        console.log('Password changed');
        return { success: true, message: 'Password changed successfully!' };
    }

    // Update UI based on auth state
    updateUI() {
        const profileBtn = document.getElementById('profileBtn');
        if (!profileBtn) return;

        if (this.isLoggedIn()) {
            // Show user menu
            profileBtn.innerHTML = `
                <span class="material-symbols-outlined action_icon">account_circle</span>
                <span class="action_name">${this.getFirstName()}</span>
            `;
            
            // Remove old click handler and add new one
            const newProfileBtn = profileBtn.cloneNode(true);
            profileBtn.parentNode.replaceChild(newProfileBtn, profileBtn);
            
            newProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleUserDropdown();
            });
        } else {
            // Show login button
            profileBtn.innerHTML = `
                <span class="material-symbols-outlined action_icon">person</span>
                <span class="action_name">Login</span>
            `;
            
            // Remove old click handler and add new one
            const newProfileBtn = profileBtn.cloneNode(true);
            profileBtn.parentNode.replaceChild(newProfileBtn, profileBtn);
            
            newProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal('login');
            });
        }
    }

    // Get first name from full name
    getFirstName() {
        if (!this.currentUser) return '';
        return this.currentUser.fullName.split(' ')[0];
    }

    // Get user initials
    getUserInitials() {
        if (!this.currentUser) return '??';
        const names = this.currentUser.fullName.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return names[0].substring(0, 2).toUpperCase();
    }

    // Toggle user dropdown
    toggleUserDropdown() {
        let dropdown = document.querySelector('.user-profile-dropdown');
        
        if (!dropdown) {
            dropdown = this.createUserDropdown();
            document.body.appendChild(dropdown);
        }
        
        dropdown.classList.toggle('show');
        
        // Close on outside click
        if (dropdown.classList.contains('show')) {
            setTimeout(() => {
                document.addEventListener('click', this.closeDropdownOnOutsideClick);
            }, 10);
        }
    }

    // Create user dropdown menu
    createUserDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'user-profile-dropdown';
        dropdown.style.position = 'fixed';
        dropdown.style.top = '90px';
        dropdown.style.right = '3rem';
        
        dropdown.innerHTML = `
            <div class="dropdown-header">
                <div class="user-avatar">${this.getUserInitials()}</div>
                <div class="user-name">${this.currentUser.fullName}</div>
                <div class="user-email">${this.currentUser.email}</div>
            </div>
            <div class="dropdown-menu">
                <a href="pages/dashboard.html" class="dropdown-item">
                    <span class="material-symbols-outlined">dashboard</span>
                    <span>Dashboard</span>
                </a>
                <a href="pages/profile.html" class="dropdown-item">
                    <span class="material-symbols-outlined">person</span>
                    <span>My Profile</span>
                </a>
                <a href="pages/orders.html" class="dropdown-item">
                    <span class="material-symbols-outlined">shopping_bag</span>
                    <span>My Orders</span>
                </a>
                <a href="pages/wishlist.html" class="dropdown-item">
                    <span class="material-symbols-outlined">favorite</span>
                    <span>Wishlist</span>
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item" onclick="authManager.showAuthModal('settings'); return false;">
                    <span class="material-symbols-outlined">settings</span>
                    <span>Settings</span>
                </a>
            </div>
            <div class="dropdown-footer">
                <button class="logout-btn" onclick="authManager.logout()">
                    <span class="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                </button>
            </div>
        `;
        
        return dropdown;
    }

    // Close dropdown on outside click
    closeDropdownOnOutsideClick = (e) => {
        const dropdown = document.querySelector('.user-profile-dropdown');
        const profileBtn = document.getElementById('profileBtn');
        
        if (dropdown && !dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
            dropdown.classList.remove('show');
            document.removeEventListener('click', this.closeDropdownOnOutsideClick);
        }
    }

    // Show auth modal
    showAuthModal(mode = 'login') {
        let modal = document.getElementById('authModal');
        
        if (!modal) {
            modal = this.createAuthModal();
            document.body.appendChild(modal);
        }
        
        this.switchAuthMode(mode);
        modal.classList.add('show');
    }

    // Create auth modal
    createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'auth-modal';
        
        modal.innerHTML = `
            <div class="auth-container">
                <button class="auth-close" onclick="authManager.closeAuthModal()">&times;</button>
                
                <div class="auth-header">
                    <div class="auth-logo">ITY</div>
                    <h2 id="authTitle">Welcome Back</h2>
                    <p id="authSubtitle">Sign in to your account</p>
                </div>
                
                <div class="auth-body">
                    <div id="authMessage" class="auth-message"></div>
                    
                    <!-- Login Form -->
                    <form id="loginForm" class="auth-form active" onsubmit="authManager.handleLogin(event)">
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" placeholder="your@email.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" name="password" id="loginPassword" placeholder="Enter your password" required>
                            <button type="button" class="password-toggle" onclick="authManager.togglePassword('loginPassword')">
                                <span class="material-symbols-outlined">visibility</span>
                            </button>
                        </div>
                        
                        <div class="form-options">
                            <label class="remember-me">
                                <input type="checkbox" name="remember">
                                <span>Remember me</span>
                            </label>
                            <a href="#" class="forgot-password" onclick="authManager.showAuthModal('forgot'); return false;">Forgot password?</a>
                        </div>
                        
                        <button type="submit" class="auth-submit-btn">Sign In</button>
                    </form>
                    
                    <!-- Register Form -->
                    <form id="registerForm" class="auth-form" onsubmit="authManager.handleRegister(event)">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="fullName" placeholder="John Doe" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" placeholder="your@email.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Phone Number (Optional)</label>
                            <input type="tel" name="phone" placeholder="+1 234 567 8900">
                        </div>
                        
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" name="password" id="registerPassword" placeholder="At least 6 characters" required>
                            <button type="button" class="password-toggle" onclick="authManager.togglePassword('registerPassword')">
                                <span class="material-symbols-outlined">visibility</span>
                            </button>
                        </div>
                        
                        <button type="submit" class="auth-submit-btn">Create Account</button>
                    </form>
                    
                    <!-- Social Login -->
                    <div class="social-login">
                        <div class="social-divider"><span>Or continue with</span></div>
                        <div class="social-buttons">
                            <button class="social-btn" onclick="authManager.socialLogin('google')">
                                <span>🔍</span> Google
                            </button>
                            <button class="social-btn" onclick="authManager.socialLogin('facebook')">
                                <span>📘</span> Facebook
                            </button>
                        </div>
                    </div>
                    
                    <div class="auth-toggle">
                        <span id="authToggleText">Don't have an account?</span>
                        <a href="#" id="authToggleLink" onclick="authManager.toggleAuthMode(); return false;">Sign Up</a>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    // Close auth modal
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // Switch between login/register
    switchAuthMode(mode) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const title = document.getElementById('authTitle');
        const subtitle = document.getElementById('authSubtitle');
        const toggleText = document.getElementById('authToggleText');
        const toggleLink = document.getElementById('authToggleLink');
        
        if (mode === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
            title.textContent = 'Welcome Back';
            subtitle.textContent = 'Sign in to your account';
            toggleText.textContent = "Don't have an account?";
            toggleLink.textContent = 'Sign Up';
        } else {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
            title.textContent = 'Create Account';
            subtitle.textContent = 'Join I-ArtWorks today';
            toggleText.textContent = 'Already have an account?';
            toggleLink.textContent = 'Sign In';
        }
        
        this.hideMessage();
    }

    // Toggle between login and register
    toggleAuthMode() {
        const loginForm = document.getElementById('loginForm');
        const isLogin = loginForm.classList.contains('active');
        this.switchAuthMode(isLogin ? 'register' : 'login');
    }

    // Handle login form submission
    handleLogin(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember') === 'on';
        
        const result = this.login(email, password, remember);
        
        if (result.success) {
            this.showMessage(result.message, 'success');
            setTimeout(() => {
                this.closeAuthModal();
                form.reset();
            }, 1000);
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    // Handle register form submission
    handleRegister(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const userData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone')
        };
        
        const result = this.register(userData);
        
        if (result.success) {
            this.showMessage(result.message, 'success');
            setTimeout(() => {
                this.closeAuthModal();
                form.reset();
            }, 1000);
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    // Show message in modal
    showMessage(message, type = 'success') {
        const messageEl = document.getElementById('authMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `auth-message ${type} show`;
        }
    }

    // Hide message
    hideMessage() {
        const messageEl = document.getElementById('authMessage');
        if (messageEl) {
            messageEl.classList.remove('show');
        }
    }

    // Toggle password visibility
    togglePassword(fieldId) {
        const field = document.getElementById(fieldId);
        const button = field.parentElement.querySelector('.password-toggle');
        const icon = button.querySelector('.material-symbols-outlined');
        
        if (field.type === 'password') {
            field.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            field.type = 'password';
            icon.textContent = 'visibility';
        }
    }

    // Social login (placeholder)
    socialLogin(provider) {
        alert(`Social login with ${provider} will be implemented with backend integration.`);
    }

    // Utility functions
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    hashPassword(password) {
        // Simple hash for demo - use proper hashing in production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Setup event listeners
    setupEventListeners() {
        // Close modal on outside click
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('authModal');
            if (modal && e.target === modal) {
                this.closeAuthModal();
            }
        });
        
        // Close modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAuthModal();
                const dropdown = document.querySelector('.user-profile-dropdown');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
            }
        });
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for global use
if (typeof window !== 'undefined') {
    window.authManager = authManager;
}
