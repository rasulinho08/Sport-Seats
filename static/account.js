// Dashboard JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Navigation functionality
    initializeNavigation();
    
    // Mobile menu functionality
    initializeMobileMenu();
    
    // User dropdown functionality
    initializeUserDropdown();
    
    // Modal functionality
    initializeModals();
    
    // Form functionality
    initializeForms();
    
    // Interactive features
    initializeInteractiveFeatures();
});

function initializeDashboard() {
    // Check if user is logged in (simulate)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
        updateUserInfo(user);
    }
    
    // Show email verification banner if not verified
    const emailBanner = document.getElementById('emailBanner');
    if (emailBanner && !user.email_verified) {
        emailBanner.style.display = 'block';
    }
}

function updateUserInfo(user) {
    // Update user name in navigation
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = user.name || 'User';
    });
    
    // Update profile information
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
        profileName.textContent = user.name || 'John Doe';
    }
    
    // Update email
    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.value = user.email || 'john.doe@email.com';
    }
}

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item and target section
            this.classList.add('active');
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            // Close mobile menu if open
            const sidebar = document.getElementById('dashboardSidebar');
            if (sidebar) {
                sidebar.classList.remove('show');
            }
        });
    });
}

function initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('dashboardSidebar');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
    }
}

function initializeUserDropdown() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdown.classList.remove('show');
        });
        
        // Handle logout
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
    }
}

function initializeModals() {
    // Add card modal
    const addCardBtn = document.querySelector('.add-card-btn');
    const addCardModal = document.getElementById('addCardModal');
    
    if (addCardBtn && addCardModal) {
        addCardBtn.addEventListener('click', function() {
            showModal('addCardModal');
        });
    }
    
    // Close modal functionality
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // Close modal when clicking overlay
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this.id);
            }
        });
    });
}

function initializeForms() {
    // Email editing functionality
    const editEmailBtn = document.querySelector('.edit-email-btn');
    const emailInput = document.getElementById('emailInput');
    
    if (editEmailBtn && emailInput) {
        editEmailBtn.addEventListener('click', function() {
            if (emailInput.hasAttribute('readonly')) {
                emailInput.removeAttribute('readonly');
                emailInput.focus();
                this.textContent = 'Save';
                this.classList.remove('btn-outline');
                this.classList.add('btn-primary');
            } else {
                emailInput.setAttribute('readonly', true);
                this.textContent = 'Edit';
                this.classList.remove('btn-primary');
                this.classList.add('btn-outline');
                // Here you would typically save the email to the server
                showNotification('Email updated successfully!', 'success');
            }
        });
    }
    
    // Add card form
    const addCardForm = document.getElementById('add-card-form');
    if (addCardForm) {
        addCardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddCard();
        });
    }
    
    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            this.value = formattedValue;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiry-date');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }
}

function initializeInteractiveFeatures() {
    // Two-factor authentication toggles
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const feature = this.id === 'smsToggle' ? 'SMS Authentication' : 'Authenticator App';
            const status = this.checked ? 'enabled' : 'disabled';
            showNotification(`${feature} ${status}`, 'info');
        });
    });
    
    // Booking filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterBookings(filter);
        });
    });
    
    // Download invoice buttons
    const downloadBtns = document.querySelectorAll('.download-invoice-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingItem = this.closest('.booking-item');
            const bookingId = bookingItem.querySelector('.booking-id').textContent;
            downloadInvoice(bookingId);
        });
    });
    
    // Delete account button
    const deleteAccountBtn = document.querySelector('.delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                handleDeleteAccount();
            }
        });
    }
    
    // Edit profile button
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            showNotification('Profile editing feature coming soon!', 'info');
        });
    }
    
    // Resend email button
    const resendEmailBtn = document.querySelector('.btn-resend');
    if (resendEmailBtn) {
        resendEmailBtn.addEventListener('click', function() {
            handleResendEmail();
        });
    }
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            filterBookingsBySearch(query);
        });
    }
}

// Utility functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function closeBanner() {
    const banner = document.getElementById('emailBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 0.75rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                z-index: 3000;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            .notification-success { border-left: 4px solid #10B981; }
            .notification-error { border-left: 4px solid #EF4444; }
            .notification-info { border-left: 4px solid #4F46E5; }
            .notification-warning { border-left: 4px solid #F59E0B; }
            .notification-content { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
            .notification-close { background: none; border: none; cursor: pointer; color: #6B7280; }
            @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

function handleAddCard() {
    const cardNumber = document.getElementById('card-number').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    const cardholderName = document.getElementById('cardholder-name').value;
    const setDefault = document.getElementById('set-default').checked;
    
    // Basic validation
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Simulate adding card
    showNotification('Card added successfully!', 'success');
    hideModal('addCardModal');
    
    // Reset form
    document.getElementById('add-card-form').reset();
}

function handleResendEmail() {
    // Simulate resending email
    showNotification('Verification email sent!', 'success');
}

function handleDeleteAccount() {
    // Simulate account deletion
    showNotification('Account deletion request submitted', 'info');
}

function downloadInvoice(bookingId) {
    // Simulate invoice download
    showNotification(`Downloading invoice for ${bookingId}`, 'info');
    
    // Create a fake download
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,Invoice for ' + bookingId;
    link.download = `invoice-${bookingId}.txt`;
    link.click();
}

function filterBookings(filter) {
    const bookingItems = document.querySelectorAll('.booking-item');
    
    bookingItems.forEach(item => {
        const isUpcoming = item.classList.contains('upcoming');
        const isPast = item.classList.contains('past');
        const isCancelled = item.classList.contains('cancelled');
        
        let show = false;
        
        switch (filter) {
            case 'all':
                show = true;
                break;
            case 'upcoming':
                show = isUpcoming;
                break;
            case 'past':
                show = isPast;
                break;
            case 'cancelled':
                show = isCancelled;
                break;
        }
        
        item.style.display = show ? 'flex' : 'none';
    });
}

function filterBookingsBySearch(query) {
    const bookingItems = document.querySelectorAll('.booking-item');
    
    bookingItems.forEach(item => {
        const title = item.querySelector('h4').textContent.toLowerCase();
        const venue = item.querySelector('.event-venue').textContent.toLowerCase();
        const bookingId = item.querySelector('.booking-id').textContent.toLowerCase();
        
        const matches = title.includes(query) || venue.includes(query) || bookingId.includes(query);
        item.style.display = matches ? 'flex' : 'none';
    });
}

// Password strength checker (for future use)
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return {
        score: strength,
        text: ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength] || 'Very Weak'
    };
}

// Initialize tooltips (if needed)
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

