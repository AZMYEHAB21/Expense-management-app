/**
 * Main App Module
 * Initializes the application and handles main events
 */

const App = {
    init() {
        // Initialize storage
        Storage.init();

        // Apply saved theme
        UI.applyTheme();

        // Setup auth UI events
        this.setupAuthEvents();

        // Update active navigation
        UI.updateActiveNav();

        // Check if user is logged in
        if (Auth.isAuthenticated()) {
            this.showMainApp();
        } else {
            this.showAuthUI();
        }
    },

    /**
     * Setup authentication UI events
     */
    setupAuthEvents() {
        // Toggle between login and register forms
        const toggleAuth = document.getElementById('toggle-auth');
        toggleAuth?.addEventListener('click', () => {
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            
            loginForm.classList.toggle('hidden');
            registerForm.classList.toggle('hidden');
        });

        // Login form submission
        const loginForm = document.getElementById('login-form');
        loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form submission
        const registerForm = document.getElementById('register-form');
        registerForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn?.addEventListener('click', () => {
            this.handleLogout();
        });
    },

    /**
     * Setup hamburger menu for mobile
     */
    setupHamburgerMenu() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');

        // Toggle menu
        hamburgerBtn?.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('show');
            mobileMenuOverlay.classList.toggle('show');
            document.body.style.overflow = mobileMenu.classList.contains('show') ? 'hidden' : '';
        });

        // Close menu when clicking overlay
        mobileMenuOverlay?.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('show');
            mobileMenuOverlay.classList.remove('show');
            document.body.style.overflow = '';
        });

        // Close menu when clicking a menu item
        mobileMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('show');
                mobileMenuOverlay.classList.remove('show');
                document.body.style.overflow = '';
            });
        });
    },

    /**
     * Handle login
     */
    handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            Auth.login(email, password);
            UI.showToast('تم دخولك بنجاح', 'success');
            this.showMainApp();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },

    /**
     * Handle registration
     */
    handleRegister() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;

        try {
            Auth.register(name, email, password);
            UI.showToast('تم إنشاء الحساب بنجاح', 'success');
            this.showMainApp();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },

    /**
     * Handle logout
     */
    handleLogout() {
        if (confirm('هل تريد تسجيل الخروج؟')) {
            Auth.logout();
            UI.showToast('تم تسجيل خروجك', 'info');
            this.showAuthUI();
            
            // Clear forms
            document.getElementById('login-form').reset();
            document.getElementById('register-form').reset();
        }
    },

    /**
     * Show main app
     */
    showMainApp() {
        UI.setAuthVisible(false);
        UI.setMainVisible(true);
        
        // Update greeting and stats
        const user = Auth.getCurrentUser();
        UI.updateUserGreeting(user.name);
        UI.updateDashboardStats();
        UI.renderRecentTransactions();
        
        // Setup hamburger menu for mobile and update user info
        this.setupHamburgerMenu();
        UI.updateMobileMenuUserInfo();

        // Listen for mobile logout
        document.addEventListener('mobile-logout', () => {
            this.handleLogout();
        });
    },

    /**
     * Show auth UI
     */
    showAuthUI() {
        UI.setAuthVisible(true);
        UI.setMainVisible(false);
    },
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
