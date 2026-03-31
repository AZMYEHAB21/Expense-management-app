/**
 * Authentication Module
 * Handles login, register, and session management
 */

const Auth = {
    /**
     * Register a new user
     * @param {string} name - Full name
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {Object} User object or throws error
     */
    register(name, email, password) {
        // Validation
        if (!name || !email || !password) {
            throw new Error('جميع الحقول مطلوبة');
        }

        if (password.length < 8) {
            throw new Error('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
        }

        // Check password strength
        const strengthCheck = this.validatePasswordStrength(password);
        if (!strengthCheck.isValid) {
            throw new Error(strengthCheck.message);
        }

        if (!this.isValidEmail(email)) {
            throw new Error('صيغة البريد الإلكتروني غير صحيحة');
        }

        try {
            const user = Storage.createUser({
                name,
                email,
                password,
            });

            // Auto-login after registration
            this.login(email, password);
            return user;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Login user
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {Object} User object or throws error
     */
    login(email, password) {
        // Validation
        if (!email || !password) {
            throw new Error('البريد الإلكتروني وكلمة المرور مطلوبة');
        }

        const user = Storage.authenticateUser(email, password);
        
        if (!user) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }

        // Set current user session
        Storage.setCurrentUser(user);
        return user;
    },

    /**
     * Logout current user
     */
    logout() {
        Storage.clearCurrentUser();
    },

    /**
     * Get current user
     * @returns {Object|null}
     */
    getCurrentUser() {
        return Storage.getCurrentUser();
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isAuthenticated() {
        return Storage.isLoggedIn();
    },

    /**
     * Validate email format
     * @param {string} email - Email address
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} {isValid, message}
     */
    validatePasswordStrength(password) {
        const requirements = {
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        };

        const metRequirements = Object.values(requirements).filter(Boolean).length;

        if (metRequirements < 3) {
            return {
                isValid: false,
                message: 'كلمة المرور يجب أن تحتوي على: أحرف كبيرة وصغيرة وأرقام و رمز خاص'
            };
        }

        return { isValid: true, message: '' };
    },

    /**
     * Update user profile
     * @param {Object} updates - Fields to update {name, email}
     * @returns {Object} Updated user
     */
    updateProfile(updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) throw new Error('لا يوجد مستخدم مسجل دخول');

        const updated = Storage.updateUser(currentUser.id, updates);
        Storage.setCurrentUser(updated);
        return updated;
    },
};
