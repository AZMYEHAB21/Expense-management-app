/**
 * UI Module
 * Handles UI updates, notifications, and interactions
 */

const UI = {
    /**
     * Show/hide auth container
     * @param {boolean} show - Show or hide
     */
    setAuthVisible(show) {
        const authContainer = document.getElementById('auth-container');
        if (show) {
            authContainer.classList.remove('hidden');
        } else {
            authContainer.classList.add('hidden');
        }
    },

    /**
     * Show/hide main app container
     * @param {boolean} show - Show or hide
     */
    setMainVisible(show) {
        const mainContainer = document.getElementById('main-container');
        if (show) {
            mainContainer.classList.remove('hidden');
        } else {
            mainContainer.classList.add('hidden');
        }
    },

    /**
     * Show toast notification
     * @param {string} message - Message text
     * @param {string} type - 'success', 'error', 'info'
     * @param {number} duration - Duration in ms
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    /**
     * Format currency
     * @param {number} amount - Amount
     * @param {string} currency - Currency code (default: EGP)
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = 'EGP') {
        // Format number with thousands separator
        const formatted = new Intl.NumberFormat('ar-EG', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
        return formatted;
    },

    /**
     * Format date
     * @param {string} dateString - Date string
     * @param {string} format - Date format
     * @returns {string} Formatted date
     */
    formatDate(dateString, format = 'short') {
        const date = new Date(dateString);
        const options = {
            'short': { month: 'short', day: 'numeric' },
            'long': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            'date': { year: 'numeric', month: '2-digit', day: '2-digit' },
        };
        
        return date.toLocaleDateString('ar-SA', options[format] || options.short);
    },

    /**
     * Get category icon
     * @param {string} category - Category name
     * @returns {string} Icon emoji
     */
    getCategoryIcon(category) {
        const icons = {
            'الطعام': '🍽️',
            'الفواتير': '📄',
            'المواصلات': '🚗',
            'الترفيه': '🎬',
            'التسوق': '🛍️',
            'الصحة': '⚕️',
            'التعليم': '📚',
            'العمل': '💼',
            'الإيجار': '🏠',
            'أخرى': '🏷️',
            'الراتب': '💰',
            'الاستثمار': '📈',
            'الهدايا': '🎁',
        };
        
        return icons[category] || '💳';
    },

    /**
     * Update user greeting and date
     * @param {string} userName - User name
     */
    updateUserGreeting(userName) {
        const greeting = document.getElementById('user-greeting');
        const hour = new Date().getHours();
        let greeting_text = '';

        if (hour < 12) {
            greeting_text = 'صباح الخير';
        } else if (hour < 18) {
            greeting_text = 'مساء الخير';
        } else {
            greeting_text = 'تصبح على خير';
        }

        greeting.textContent = `${greeting_text}, ${userName}`;
        
        // Update header date
        this.updateHeaderDate();
    },

    /**
     * Update header with today's date
     */
    updateHeaderDate() {
        const dateElement = document.getElementById('header-date');
        if (dateElement) {
            const today = new Date();
            const dateString = today.toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            dateElement.textContent = dateString;
        }
    },

    /**
     * Update mobile menu user info
     */
    updateMobileMenuUserInfo() {
        try {
            const user = Auth.getCurrentUser();
            const avatarElement = document.getElementById('mobile-user-avatar');
            const nameElement = document.getElementById('mobile-user-name');
            const emailElement = document.getElementById('mobile-user-email');

            if (user && avatarElement && nameElement && emailElement) {
                // Set avatar to first letter
                const firstLetter = user.name.charAt(0).toUpperCase();
                avatarElement.textContent = firstLetter;

                // Set name and email
                nameElement.textContent = user.name;
                emailElement.textContent = user.email;

                // Add mobile logout functionality
                const logoutBtn = document.getElementById('mobile-logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        // Trigger logout from app
                        const logoutEvent = new Event('mobile-logout');
                        document.dispatchEvent(logoutEvent);
                    });
                }
            }
        } catch (error) {
            console.error('Error updating mobile menu user info:', error);
        }
    },

    /**
     * Render expense categories
     */
    renderExpenseCategories() {
        const container = document.getElementById('expense-categories-list');
        if (!container) return;

        const categories = Storage.getExpenseCategories();
        const defaults = Storage.getDefaultExpenseCategories();

        container.innerHTML = categories.map(cat => `
            <div style="background: var(--background); padding: 8px 12px; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span style="flex: 1;">${cat}</span>
                ${!defaults.includes(cat) ? `<button class="remove-category-btn" data-type="expense" data-category="${cat}" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 14px; padding: 0;">✕</button>` : ''}
            </div>
        `).join('');

        // Add remove event listeners
        container.querySelectorAll('.remove-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.removeCategory('expense', category);
            });
        });
    },

    /**
     * Render income categories
     */
    renderIncomeCategories() {
        const container = document.getElementById('income-categories-list');
        if (!container) return;

        const categories = Storage.getIncomeCategories();
        const defaults = Storage.getDefaultIncomeCategories();

        container.innerHTML = categories.map(cat => `
            <div style="background: var(--background); padding: 8px 12px; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span style="flex: 1;">${cat}</span>
                ${!defaults.includes(cat) ? `<button class="remove-category-btn" data-type="income" data-category="${cat}" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 14px; padding: 0;">✕</button>` : ''}
            </div>
        `).join('');

        // Add remove event listeners
        container.querySelectorAll('.remove-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.removeCategory('income', category);
            });
        });
    },

    /**
     * Remove category
     */
    removeCategory(type, category) {
        try {
            if (type === 'expense') {
                Storage.removeExpenseCategory(category);
            } else {
                Storage.removeIncomeCategory(category);
            }
            this.showToast('تم حذف الفئة بنجاح', 'success');
            
            if (type === 'expense') {
                this.renderExpenseCategories();
            } else {
                this.renderIncomeCategories();
            }
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    },

    /**
     * Render category breakdown with progress bars
     */
    renderCategoryBreakdown(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || Object.keys(data).length === 0) {
            if (container) {
                container.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-secondary);">لا توجد بيانات</div>';
            }
            return;
        }

        const total = Object.values(data).reduce((a, b) => a + b, 0);
        const sortedData = Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        container.innerHTML = sortedData.map(([category, amount]) => {
            const percentage = Math.round((amount / total) * 100);
            const color = this.getCategoryColor(category);
            
            return `
                <div class="category-item">
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span class="category-name">${category}</span>
                            <span class="category-amount">${this.formatCurrency(amount)}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%; background: ${color};" title="${percentage}%"></div>
                        </div>
                        <div style="text-align: right; font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${percentage}%</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Get color for category
     */
    getCategoryColor(category) {
        const colors = [
            '#1E88E5', '#42A5F5', '#64B5F6', '#90CAF9',
            '#00C853', '#26A69A', '#26C6DA', '#00BCD4',
            '#FFA726', '#FF7043', '#FF5722', '#E53935'
        ];
        const hash = category.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        return colors[hash % colors.length];
    },

    /**
     * Render yearly chart
     */
    renderYearlyChart(monthlyData) {
        const container = document.getElementById('yearly-chart');
        if (!container) return;

        const maxValue = Math.max(...Object.values(monthlyData), 1);
        const scale = 200 / maxValue;

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(40px, 1fr)); gap: 8px;">
                ${Object.entries(monthlyData).map(([month, value]) => {
                    const height = Math.max(value * scale, 10);
                    return `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                            <div style="width: 100%; height: ${height}px; background: linear-gradient(180deg, var(--primary) 0%, var(--primary-light) 100%); border-radius: 4px; cursor: pointer; transition: all 0.3s ease;" 
                                 title="${this.formatCurrency(value)}"
                                 onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(30, 136, 229, 0.3)';"
                                 onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                            </div>
                            <span style="font-size: 11px; color: var(--text-secondary); text-align: center;">${month}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Check password strength
     */
    checkPasswordStrength(password) {
        let strength = 0;
        const requirements = {
            length8: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        };

        // Calculate strength
        if (requirements.length8) strength++;
        if (requirements.hasUpperCase) strength++;
        if (requirements.hasLowerCase) strength++;
        if (requirements.hasNumbers) strength++;
        if (requirements.hasSpecialChar) strength++;

        let level = 'weak';
        if (strength >= 4) level = 'very-strong';
        else if (strength >= 3) level = 'strong';
        else if (strength >= 2) level = 'medium';

        return { strength, level, requirements };
    },

    /**
     * Render password strength indicator
     */
    renderPasswordStrength(password, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!password) {
            container.innerHTML = '';
            return;
        }

        const { strength, level, requirements } = this.checkPasswordStrength(password);
        const strengthText = {
            'weak': 'ضعيفة جداً',
            'medium': 'متوسطة',
            'strong': 'قوية',
            'very-strong': 'قوية جداً'
        }[level];

        const bars = Array(4).fill(0).map((_, i) => `
            <div class="strength-bar ${i < strength ? level : ''}"></div>
        `).join('');

        container.innerHTML = `
            <div class="password-strength-container">
                <div class="password-strength-bars">
                    ${bars}
                </div>
                <div class="password-strength-text">
                    <span class="strength-indicator ${level}"></span>
                    <span>قوة كلمة المرور: ${strengthText}</span>
                </div>
                <div class="password-requirements">
                    <div class="requirement ${requirements.length8 ? 'met' : ''}">
                        <span class="requirement-icon">${requirements.length8 ? '✓' : ''}</span>
                        <span>8 أحرف على الأقل</span>
                    </div>
                    <div class="requirement ${requirements.hasUpperCase ? 'met' : ''}">
                        <span class="requirement-icon">${requirements.hasUpperCase ? '✓' : ''}</span>
                        <span>حرف كبير (A-Z)</span>
                    </div>
                    <div class="requirement ${requirements.hasLowerCase ? 'met' : ''}">
                        <span class="requirement-icon">${requirements.hasLowerCase ? '✓' : ''}</span>
                        <span>حرف صغير (a-z)</span>
                    </div>
                    <div class="requirement ${requirements.hasNumbers ? 'met' : ''}">
                        <span class="requirement-icon">${requirements.hasNumbers ? '✓' : ''}</span>
                        <span>رقم (0-9)</span>
                    </div>
                    <div class="requirement ${requirements.hasSpecialChar ? 'met' : ''}">
                        <span class="requirement-icon">${requirements.hasSpecialChar ? '✓' : ''}</span>
                        <span>رمز خاص (!@#$%^&*)</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Update dashboard stats
     */
    updateDashboardStats() {
        const totals = Storage.calculateTotals();

        const balanceEl = document.getElementById('total-balance');
        const incomeEl = document.getElementById('total-income');
        const expensesEl = document.getElementById('total-expenses');

        balanceEl.textContent = this.formatCurrency(totals.totalBalance);
        incomeEl.textContent = this.formatCurrency(totals.totalIncome);
        expensesEl.textContent = this.formatCurrency(totals.totalExpenses);

        // Update color based on balance
        if (totals.totalBalance < 0) {
            balanceEl.parentElement.style.borderTopColor = '#F44336';
        } else {
            balanceEl.parentElement.style.borderTopColor = '#4CAF50';
        }
    },

    /**
     * Render recent transactions
     */
    renderRecentTransactions() {
        const container = document.getElementById('recent-transactions');
        const transactions = Storage.getUserTransactions()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>لا توجد معاملات</h3>
                    <p>ابدأ بإضافة أول معاملة لك الآن</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(t => `
            <div class="transaction-item">
                <div class="transaction-left">
                    <div class="transaction-icon">${this.getCategoryIcon(t.category)}</div>
                    <div class="transaction-info">
                        <h4>${t.title}</h4>
                        <p>${this.formatDate(t.date, 'short')}</p>
                    </div>
                </div>
                <span class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'} ${this.formatCurrency(t.amount)}
                </span>
            </div>
        `).join('');
    },

    /**
     * Render full transactions list
     * @param {Array} transactions - Transactions to render
     * @param {Function} onDelete - Delete callback
     * @param {Function} onEdit - Edit callback
     */
    renderTransactionsList(transactions, onDelete, onEdit) {
        const container = document.getElementById('transactions-list');
        
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>لا توجد معاملات</h3>
                    <p>جرب تغيير المرشحات أو أضف معاملة جديدة</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(t => `
            <div class="transaction-item">
                <div class="transaction-left">
                    <div class="transaction-icon">${this.getCategoryIcon(t.category)}</div>
                    <div class="transaction-info">
                        <h4>${t.title}</h4>
                        <p>${t.category} • ${this.formatDate(t.date, 'short')}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="transaction-amount ${t.type}">
                        ${t.type === 'income' ? '+' : '-'} ${this.formatCurrency(t.amount)}
                    </span>
                    <div class="transaction-actions">
                        <button class="transaction-btn edit-btn" data-id="${t.id}" title="تعديل">✏️</button>
                        <button class="transaction-btn delete-btn" data-id="${t.id}" title="حذف">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Attach event listeners
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                onEdit(id);
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (confirm('هل تريد حذف هذه المعاملة؟')) {
                    onDelete(id);
                }
            });
        });
    },

    /**
     * Get category options
     * @returns {Array} Category options
     */
    getCategoryOptions() {
        return Storage.getExpenseCategories();
    },

    /**
     * Get income categories
     * @returns {Array} Income categories
     */
    getIncomeCategories() {
        return Storage.getIncomeCategories();
    },

    /**
     * Get income category options
     * @returns {Array} Income categories
     */
    getIncomeCategories() {
        return [
            'الراتب',
            'الاستثمار',
            'الهدايا',
            'أخرى'
        ];
    },

    /**
     * Render category breakdown chart
     * @param {Array} breakdown - Category breakdown data
     */
    renderCategoryChart(breakdown) {
        const container = document.getElementById('category-chart');
        
        if (!container) return;

        if (breakdown.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>لا توجد بيانات لهذا الشهر</p>
                </div>
            `;
            return;
        }

        const maxValue = Math.max(...breakdown.map(b => b.total));

        container.innerHTML = breakdown.map(item => `
            <div class="category-item">
                <div class="category-label">${item.category}</div>
                <div class="category-bar">
                    <div class="category-bar-fill" style="width: ${(item.total / maxValue) * 100}%"></div>
                </div>
                <div class="category-value">${this.formatCurrency(item.total)}</div>
            </div>
        `).join('');
    },

    /**
     * Toggle dark mode with animation
     */
    toggleDarkMode() {
        const body = document.body;
        const theme = Storage.getTheme();
        const newTheme = theme === 'light' ? 'dark' : 'light';

        // Remove light-mode class to respect the transition
        body.classList.remove('light-mode');

        // Add animation class for smooth transition
        body.style.transition = 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

        if (newTheme === 'dark') {
            body.classList.add('dark-mode');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            document.documentElement.style.colorScheme = 'light';
        }

        Storage.setTheme(newTheme);
        
        // Dispatch custom event for other components to listen
        const event = new CustomEvent('themeChanged', { detail: { theme: newTheme } });
        document.dispatchEvent(event);

        return newTheme;
    },

    /**
     * Apply saved theme on page load
     */
    applyTheme() {
        const theme = Storage.getTheme();
        
        // Check system preference if no saved preference
        if (theme === 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // User system prefers dark, but app is set to light - respect app setting
        }

        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.body.classList.add('light-mode');
            document.documentElement.style.colorScheme = 'light';
        }

        // Listen for system preference changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Optionally auto-switch with system preference
                // This can be made configurable in settings
            });
        }
    },

    /**
     * Highlight current nav item
     */
    updateActiveNav() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    /**
     * Show loading state
     * @param {HTMLElement} button - Button element
     */
    showLoadingState(button) {
        if (!button) return;
        button.disabled = true;
        button.innerHTML = '<span class="spinner"></span> جاري...';
    },

    /**
     * Hide loading state
     * @param {HTMLElement} button - Button element
     * @param {string} originalText - Original button text
     */
    hideLoadingState(button, originalText) {
        if (!button) return;
        button.disabled = false;
        button.textContent = originalText;
    },
};
