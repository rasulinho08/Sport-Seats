// Checkout System
class CheckoutSystem {
    constructor() {
        this.checkoutData = null;
        this.selectedPaymentMethod = 'credit-card';
        this.formValidation = {
            'first-name': false,
            'last-name': false,
            'email': false,
            'phone': false,
            'address': false,
            'city': false,
            'state': false,
            'zip': false,
            'country': false,
            'card-number': false,
            'expiry-date': false,
            'security-code': false,
            'cardholder-name': false,
            'terms': false
        };
        
        this.init();
    }

    init() {
        this.loadCheckoutData();
        this.renderOrderSummary();
        this.bindEvents();
        this.setupFormValidation();
    }

    loadCheckoutData() {
        const storedData = localStorage.getItem('checkoutData');
        if (storedData) {
            this.checkoutData = JSON.parse(storedData);
        } else {
            // Fallback demo data
            this.checkoutData = {
                event: {
                    title: 'NFL: Patriots vs. Jets',
                    date: 'August 15, 2025',
                    time: '8:00 PM',
                    venue: 'Gillette Stadium'
                },
                seats: [
                    { section: 'North', row: 'A', seat: '12', price: 150, type: 'Premium' },
                    { section: 'North', row: 'A', seat: '13', price: 150, type: 'Premium' }
                ],
                pricing: {
                    subtotal: 300,
                    serviceFee: 45,
                    total: 345
                },
                promoCode: null,
                discountAmount: 0
            };
        }
    }

    renderOrderSummary() {
        this.renderEventSummary();
        this.renderSeatsSummary();
        this.renderPricingSummary();
    }

    renderEventSummary() {
        const eventSummaryContainer = document.getElementById('event-summary-title');
        const eventDateContainer = document.getElementById('event-summary-date');
        const eventTimeContainer = document.getElementById('event-summary-time');
        const eventVenueContainer = document.getElementById('event-summary-venue');

        const event = this.checkoutData.event;
        
        eventSummaryContainer.textContent = event.title;
        eventDateContainer.textContent = event.date;
        eventTimeContainer.textContent = event.time;
        eventVenueContainer.textContent = event.venue;
    }

    renderSeatsSummary() {
        const seatsSummaryContainer = document.getElementById('seats-summary-list');
        
        seatsSummaryContainer.innerHTML = this.checkoutData.seats.map(seat => `
            <div class="seat-summary-item">
                <div class="seat-summary-info">
                    ${seat.section} ${seat.row}${seat.seat} (${seat.type})
                </div>
                <div class="seat-summary-price">$${seat.price}</div>
            </div>
        `).join('');
    }

    renderPricingSummary() {
        const pricing = this.checkoutData.pricing;
        
        document.getElementById('pricing-subtotal').textContent = `$${pricing.subtotal.toFixed(2)}`;
        document.getElementById('pricing-service-fee').textContent = `$${pricing.serviceFee.toFixed(2)}`;
        document.getElementById('pricing-total').textContent = `$${pricing.total.toFixed(2)}`;
        
        // Show discount if applicable
        if (this.checkoutData.discountAmount > 0) {
            document.getElementById('pricing-discount-row').style.display = 'flex';
            document.getElementById('pricing-discount').textContent = `-$${this.checkoutData.discountAmount.toFixed(2)}`;
        }
        
        // Update place order button
        document.getElementById('place-order-btn').textContent = `Complete Order - $${pricing.total.toFixed(2)}`;
    }

    bindEvents() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                // Simple mobile menu toggle (you can expand this)
                console.log('Mobile menu clicked');
            });
        }

        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget.dataset.method);
            });
        });

        // Form submission
        document.getElementById('checkout-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder();
        });

        // Auto-fill cardholder name from personal info
        const firstNameInput = document.getElementById('first-name');
        const lastNameInput = document.getElementById('last-name');
        const cardholderNameInput = document.getElementById('cardholder-name');
        
        const updateCardholderName = () => {
            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();
            if (firstName && lastName) {
                cardholderNameInput.value = `${firstName} ${lastName}`;
                this.validateField('cardholder-name', cardholderNameInput.value);
            }
        };
        
        firstNameInput.addEventListener('input', updateCardholderName);
        lastNameInput.addEventListener('input', updateCardholderName);
    }

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
        
        // Update UI
        document.querySelectorAll('.payment-method').forEach(pm => {
            pm.classList.remove('selected');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('selected');
        
        // Show/hide credit card form
        const creditCardForm = document.getElementById('credit-card-form');
        if (method === 'credit-card') {
            creditCardForm.style.display = 'block';
        } else {
            creditCardForm.style.display = 'none';
            // For demo purposes, mark card fields as valid for other payment methods
            ['card-number', 'expiry-date', 'security-code', 'cardholder-name'].forEach(field => {
                this.formValidation[field] = true;
            });
        }
        
        this.updateOrderButton();
    }

    setupFormValidation() {
        // Real-time validation for all form fields
        const fields = [
            'first-name', 'last-name', 'email', 'phone', 'address', 
            'city', 'state', 'zip', 'country', 'card-number', 
            'expiry-date', 'security-code', 'cardholder-name'
        ];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.validateField(fieldId, field.value);
                });
                field.addEventListener('blur', () => {
                    this.validateField(fieldId, field.value);
                });
            }
        });
        
        // Terms checkbox
        const termsCheckbox = document.getElementById('terms');
        termsCheckbox.addEventListener('change', () => {
            this.formValidation.terms = termsCheckbox.checked;
            this.updateOrderButton();
        });
        
        // Format card number input
        const cardNumberInput = document.getElementById('card-number');
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            if (formattedValue !== e.target.value) {
                e.target.value = formattedValue;
            }
        });
        
        // Format expiry date input
        const expiryDateInput = document.getElementById('expiry-date');
        expiryDateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
        
        // Limit security code input
        const securityCodeInput = document.getElementById('security-code');
        securityCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }

    validateField(fieldId, value) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        let isValid = false;
        let errorMessage = '';
        
        switch (fieldId) {
            case 'first-name':
            case 'last-name':
                isValid = value.trim().length >= 2;
                errorMessage = 'Name must be at least 2 characters';
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
                
            case 'phone':
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                isValid = phoneRegex.test(value.replace(/\s/g, ''));
                errorMessage = 'Please enter a valid phone number';
                break;
                
            case 'address':
                isValid = value.trim().length >= 5;
                errorMessage = 'Address must be at least 5 characters';
                break;
                
            case 'city':
            case 'state':
                isValid = value.trim().length >= 2;
                errorMessage = 'Must be at least 2 characters';
                break;
                
            case 'zip':
                isValid = value.trim().length >= 3;
                errorMessage = 'Please enter a valid postal code';
                break;
                
            case 'country':
                isValid = value !== '';
                errorMessage = 'Please select a country';
                break;
                
            case 'card-number':
                const cardNumber = value.replace(/\s/g, '');
                isValid = cardNumber.length >= 13 && cardNumber.length <= 19;
                errorMessage = 'Please enter a valid card number';
                break;
                
            case 'expiry-date':
                const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                isValid = expiryRegex.test(value);
                if (isValid) {
                    const [month, year] = value.split('/');
                    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
                    const now = new Date();
                    isValid = expiry > now;
                    errorMessage = 'Card has expired';
                } else {
                    errorMessage = 'Please enter MM/YY format';
                }
                break;
                
            case 'security-code':
                isValid = value.length >= 3 && value.length <= 4;
                errorMessage = 'Please enter 3-4 digits';
                break;
                
            case 'cardholder-name':
                isValid = value.trim().length >= 3;
                errorMessage = 'Please enter the cardholder name';
                break;
        }
        
        // Update field validation state
        this.formValidation[fieldId] = isValid;
        
        // Update UI
        if (field) {
            if (isValid) {
                field.classList.remove('error');
            } else if (value.length > 0) {
                field.classList.add('error');
            }
        }
        
        if (errorElement) {
            errorElement.textContent = isValid || value.length === 0 ? '' : errorMessage;
        }
        
        this.updateOrderButton();
    }

    updateOrderButton() {
        const orderButton = document.getElementById('place-order-btn');
        const requiredFields = [
            'first-name', 'last-name', 'email', 'phone', 'address', 
            'city', 'state', 'zip', 'country', 'terms'
        ];
        
        // Add payment fields if credit card is selected
        if (this.selectedPaymentMethod === 'credit-card') {
            requiredFields.push('card-number', 'expiry-date', 'security-code', 'cardholder-name');
        }
        
        const allValid = requiredFields.every(field => this.formValidation[field]);
        
        orderButton.disabled = !allValid;
        if (allValid) {
            orderButton.style.background = 'var(--success-color)';
        } else {
            orderButton.style.background = 'var(--neutral-light)';
        }
    }

    async processOrder() {
        // Show loading state
        const orderButton = document.getElementById('place-order-btn');
        const originalText = orderButton.textContent;
        orderButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
        orderButton.disabled = true;
        
        try {
            // Simulate payment processing
            await this.simulatePaymentProcessing();
            
            // Show success modal
            this.showSuccessModal();
            
            // Clear stored data
            this.clearBookingData();
            
        } catch (error) {
            // Handle payment error
            this.showToast('Payment failed. Please try again.', 'error');
            orderButton.textContent = originalText;
            orderButton.disabled = false;
        }
    }

    async simulatePaymentProcessing() {
        // Simulate different payment processing times based on method
        const processingTimes = {
            'credit-card': 2000,
            'paypal': 1500,
            'apple-pay': 1000,
            'google-pay': 1000
        };
        
        const delay = processingTimes[this.selectedPaymentMethod] || 2000;
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve();
                } else {
                    reject(new Error('Payment failed'));
                }
            }, delay);
        });
    }

    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        modal.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Add confetti effect (simple version)
        this.createConfetti();
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}vw;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    z-index: 10001;
                    animation: confettiFall 3s linear forwards;
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 100);
        }
        
        // Add confetti animation CSS
        if (!document.getElementById('confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confettiFall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    clearBookingData() {
        localStorage.removeItem('currentBooking');
        localStorage.removeItem('checkoutData');
        localStorage.removeItem('appliedPromo');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${this.getToastColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-size: 0.9rem;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    getToastColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }
}

// Global functions
function goToHome() {
    window.location.href = 'index.html';
}

function downloadTickets() {
    // Simulate ticket download
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,Your tickets will be available for download after email confirmation.';
    link.download = 'tickets.txt';
    link.click();
    
    setTimeout(() => {
        goToHome();
    }, 1000);
}

// Initialize the checkout system when DOM is loaded
let checkout;
document.addEventListener('DOMContentLoaded', () => {
    checkout = new CheckoutSystem();
});
