// Enhanced Newsletter Section JavaScript

class NewsletterEnhancer {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 3;
        this.selectedTier = 'free';
        this.testimonialIndex = 0;
        this.subscriberCount = 127543;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.startTestimonialRotation();
        this.animateSubscriberCount();
    }
    
    bindEvents() {
        // Tier selection
        document.querySelectorAll('.tier-option').forEach(tier => {
            tier.addEventListener('click', (e) => this.selectTier(e));
        });
        
        // Form navigation
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', (e) => this.nextStep(e));
        });
        
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', (e) => this.prevStep(e));
        });
        
        // Form submission
        const form = document.getElementById('newsletter-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Modal controls
        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }
        
        // Spin wheel
        const spinBtn = document.getElementById('spin-btn');
        if (spinBtn) {
            spinBtn.addEventListener('click', () => this.spinWheel());
        }
        
        // Interest selection validation
        document.querySelectorAll('input[name="interests"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.validateInterests());
        });
    }
    
    selectTier(e) {
        // Remove active class from all tiers
        document.querySelectorAll('.tier-option').forEach(tier => {
            tier.classList.remove('active');
        });
        
        // Add active class to selected tier
        e.currentTarget.classList.add('active');
        this.selectedTier = e.currentTarget.dataset.tier;
        
        // Show tier selection feedback
        this.showToast(`${this.selectedTier.charAt(0).toUpperCase() + this.selectedTier.slice(1)} tier selected!`, 'success');
    }
    
    nextStep(e) {
        e.preventDefault();
        
        // Validate current step
        if (!this.validateCurrentStep()) {
            return;
        }
        
        if (this.currentStep < this.maxSteps) {
            this.currentStep++;
            this.updateFormStep();
            this.updateProgressIndicator();
        }
    }
    
    prevStep(e) {
        e.preventDefault();
        
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateFormStep();
            this.updateProgressIndicator();
        }
    }
    
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                const email = document.getElementById('email-input').value;
                if (!email || !this.isValidEmail(email)) {
                    this.showToast('Please enter a valid email address', 'error');
                    return false;
                }
                break;
            case 2:
                const selectedInterests = document.querySelectorAll('input[name="interests"]:checked');
                if (selectedInterests.length === 0) {
                    this.showToast('Please select at least one interest', 'error');
                    return false;
                }
                break;
            case 3:
                const selectedFrequency = document.querySelector('input[name="frequency"]:checked');
                if (!selectedFrequency) {
                    this.showToast('Please select a notification frequency', 'error');
                    return false;
                }
                break;
        }
        return true;
    }
    
    validateInterests() {
        const selectedInterests = document.querySelectorAll('input[name="interests"]:checked');
        const nextBtn = document.querySelector('.form-step[data-step="2"] .next-step');
        
        if (selectedInterests.length > 0) {
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'all';
        } else {
            nextBtn.style.opacity = '0.6';
            nextBtn.style.pointerEvents = 'none';
        }
    }
    
    updateFormStep() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
    }
    
    updateProgressIndicator() {
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active');
        });
        
        const currentProgressStep = document.querySelector(`.progress-step[data-step="${this.currentStep}"]`);
        if (currentProgressStep) {
            currentProgressStep.classList.add('active');
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateCurrentStep()) {
            return;
        }
        
        // Collect form data
        const formData = this.collectFormData();
        
        // Simulate API call
        this.showToast('Processing your subscription...', 'success');
        
        setTimeout(() => {
            this.showSuccessModal(formData);
            this.incrementSubscriberCount();
        }, 1500);
    }
    
    collectFormData() {
        const email = document.getElementById('email-input').value;
        const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
            .map(cb => cb.value);
        const frequency = document.querySelector('input[name="frequency"]:checked').value;
        
        return {
            email,
            interests,
            frequency,
            tier: this.selectedTier,
            timestamp: new Date().toISOString()
        };
    }
    
    showSuccessModal(formData) {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.add('active');
            
            // Store subscription data
            localStorage.setItem('newsletterSubscription', JSON.stringify(formData));
        }
    }
    
    closeModal() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.remove('active');
            
            // Reset form
            this.resetForm();
        }
    }
    
    resetForm() {
        this.currentStep = 1;
        this.updateFormStep();
        this.updateProgressIndicator();
        
        // Clear form inputs
        document.getElementById('newsletter-form').reset();
        
        // Reset tier selection
        document.querySelectorAll('.tier-option').forEach(tier => {
            tier.classList.remove('active');
        });
        document.querySelector('.tier-option[data-tier="free"]').classList.add('active');
        this.selectedTier = 'free';
    }
    
    spinWheel() {
        const wheel = document.getElementById('bonus-wheel');
        const spinBtn = document.getElementById('spin-btn');
        const prizeResult = document.getElementById('prize-result');
        
        if (!wheel || !spinBtn) return;
        
        // Disable button during spin
        spinBtn.disabled = true;
        spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Spinning...';
        
        // Generate random rotation (multiple full rotations + random position)
        const randomRotation = 1440 + Math.random() * 360; // 4 full rotations + random
        wheel.style.transform = `rotate(${randomRotation}deg)`;
        
        // Determine prize based on final position
        setTimeout(() => {
            const prizes = ['10% Off', 'Free Shipping', '15% Off', 'Early Access', '20% Off', 'VIP Status'];
            const finalPosition = randomRotation % 360;
            const prizeIndex = Math.floor(finalPosition / 60);
            const prize = prizes[prizeIndex];
            
            // Show prize result
            document.getElementById('prize-text').textContent = prize;
            prizeResult.style.display = 'block';
            
            // Re-enable button
            spinBtn.disabled = false;
            spinBtn.innerHTML = '<i class="fas fa-redo"></i> Spin Again!';
            
            // Store prize in localStorage
            const subscription = JSON.parse(localStorage.getItem('newsletterSubscription') || '{}');
            subscription.welcomeBonus = prize;
            localStorage.setItem('newsletterSubscription', JSON.stringify(subscription));
            
            this.showToast(`Congratulations! You won: ${prize}`, 'success');
        }, 3000);
    }
    
    startTestimonialRotation() {
        const testimonials = document.querySelectorAll('.testimonial');
        if (testimonials.length === 0) return;
        
        setInterval(() => {
            // Remove active class from current testimonial
            testimonials[this.testimonialIndex].classList.remove('active');
            
            // Move to next testimonial
            this.testimonialIndex = (this.testimonialIndex + 1) % testimonials.length;
            
            // Add active class to new testimonial
            testimonials[this.testimonialIndex].classList.add('active');
        }, 4000);
    }
    
    animateSubscriberCount() {
        const countElement = document.getElementById('subscriber-count');
        if (!countElement) return;
        
        // Animate count up
        let currentCount = 0;
        const targetCount = this.subscriberCount;
        const increment = targetCount / 100;
        
        const countAnimation = setInterval(() => {
            currentCount += increment;
            if (currentCount >= targetCount) {
                currentCount = targetCount;
                clearInterval(countAnimation);
            }
            countElement.textContent = Math.floor(currentCount).toLocaleString();
        }, 20);
    }
    
    incrementSubscriberCount() {
        this.subscriberCount++;
        const countElement = document.getElementById('subscriber-count');
        if (countElement) {
            countElement.textContent = this.subscriberCount.toLocaleString();
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NewsletterEnhancer();
});

// Additional utility functions for integration
window.NewsletterUtils = {
    // Function to pre-fill email if user is logged in
    prefillUserEmail: function(email) {
        const emailInput = document.getElementById('email-input');
        if (emailInput && email) {
            emailInput.value = email;
        }
    },
    
    // Function to get subscription data
    getSubscriptionData: function() {
        return JSON.parse(localStorage.getItem('newsletterSubscription') || '{}');
    },
    
    // Function to check if user is subscribed
    isUserSubscribed: function() {
        const data = this.getSubscriptionData();
        return data.email && data.timestamp;
    },
    
    // Function to update subscriber count from server
    updateSubscriberCount: function(count) {
        const countElement = document.getElementById('subscriber-count');
        if (countElement && count) {
            countElement.textContent = count.toLocaleString();
        }
    }
};

