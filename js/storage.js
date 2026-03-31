/**
 * Storage Module
 * Handles all localStorage operations for the expense manager app
 */

const Storage = {
    // Keys
    USERS_KEY: 'users',
    CURRENT_USER_KEY: 'currentUser',
    TRANSACTIONS_KEY: 'transactions',
    THEME_KEY: 'theme',
    EXPENSE_CATEGORIES_KEY: 'expenseCategories',
    INCOME_CATEGORIES_KEY: 'incomeCategories',

    /**
     * Initialize storage with default data if not exists
     */
    init() {
        if (!this.getUsers()) {
            this.setUsers([]);
        }
        if (!this.getTransactions()) {
            this.setTransactions([]);
        }
    },

    // ============ USERS ============

    /**
     * Get all users
     * @returns {Array} Array of user objects
     */
    getUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : null;
    },

    /**
     * Set all users
     * @param {Array} users - Array of user objects
     */
    setUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },

    /**
     * Add a new user
     * @param {Object} userData - User data {name, email, password}
     * @returns {Object} Created user object
     */
    createUser(userData) {
        const users = this.getUsers() || [];
        
        // Check if user already exists
        if (users.some(u => u.email === userData.email)) {
            throw new Error('البريد الإلكتروني موجود بالفعل');
        }

        const user = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In real app, this would be hashed
            createdAt: new Date().toISOString(),
        };

        users.push(user);
        this.setUsers(users);
        return user;
    },

    /**
     * Get user by email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Object|null} User object or null
     */
    authenticateUser(email, password) {
        const users = this.getUsers() || [];
        return users.find(u => u.email === email && u.password === password) || null;
    },

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Object|null} User object or null
     */
    getUserById(userId) {
        const users = this.getUsers() || [];
        return users.find(u => u.id === userId) || null;
    },

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updates - Fields to update
     */
    updateUser(userId, updates) {
        const users = this.getUsers() || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            this.setUsers(users);
            return users[userIndex];
        }
        return null;
    },

    // ============ CURRENT USER (Session) ============

    /**
     * Set current logged-in user
     * @param {Object} user - User object
     */
    setCurrentUser(user) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    },

    /**
     * Get current logged-in user
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        const user = localStorage.getItem(this.CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    /**
     * Clear current user (logout)
     */
    clearCurrentUser() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // ============ TRANSACTIONS ============

    /**
     * Get all transactions
     * @returns {Array} Array of transaction objects
     */
    getTransactions() {
        const transactions = localStorage.getItem(this.TRANSACTIONS_KEY);
        return transactions ? JSON.parse(transactions) : null;
    },

    /**
     * Set all transactions
     * @param {Array} transactions - Array of transaction objects
     */
    setTransactions(transactions) {
        localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
    },

    /**
     * Add a new transaction
     * @param {Object} transaction - Transaction data
     * @returns {Object} Created transaction
     */
    addTransaction(transaction) {
        const transactions = this.getTransactions() || [];
        
        const newTransaction = {
            id: Date.now().toString(),
            userId: this.getCurrentUser().id,
            title: transaction.title,
            amount: parseFloat(transaction.amount),
            category: transaction.category,
            type: transaction.type, // 'income' or 'expense'
            date: transaction.date,
            description: transaction.description || '',
            createdAt: new Date().toISOString(),
        };

        transactions.push(newTransaction);
        this.setTransactions(transactions);
        return newTransaction;
    },

    /**
     * Get transactions for current user
     * @returns {Array} User's transactions
     */
    getUserTransactions() {
        const transactions = this.getTransactions() || [];
        const currentUser = this.getCurrentUser();
        return transactions.filter(t => t.userId === currentUser.id);
    },

    /**
     * Update a transaction
     * @param {string} transactionId - Transaction ID
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated transaction or null
     */
    updateTransaction(transactionId, updates) {
        const transactions = this.getTransactions() || [];
        const index = transactions.findIndex(t => t.id === transactionId);
        
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...updates };
            this.setTransactions(transactions);
            return transactions[index];
        }
        return null;
    },

    /**
     * Delete a transaction
     * @param {string} transactionId - Transaction ID
     * @returns {boolean} Success status
     */
    deleteTransaction(transactionId) {
        const transactions = this.getTransactions() || [];
        const index = transactions.findIndex(t => t.id === transactionId);
        
        if (index !== -1) {
            transactions.splice(index, 1);
            this.setTransactions(transactions);
            return true;
        }
        return false;
    },

    /**
     * Get transactions with filters
     * @param {Object} filters - {type, category, startDate, endDate, search}
     * @returns {Array} Filtered transactions
     */
    getFilteredTransactions(filters) {
        let transactions = this.getUserTransactions();

        if (filters.type) {
            transactions = transactions.filter(t => t.type === filters.type);
        }

        if (filters.category) {
            transactions = transactions.filter(t => t.category === filters.category);
        }

        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            transactions = transactions.filter(t => new Date(t.date) >= startDate);
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59);
            transactions = transactions.filter(t => new Date(t.date) <= endDate);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            transactions = transactions.filter(t => 
                t.title.toLowerCase().includes(search) ||
                t.category.toLowerCase().includes(search) ||
                t.description.toLowerCase().includes(search)
            );
        }

        return transactions;
    },

    /**
     * Calculate totals
     * @returns {Object} {totalBalance, totalIncome, totalExpenses}
     */
    calculateTotals() {
        const transactions = this.getUserTransactions();
        
        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpenses += t.amount;
            }
        });

        return {
            totalBalance: totalIncome - totalExpenses,
            totalIncome: totalIncome,
            totalExpenses: totalExpenses,
        };
    },

    /**
     * Get category breakdown for current month
     * @returns {Array} Array of {category, total, count, percentage}
     */
    getCategoryBreakdown(type = 'expense') {
        const transactions = this.getUserTransactions();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && 
                   date.getFullYear() === currentYear &&
                   t.type === type;
        });

        const breakdown = {};
        
        monthTransactions.forEach(t => {
            if (!breakdown[t.category]) {
                breakdown[t.category] = { total: 0, count: 0 };
            }
            breakdown[t.category].total += t.amount;
            breakdown[t.category].count += 1;
        });

        const total = Object.values(breakdown).reduce((sum, item) => sum + item.total, 0);

        return Object.entries(breakdown).map(([category, data]) => ({
            category,
            total: data.total,
            count: data.count,
            percentage: total > 0 ? ((data.total / total) * 100).toFixed(1) : 0,
        })).sort((a, b) => b.total - a.total);
    },

    /**
     * Get monthly summary
     * @param {number} monthOffset - Months from now (0 = this month)
     * @returns {Object} Monthly summary
     */
    getMonthlySummary(monthOffset = 0) {
        const transactions = this.getUserTransactions();
        const date = new Date();
        date.setMonth(date.getMonth() + monthOffset);
        
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === month && tDate.getFullYear() === year;
        });

        let income = 0;
        let expenses = 0;

        monthTransactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expenses += t.amount;
            }
        });

        return {
            month: date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }),
            income,
            expenses,
            balance: income - expenses,
            transactionCount: monthTransactions.length,
        };
    },

    /**
     * Reset all data
     */
    resetAllData() {
        if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!')) {
            this.setTransactions([]);
            this.clearCurrentUser();
            return true;
        }
        return false;
    },

    // ============ THEME ============

    /**
     * Get theme preference
     * @returns {string} 'light' or 'dark'
     */
    getTheme() {
        return localStorage.getItem(this.THEME_KEY) || 'light';
    },

    /**
     * Set theme preference
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        localStorage.setItem(this.THEME_KEY, theme);
    },

    /**
     * Toggle theme
     * @returns {string} New theme
     */
    toggleTheme() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    },

    // ============ CUSTOM CATEGORIES ============

    /**
     * Get default expense categories
     * @returns {Array} Default categories
     */
    getDefaultExpenseCategories() {
        return ['الطعام والشراب', 'النقل', 'الملابس', 'الترفيه', 'الصحة', 'الغاز والكهرباء', 'الإيجار', 'التعليم', 'أخرى'];
    },

    /**
     * Get default income categories
     * @returns {Array} Default categories
     */
    getDefaultIncomeCategories() {
        return ['الراتب', 'مكافآت', 'استثمارات', 'العمل الحر', 'أخرى'];
    },

    /**
     * Get expense categories
     * @returns {Array} Expense categories
     */
    getExpenseCategories() {
        const categories = localStorage.getItem(this.EXPENSE_CATEGORIES_KEY);
        return categories ? JSON.parse(categories) : this.getDefaultExpenseCategories();
    },

    /**
     * Get income categories
     * @returns {Array} Income categories
     */
    getIncomeCategories() {
        const categories = localStorage.getItem(this.INCOME_CATEGORIES_KEY);
        return categories ? JSON.parse(categories) : this.getDefaultIncomeCategories();
    },

    /**
     * Add expense category
     * @param {string} category - Category name
     */
    addExpenseCategory(category) {
        if (!category || category.trim() === '') {
            throw new Error('اسم الفئة لا يمكن أن يكون فارغاً');
        }

        const categories = this.getExpenseCategories();
        if (categories.includes(category)) {
            throw new Error('هذه الفئة موجودة بالفعل');
        }

        categories.push(category);
        localStorage.setItem(this.EXPENSE_CATEGORIES_KEY, JSON.stringify(categories));
        return categories;
    },

    /**
     * Add income category
     * @param {string} category - Category name
     */
    addIncomeCategory(category) {
        if (!category || category.trim() === '') {
            throw new Error('اسم الفئة لا يمكن أن يكون فارغاً');
        }

        const categories = this.getIncomeCategories();
        if (categories.includes(category)) {
            throw new Error('هذه الفئة موجودة بالفعل');
        }

        categories.push(category);
        localStorage.setItem(this.INCOME_CATEGORIES_KEY, JSON.stringify(categories));
        return categories;
    },

    /**
     * Remove expense category
     * @param {string} category - Category name
     */
    removeExpenseCategory(category) {
        const categories = this.getExpenseCategories();
        const filtered = categories.filter(c => c !== category);
        
        if (filtered.length === categories.length) {
            throw new Error('الفئة غير موجودة');
        }

        localStorage.setItem(this.EXPENSE_CATEGORIES_KEY, JSON.stringify(filtered));
        return filtered;
    },

    /**
     * Remove income category
     * @param {string} category - Category name
     */
    removeIncomeCategory(category) {
        const categories = this.getIncomeCategories();
        const filtered = categories.filter(c => c !== category);
        
        if (filtered.length === categories.length) {
            throw new Error('الفئة غير موجودة');
        }

        localStorage.setItem(this.INCOME_CATEGORIES_KEY, JSON.stringify(filtered));
        return filtered;
    },

    /**
     * Reset categories to defaults
     */
    resetCategories() {
        localStorage.removeItem(this.EXPENSE_CATEGORIES_KEY);
        localStorage.removeItem(this.INCOME_CATEGORIES_KEY);
    },

    // ============ IMPORT/EXPORT ============

    /**
     * Export all user data as JSON
     * @returns {Object} Exported data
     */
    exportData() {
        const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
        const userId = currentUser ? JSON.parse(currentUser).id : null;

        if (!userId) {
            throw new Error('لا يوجد مستخدم مسجل الدخول');
        }

        const transactions = this.getUserTransactions();
        const user = this.getUserById(userId);
        const expenseCategories = localStorage.getItem(this.EXPENSE_CATEGORIES_KEY);
        const incomeCategories = localStorage.getItem(this.INCOME_CATEGORIES_KEY);

        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            transactions: transactions,
            categories: {
                expenses: expenseCategories ? JSON.parse(expenseCategories) : this.getDefaultExpenseCategories(),
                income: incomeCategories ? JSON.parse(incomeCategories) : this.getDefaultIncomeCategories(),
            },
        };
    },

    /**
     * Import data from JSON
     * @param {Object} data - Imported data
     */
    importData(data) {
        if (!data || !data.transactions || !Array.isArray(data.transactions)) {
            throw new Error('صيغة البيانات غير صحيحة');
        }

        const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
        if (!currentUser) {
            throw new Error('يجب تسجيل الدخول أولاً');
        }

        const userId = JSON.parse(currentUser).id;
        const transactions = this.getUserTransactions() || [];

        // Merge transactions
        const importedTransactions = data.transactions.map(t => ({
            ...t,
            id: t.id || Date.now().toString() + Math.random(),
            userId: userId,
        }));

        const allTransactions = [...transactions, ...importedTransactions];
        this.setUserTransactions(allTransactions);

        // Import categories if provided
        if (data.categories) {
            if (data.categories.expenses && Array.isArray(data.categories.expenses)) {
                const existing = this.getExpenseCategories();
                const newCategories = [...new Set([...existing, ...data.categories.expenses])];
                localStorage.setItem(this.EXPENSE_CATEGORIES_KEY, JSON.stringify(newCategories));
            }

            if (data.categories.income && Array.isArray(data.categories.income)) {
                const existing = this.getIncomeCategories();
                const newCategories = [...new Set([...existing, ...data.categories.income])];
                localStorage.setItem(this.INCOME_CATEGORIES_KEY, JSON.stringify(newCategories));
            }
        }

        return {
            transactionsImported: importedTransactions.length,
            totalTransactions: allTransactions.length,
        };
    },

    /**
     * Download data as JSON file
     */
    downloadDataAsFile() {
        const data = this.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expense-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Clear all user data
     */
    clearAllData() {
        const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
        if (!currentUser) {
            throw new Error('لا يوجد مستخدم مسجل الدخول');
        }

        const userId = JSON.parse(currentUser).id;
        const transactions = this.getTransactions() || [];
        
        // Keep only other users' transactions
        const filtered = transactions.filter(t => t.userId !== userId);
        this.setTransactions(filtered);
    },
};
