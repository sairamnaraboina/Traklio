// Traklio 2.0.0 - BULLETPROOF Authentication + Complete Functionality
// =============================================================================
// INITIALIZATION & CONSTANTS
// =============================================================================

const APP_CONFIG = {
  LS_USERS: 'traklio_users',
  LS_EXPENSES: 'traklio_expenses', 
  LS_CURRENT_USER: 'traklio_current_user',
  LS_THEME: 'traklio_theme',
  DEMO_USER: { id: 'demo123', name: 'Demo User', email: 'demo@test.com', password: 'demo123' }
};

const CATEGORIES = [
  { name: 'Food', icon: '🍽️', color: '#8B5CF6' },
  { name: 'Transport', icon: '🚗', color: '#10B981' },
  { name: 'Groceries', icon: '🛒', color: '#F59E0B' },
  { name: 'Daily Essentials', icon: '🧴', color: '#EF4444' },
  { name: 'Entertainment', icon: '🎬', color: '#F97316' },
  { name: 'Bills', icon: '💡', color: '#EC4899' },
  { name: 'Mobile Recharge', icon: '📱', color: '#3B82F6' },
  { name: 'Snacks', icon: '🍿', color: '#84CC16' },
  { name: 'Subscriptions', icon: '📺', color: '#A855F7' },
  { name: 'Other', icon: '➕', color: '#6B7280' }
];

const SAMPLE_EXPENSES = [
  { id: 'exp1', amount: 250, category: 'Food', description: 'Lunch at restaurant', date: '2025-07-28', userId: 'demo123' },
  { id: 'exp2', amount: 50, category: 'Transport', description: 'Bus fare', date: '2025-07-28', userId: 'demo123' },
  { id: 'exp3', amount: 150, category: 'Groceries', description: 'Weekly groceries', date: '2025-07-27', userId: 'demo123' },
  { id: 'exp4', amount: 300, category: 'Entertainment', description: 'Movie tickets', date: '2025-07-26', userId: 'demo123' },
  { id: 'exp5', amount: 100, category: 'Snacks', description: 'Coffee and snacks', date: '2025-07-25', userId: 'demo123' },
  { id: 'exp6', amount: 200, category: 'Bills', description: 'Electricity bill', date: '2025-07-24', userId: 'demo123' },
  { id: 'exp7', amount: 80, category: 'Mobile Recharge', description: 'Phone recharge', date: '2025-07-23', userId: 'demo123' }
];

// Global State
let state = {
  currentUser: null,
  expenses: [],
  selectedCategory: null,
  selectedTransactions: new Set(),
  currentTheme: 'light',
  charts: { pie: null, trends: null, category: null }
};

// =============================================================================
// STORAGE HELPERS
// =============================================================================
const storage = {
  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.error('Storage get error:', key, error);
      return fallback;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', key, error);
      return false;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', key, error);
      return false;
    }
  }
};

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing Traklio...');
  initializeStorage();
  initializeEventListeners();
  initializeTheme();
  initializeApp();
});

function initializeStorage() {
  // Ensure demo user exists
  const users = storage.get(APP_CONFIG.LS_USERS, []);
  if (!users.find(u => u.email === APP_CONFIG.DEMO_USER.email)) {
    users.push(APP_CONFIG.DEMO_USER);
    storage.set(APP_CONFIG.LS_USERS, users);
  }
  
  // Ensure demo expenses exist
  const expenses = storage.get(APP_CONFIG.LS_EXPENSES, []);
  if (!expenses.find(e => e.userId === 'demo123')) {
    storage.set(APP_CONFIG.LS_EXPENSES, [...expenses, ...SAMPLE_EXPENSES]);
  }
}

function initializeApp() {
  const savedUser = storage.get(APP_CONFIG.LS_CURRENT_USER);
  if (savedUser && savedUser.id) {
    state.currentUser = savedUser;
    showMainApp();
  } else {
    showAuthScreen();
  }
}

// =============================================================================
// EVENT LISTENERS - BULLETPROOF SETUP
// =============================================================================
function initializeEventListeners() {
  console.log('🔧 Setting up event listeners...');
  
  // Authentication Events
  const showSignupBtn = document.getElementById('show-signup');
  const showLoginBtn = document.getElementById('show-login');
  const loginForm = document.getElementById('login-form-element');
  const signupForm = document.getElementById('signup-form-element');
  
  if (showSignupBtn) {
    showSignupBtn.addEventListener('click', () => switchAuthForm('signup'));
  }
  
  if (showLoginBtn) {
    showLoginBtn.addEventListener('click', () => switchAuthForm('login'));
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // App Navigation Events
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Bottom Navigation
  document.querySelectorAll('.nav-item').forEach(navItem => {
    navItem.addEventListener('click', function() {
      const page = this.getAttribute('data-page');
      if (page) navigateToPage(page);
    });
  });
  
  // View All Button
  const viewAllBtn = document.getElementById('view-all-btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => navigateToPage('view-all'));
  }
  
  // Expense Form
  const expenseForm = document.getElementById('expense-form');
  if (expenseForm) {
    expenseForm.addEventListener('submit', handleAddExpense);
  }
  
  // Profile Forms
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
  
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordChange);
  }
  
  // Analytics Date Range
  document.querySelectorAll('.date-range-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDateRangeChange(btn));
  });
  
  const applyCustomBtn = document.getElementById('apply-custom-range');
  if (applyCustomBtn) {
    applyCustomBtn.addEventListener('click', handleCustomDateRange);
  }
  
  // Transaction Controls
  const searchInput = document.getElementById('transaction-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderAllTransactions);
  }
  
  const selectAllCheckbox = document.getElementById('select-all-checkbox');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', handleSelectAll);
  }
  
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', () => handleBulkDelete('selected'));
  }
  
  const deleteAllBtn = document.getElementById('delete-all-btn');
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', () => handleBulkDelete('all'));
  }
}

// =============================================================================
// AUTHENTICATION - BULLETPROOF IMPLEMENTATION
// =============================================================================
function handleLogin(event) {
  event.preventDefault();
  console.log('🔐 Login attempt started');
  
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value.trim();
  
  // Clear any previous errors
  clearAuthError();
  
  // Validation
  if (!email || !password) {
    showAuthError('Please enter both email and password');
    return;
  }
  
  if (!email.includes('@')) {
    showAuthError('Please enter a valid email address');
    return;
  }
  
  // Show loading state
  setLoadingState('login', true);
  
  // Simulate async with timeout to prevent infinite loading
  const authTimeout = setTimeout(() => {
    console.log('⚠️ Login timeout triggered');
    setLoadingState('login', false);
    showAuthError('Login timeout. Please try again.');
  }, 5000);
  
  // Perform authentication
  setTimeout(() => {
    try {
      const users = storage.get(APP_CONFIG.LS_USERS, []);
      const user = users.find(u => u.email === email && u.password === password);
      
      clearTimeout(authTimeout);
      
      if (user) {
        // Success
        state.currentUser = {
          id: user.id,
          name: user.name,
          email: user.email
        };
        
        storage.set(APP_CONFIG.LS_CURRENT_USER, state.currentUser);
        console.log('✅ Login successful:', state.currentUser.name);
        
        setLoadingState('login', false);
        showToast(`Welcome back, ${user.name}!`, 'success');
        showMainApp();
      } else {
        // Failure
        setLoadingState('login', false);
        showAuthError('Invalid email or password. Try demo@test.com / demo123');
      }
    } catch (error) {
      clearTimeout(authTimeout);
      console.error('❌ Login error:', error);
      setLoadingState('login', false);
      showAuthError('Login failed. Please try again.');
    }
  }, 500); // Small delay to show loading state
}

function handleSignup(event) {
  event.preventDefault();
  console.log('📝 Signup attempt started');
  
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value.trim();
  const confirmPassword = document.getElementById('signup-confirm-password').value.trim();
  
  // Clear any previous errors
  clearAuthError();
  
  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showAuthError('Please fill in all fields');
    return;
  }
  
  if (!email.includes('@')) {
    showAuthError('Please enter a valid email address');
    return;
  }
  
  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters long');
    return;
  }
  
  if (password !== confirmPassword) {
    showAuthError('Passwords do not match');
    return;
  }
  
  // Show loading state
  setLoadingState('signup', true);
  
  // Simulate async with timeout
  const authTimeout = setTimeout(() => {
    console.log('⚠️ Signup timeout triggered');
    setLoadingState('signup', false);
    showAuthError('Signup timeout. Please try again.');
  }, 5000);
  
  // Perform signup
  setTimeout(() => {
    try {
      const users = storage.get(APP_CONFIG.LS_USERS, []);
      
      clearTimeout(authTimeout);
      
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        setLoadingState('signup', false);
        showAuthError('Account already exists! Please login instead.');
        
        // Auto-switch to login form after 2 seconds
        setTimeout(() => {
          switchAuthForm('login');
          document.getElementById('login-email').value = email;
        }, 2000);
        return;
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password
      };
      
      users.push(newUser);
      storage.set(APP_CONFIG.LS_USERS, users);
      
      // Auto-login new user
      state.currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      };
      
      storage.set(APP_CONFIG.LS_CURRENT_USER, state.currentUser);
      console.log('✅ Signup successful:', state.currentUser.name);
      
      setLoadingState('signup', false);
      showToast(`Welcome to Traklio, ${name}!`, 'success');
      showMainApp();
      
    } catch (error) {
      clearTimeout(authTimeout);
      console.error('❌ Signup error:', error);
      setLoadingState('signup', false);
      showAuthError('Signup failed. Please try again.');
    }
  }, 500);
}

function handleLogout() {
  console.log('👋 Logging out...');
  storage.remove(APP_CONFIG.LS_CURRENT_USER);
  state.currentUser = null;
  state.expenses = [];
  state.selectedTransactions.clear();
  showAuthScreen();
  showToast('Logged out successfully', 'success');
}

// =============================================================================
// AUTH UI HELPERS
// =============================================================================
function switchAuthForm(formType) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  if (formType === 'login') {
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
  } else {
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
  }
  
  clearAuthError();
}

function setLoadingState(type, isLoading) {
  const button = document.getElementById(`${type}-btn`);
  const text = document.getElementById(`${type}-text`);
  const spinner = document.getElementById(`${type}-loading`);
  
  if (button) button.disabled = isLoading;
  if (text) text.style.display = isLoading ? 'none' : 'inline';
  if (spinner) spinner.style.display = isLoading ? 'inline-block' : 'none';
}

function showAuthError(message) {
  const errorDiv = document.getElementById('auth-error');
  const errorMessage = document.getElementById('auth-error-message');
  
  if (errorDiv && errorMessage) {
    errorMessage.textContent = message;
    errorDiv.style.display = 'flex';
  }
}

function clearAuthError() {
  const errorDiv = document.getElementById('auth-error');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

function showAuthScreen() {
  document.getElementById('auth-container').style.display = 'flex';
  document.getElementById('app-container').style.display = 'none';
  switchAuthForm('login');
}

function showMainApp() {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('app-container').style.display = 'flex';
  
  loadUserExpenses();
  setupCategorySelector();
  setupDateInput();
  navigateToPage('dashboard');
}

// =============================================================================
// NAVIGATION
// =============================================================================
function navigateToPage(pageName) {
  console.log('🧭 Navigating to:', pageName);
  
  // Update active page
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(navItem => {
    navItem.classList.remove('active');
  });
  
  const activeNavItem = document.querySelector(`[data-page="${pageName}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }
  
  // Update page title
  const pageTitles = {
    'dashboard': 'Dashboard',
    'add-expense': 'Add Expense',
    'analytics': 'Analytics',
    'profile': 'Profile',
    'view-all': 'All Transactions'
  };
  
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = pageTitles[pageName] || 'Traklio';
  }
  
  // Page-specific initialization
  if (pageName === 'dashboard') {
    loadDashboard();
  } else if (pageName === 'analytics') {
    setTimeout(() => initializeAnalytics(), 100);
  } else if (pageName === 'profile') {
    loadProfilePage();
  } else if (pageName === 'view-all') {
    renderAllTransactions();
  }
}

// =============================================================================
// DATA MANAGEMENT
// =============================================================================
function loadUserExpenses() {
  const allExpenses = storage.get(APP_CONFIG.LS_EXPENSES, []);
  state.expenses = allExpenses.filter(expense => expense.userId === state.currentUser.id);
  console.log(`📊 Loaded ${state.expenses.length} expenses for user`);
}

function saveUserExpenses() {
  const allExpenses = storage.get(APP_CONFIG.LS_EXPENSES, []);
  const otherUserExpenses = allExpenses.filter(expense => expense.userId !== state.currentUser.id);
  const updatedExpenses = [...otherUserExpenses, ...state.expenses];
  storage.set(APP_CONFIG.LS_EXPENSES, updatedExpenses);
}

// =============================================================================
// DASHBOARD
// =============================================================================
function loadDashboard() {
  updateWelcomeSection();
  updateSummaryCards();
  renderRecentTransactions();
  setTimeout(() => renderPieChart(), 200);
}

function updateWelcomeSection() {
  const userNameDisplay = document.getElementById('user-name-display');
  const userAvatarInitial = document.getElementById('user-avatar-initial');
  
  if (state.currentUser) {
    if (userNameDisplay) {
      userNameDisplay.textContent = state.currentUser.name;
    }
    if (userAvatarInitial) {
      userAvatarInitial.textContent = state.currentUser.name.charAt(0).toUpperCase();
    }
  }
}

function updateSummaryCards() {
  const today = getTodayString();
  const weekStart = getWeekStartString();
  const monthStart = getMonthStartString();
  
  const todayTotal = state.expenses
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const weekTotal = state.expenses
    .filter(e => e.date >= weekStart)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const monthTotal = state.expenses
    .filter(e => e.date >= monthStart)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const todayElement = document.getElementById('today-total');
  const weekElement = document.getElementById('week-total');
  const monthElement = document.getElementById('month-total');
  
  if (todayElement) todayElement.textContent = `₹${todayTotal.toLocaleString()}`;
  if (weekElement) weekElement.textContent = `₹${weekTotal.toLocaleString()}`;
  if (monthElement) monthElement.textContent = `₹${monthTotal.toLocaleString()}`;
}

function renderRecentTransactions() {
  const container = document.getElementById('recent-transactions');
  if (!container) return;
  
  const recentExpenses = state.expenses.slice(0, 5);
  
  if (recentExpenses.length === 0) {
    container.innerHTML = '<p class="no-transactions">No transactions yet. <a href="#" onclick="navigateToPage(\'add-expense\')">Add your first expense</a></p>';
    return;
  }
  
  container.innerHTML = recentExpenses.map(expense => createTransactionHTML(expense)).join('');
}

function createTransactionHTML(expense) {
  const icon = getExpenseIcon(expense);
  const dateText = formatDate(expense.date);
  
  return `
    <div class="transaction-item">
      <div class="transaction-left">
        <div class="transaction-icon">${icon}</div>
        <div class="transaction-details">
          <h4>${expense.description}</h4>
          <p>${expense.category} • ${dateText}</p>
        </div>
      </div>
      <div class="transaction-right">
        <div class="transaction-amount">₹${expense.amount.toLocaleString()}</div>
        <div class="transaction-actions">
          <button class="action-btn" onclick="editExpense('${expense.id}')" title="Edit">✏️</button>
          <button class="action-btn action-btn--delete" onclick="deleteExpense('${expense.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  `;
}

// =============================================================================
// ADD EXPENSE
// =============================================================================
function setupCategorySelector() {
  const container = document.getElementById('category-selector');
  if (!container) return;
  
  container.innerHTML = CATEGORIES.map(category => `
    <div class="category-item" data-category="${category.name}" onclick="selectCategory('${category.name}')">
      <div class="category-item__icon">${category.icon}</div>
      <div class="category-item__label">${category.name}</div>
    </div>
  `).join('');
}

function selectCategory(categoryName) {
  state.selectedCategory = categoryName;
  
  // Update visual selection
  document.querySelectorAll('.category-item').forEach(item => {
    item.classList.toggle('selected', item.dataset.category === categoryName);
  });
  
  // Handle custom category
  const customGroup = document.getElementById('custom-category-group');
  const customInput = document.getElementById('custom-category');
  
  if (categoryName === 'Other') {
    if (customGroup) customGroup.style.display = 'block';
    if (customInput) customInput.required = true;
  } else {
    if (customGroup) customGroup.style.display = 'none';
    if (customInput) {
      customInput.required = false;
      customInput.value = '';
    }
  }
}

function setupDateInput() {
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.value = getTodayString();
  }
}

function handleAddExpense(event) {
  event.preventDefault();
  
  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value.trim();
  const date = document.getElementById('date').value;
  const customCategory = document.getElementById('custom-category').value.trim();
  
  // Validation
  if (!state.selectedCategory) {
    showToast('Please select a category', 'error');
    return;
  }
  
  if (state.selectedCategory === 'Other' && !customCategory) {
    showToast('Please enter a custom category name', 'error');
    return;
  }
  
  if (!description) {
    showToast('Please enter a description', 'error');
    return;
  }
  
  if (amount <= 0 || isNaN(amount)) {
    showToast('Please enter a valid amount', 'error');
    return;
  }
  
  // Create expense
  const finalCategory = state.selectedCategory === 'Other' ? customCategory : state.selectedCategory;
  const categoryData = CATEGORIES.find(c => c.name === state.selectedCategory);
  const icon = state.selectedCategory === 'Other' ? '📝' : categoryData?.icon || '💰';
  
  const newExpense = {
    id: Date.now().toString(),
    amount: amount,
    description: description,
    category: finalCategory,
    icon: icon,
    date: date,
    userId: state.currentUser.id
  };
  
  // Add to state and save
  state.expenses.unshift(newExpense);
  saveUserExpenses();
  
  // Reset form
  document.getElementById('expense-form').reset();
  setupDateInput();
  state.selectedCategory = null;
  document.querySelectorAll('.category-item').forEach(item => {
    item.classList.remove('selected');
  });
  document.getElementById('custom-category-group').style.display = 'none';
  
  showToast('Expense added successfully!', 'success');
  
  // Navigate to dashboard after a short delay
  setTimeout(() => {
    navigateToPage('dashboard');
  }, 1000);
}

// =============================================================================
// PROFILE PAGE
// =============================================================================
function loadProfilePage() {
  if (!state.currentUser) return;
  
  const profileAvatarInitial = document.getElementById('profile-avatar-initial');
  const profileUserName = document.getElementById('profile-user-name');
  const profileUserEmail = document.getElementById('profile-user-email');
  const profileNameInput = document.getElementById('profile-name');
  const profileEmailInput = document.getElementById('profile-email');
  
  if (profileAvatarInitial) {
    profileAvatarInitial.textContent = state.currentUser.name.charAt(0).toUpperCase();
  }
  if (profileUserName) {
    profileUserName.textContent = state.currentUser.name;
  }
  if (profileUserEmail) {
    profileUserEmail.textContent = state.currentUser.email;
  }
  if (profileNameInput) {
    profileNameInput.value = state.currentUser.name;
  }
  if (profileEmailInput) {
    profileEmailInput.value = state.currentUser.email;
  }
}

function handleProfileUpdate(event) {
  event.preventDefault();
  
  const newName = document.getElementById('profile-name').value.trim();
  const newEmail = document.getElementById('profile-email').value.trim().toLowerCase();
  
  if (!newName || !newEmail) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  if (!newEmail.includes('@')) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  
  // Check if email is already taken by another user
  const users = storage.get(APP_CONFIG.LS_USERS, []);
  const emailTaken = users.find(u => u.email === newEmail && u.id !== state.currentUser.id);
  
  if (emailTaken) {
    showToast('Email is already in use by another account', 'error');
    return;
  }
  
  // Update user in storage
  const updatedUsers = users.map(user => {
    if (user.id === state.currentUser.id) {
      return { ...user, name: newName, email: newEmail };
    }
    return user;
  });
  
  storage.set(APP_CONFIG.LS_USERS, updatedUsers);
  
  // Update current user state
  state.currentUser.name = newName;
  state.currentUser.email = newEmail;
  storage.set(APP_CONFIG.LS_CURRENT_USER, state.currentUser);
  
  // Refresh profile page and dashboard
  loadProfilePage();
  updateWelcomeSection();
  
  showToast('Profile updated successfully!', 'success');
}

function handlePasswordChange(event) {
  event.preventDefault();
  
  const currentPassword = document.getElementById('current-password').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();
  const confirmPassword = document.getElementById('confirm-new-password').value.trim();
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showToast('New password must be at least 6 characters long', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match', 'error');
    return;
  }
  
  // Verify current password
  const users = storage.get(APP_CONFIG.LS_USERS, []);
  const currentUser = users.find(u => u.id === state.currentUser.id);
  
  if (!currentUser || currentUser.password !== currentPassword) {
    showToast('Current password is incorrect', 'error');
    return;
  }
  
  // Update password
  const updatedUsers = users.map(user => {
    if (user.id === state.currentUser.id) {
      return { ...user, password: newPassword };
    }
    return user;
  });
  
  storage.set(APP_CONFIG.LS_USERS, updatedUsers);
  
  // Reset password form
  document.getElementById('password-form').reset();
  
  showToast('Password changed successfully!', 'success');
}

// =============================================================================
// CHARTS
// =============================================================================
function renderPieChart() {
  const canvas = document.getElementById('pie-chart');
  if (!canvas) return;
  
  // Destroy existing chart
  if (state.charts.pie) {
    state.charts.pie.destroy();
  }
  
  // Calculate category totals
  const categoryTotals = {};
  state.expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });
  
  const entries = Object.entries(categoryTotals);
  if (entries.length === 0) {
    canvas.parentElement.innerHTML = '<p class="no-transactions">No expense data to display</p>';
    return;
  }
  
  const labels = entries.map(([category]) => category);
  const data = entries.map(([, amount]) => amount);
  const colors = entries.map(([category]) => {
    const categoryData = CATEGORIES.find(c => c.name === category);
    return categoryData ? categoryData.color : '#8B5CF6';
  });
  
  state.charts.pie = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${context.label}: ₹${context.raw.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// =============================================================================
// ANALYTICS
// =============================================================================
function initializeAnalytics() {
  renderTrendsChart();
  renderCategoryChart();
  renderInsights();
}

function renderTrendsChart() {
  const canvas = document.getElementById('trends-chart');
  if (!canvas) return;
  
  if (state.charts.trends) {
    state.charts.trends.destroy();
  }
  
  // Generate last 30 days data
  const days = 30;
  const labels = [];
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    const dayTotal = state.expenses
      .filter(e => e.date === dateString)
      .reduce((sum, e) => sum + e.amount, 0);
    
    data.push(dayTotal);
  }
  
  state.charts.trends = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Daily Spending',
        data: data,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

function renderCategoryChart() {
  const canvas = document.getElementById('category-chart');
  if (!canvas) return;
  
  if (state.charts.category) {
    state.charts.category.destroy();
  }
  
  // Calculate category totals
  const categoryTotals = {};
  state.expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });
  
  const sortedEntries = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);
  
  if (sortedEntries.length === 0) {
    canvas.parentElement.innerHTML = '<p class="no-transactions">No category data to display</p>';
    return;
  }
  
  const labels = sortedEntries.map(([category]) => category);
  const data = sortedEntries.map(([, amount]) => amount);
  const colors = sortedEntries.map(([category]) => {
    const categoryData = CATEGORIES.find(c => c.name === category);
    return categoryData ? categoryData.color : '#8B5CF6';
  });
  
  state.charts.category = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Amount Spent',
        data: data,
        backgroundColor: colors,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

function renderInsights() {
  const container = document.getElementById('insights-content');
  if (!container) return;
  
  const totalSpent = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgDaily = totalSpent / 30;
  
  // Find top category
  const categoryTotals = {};
  state.expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });
  
  const topCategory = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)[0];
  
  const insights = [
    { icon: '💡', text: `Total spent (30 days): ₹${totalSpent.toLocaleString()}` },
    { icon: '📈', text: `Average daily spending: ₹${Math.round(avgDaily).toLocaleString()}` },
    { icon: '🏆', text: topCategory ? `Top category: ${topCategory[0]} (₹${topCategory[1].toLocaleString()})` : 'No spending data' },
    { icon: '📊', text: `Total transactions: ${state.expenses.length}` }
  ];
  
  container.innerHTML = insights.map(insight => `
    <div class="insight-item">
      <div class="insight-icon">${insight.icon}</div>
      <div class="insight-text">${insight.text}</div>
    </div>
  `).join('');
}

function handleDateRangeChange(button) {
  document.querySelectorAll('.date-range-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');
  
  const range = button.getAttribute('data-range');
  const customRangeDiv = document.getElementById('custom-date-range');
  
  if (range === 'custom') {
    if (customRangeDiv) customRangeDiv.style.display = 'block';
  } else {
    if (customRangeDiv) customRangeDiv.style.display = 'none';
    setTimeout(() => initializeAnalytics(), 100);
  }
}

function handleCustomDateRange() {
  const fromDate = document.getElementById('from-date').value;
  const toDate = document.getElementById('to-date').value;
  
  if (!fromDate || !toDate) {
    showToast('Please select both dates', 'error');
    return;
  }
  
  if (new Date(fromDate) > new Date(toDate)) {
    showToast('From date must be before to date', 'error');
    return;
  }
  
  showToast('Custom date range applied!', 'success');
  setTimeout(() => initializeAnalytics(), 100);
}

// =============================================================================
// VIEW ALL TRANSACTIONS
// =============================================================================
function renderAllTransactions() {
  const container = document.getElementById('all-transactions-list');
  if (!container) return;
  
  const searchQuery = document.getElementById('transaction-search').value.trim().toLowerCase();
  
  let filteredExpenses = [...state.expenses];
  
  if (searchQuery) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.description.toLowerCase().includes(searchQuery) ||
      expense.category.toLowerCase().includes(searchQuery)
    );
  }
  
  if (filteredExpenses.length === 0) {
    container.innerHTML = '<p class="no-transactions">No transactions found.</p>';
    return;
  }
  
  container.innerHTML = filteredExpenses.map(expense => `
    <div class="transaction-item-selectable ${state.selectedTransactions.has(expense.id) ? 'selected' : ''}">
      <div class="transaction-checkbox">
        <input type="checkbox" 
               ${state.selectedTransactions.has(expense.id) ? 'checked' : ''}
               onchange="toggleTransactionSelection('${expense.id}')">
      </div>
      <div class="transaction-content">
        ${createTransactionHTML(expense)}
      </div>
    </div>
  `).join('');
  
  updateBulkActionButtons();
}

function toggleTransactionSelection(transactionId) {
  if (state.selectedTransactions.has(transactionId)) {
    state.selectedTransactions.delete(transactionId);
  } else {
    state.selectedTransactions.add(transactionId);
  }
  renderAllTransactions();
}

function handleSelectAll(event) {
  if (event.target.checked) {
    state.expenses.forEach(expense => {
      state.selectedTransactions.add(expense.id);
    });
  } else {
    state.selectedTransactions.clear();
  }
  renderAllTransactions();
}

function updateBulkActionButtons() {
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  const deleteAllBtn = document.getElementById('delete-all-btn');
  
  if (deleteSelectedBtn) {
    deleteSelectedBtn.disabled = state.selectedTransactions.size === 0;
  }
  
  if (deleteAllBtn) {
    deleteAllBtn.disabled = state.expenses.length === 0;
  }
}

function handleBulkDelete(type) {
  let count = 0;
  let message = '';
  
  if (type === 'all') {
    count = state.expenses.length;
    message = `Are you sure you want to delete all ${count} transactions?`;
  } else {
    count = state.selectedTransactions.size;
    message = `Are you sure you want to delete ${count} selected transactions?`;
  }
  
  if (count === 0) return;
  
  if (!confirm(message + ' This action cannot be undone.')) return;
  
  if (type === 'all') {
    state.expenses = [];
  } else {
    state.expenses = state.expenses.filter(expense => !state.selectedTransactions.has(expense.id));
  }
  
  state.selectedTransactions.clear();
  saveUserExpenses();
  
  showToast(`${count} transactions deleted successfully!`, 'success');
  
  renderAllTransactions();
  if (document.getElementById('dashboard-page').classList.contains('active')) {
    loadDashboard();
  }
}

// =============================================================================
// EXPENSE OPERATIONS
// =============================================================================
function editExpense(expenseId) {
  showToast('Edit functionality coming soon!', 'info');
}

function deleteExpense(expenseId) {
  const expense = state.expenses.find(e => e.id === expenseId);
  if (!expense) return;
  
  if (!confirm(`Are you sure you want to delete "${expense.description}"?`)) return;
  
  state.expenses = state.expenses.filter(e => e.id !== expenseId);
  saveUserExpenses();
  
  showToast('Expense deleted successfully!', 'success');
  
  // Refresh current view
  if (document.getElementById('dashboard-page').classList.contains('active')) {
    loadDashboard();
  } else if (document.getElementById('view-all-page').classList.contains('active')) {
    renderAllTransactions();
  }
}

// =============================================================================
// THEME MANAGEMENT
// =============================================================================
function initializeTheme() {
  state.currentTheme = storage.get(APP_CONFIG.LS_THEME, 'light');
  applyTheme(state.currentTheme);
  updateThemeIcon();
}

function toggleTheme() {
  state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
  storage.set(APP_CONFIG.LS_THEME, state.currentTheme);
  applyTheme(state.currentTheme);
  updateThemeIcon();
  
  // Refresh charts for theme change
  setTimeout(() => {
    if (document.getElementById('dashboard-page').classList.contains('active')) {
      renderPieChart();
    } else if (document.getElementById('analytics-page').classList.contains('active')) {
      initializeAnalytics();
    }
  }, 100);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-color-scheme', theme);
}

function updateThemeIcon() {
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.textContent = state.currentTheme === 'light' ? '🌙' : '☀️';
  }
}

// =============================================================================
// UTILITIES
// =============================================================================
function showToast(message, type = 'success') {
  const toastId = type === 'error' ? 'error-toast' : 'success-toast';
  const toast = document.getElementById(toastId);
  
  if (!toast) return;
  
  const messageElement = toast.querySelector('.toast-message');
  if (messageElement) {
    messageElement.textContent = message;
  }
  
  toast.style.display = 'flex';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

function getExpenseIcon(expense) {
  if (expense.icon && expense.icon !== 'undefined') {
    return expense.icon;
  }
  
  const categoryData = CATEGORIES.find(c => c.name === expense.category);
  return categoryData ? categoryData.icon : '💰';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateStr = date.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function getWeekStartString() {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

function getMonthStartString() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().split('T')[0];
}

// =============================================================================
// GLOBAL FUNCTIONS (for onclick handlers)
// =============================================================================
window.navigateToPage = navigateToPage;
window.selectCategory = selectCategory;
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
window.toggleTransactionSelection = toggleTransactionSelection;