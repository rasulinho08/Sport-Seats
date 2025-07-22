


// DOM Elements
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navLinks = document.getElementById("nav-links");
const eventsList = document.getElementById("events-list");
const heroSearch = document.getElementById("hero-search");
const sportFilter = document.getElementById("sport-filter");
const dateFilter = document.getElementById("date-filter");
const toastWrapper = document.getElementById("toast-wrapper");

// State
let currentEvents = sampleEvents.filter(event => event.featured);
let filteredEvents = [...currentEvents];

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    initializeNavigation();
    initializeSearch();
    initializeModals();
    initializeForms();
    initializeCategoryCards();
    renderEvents();
    initializeScrollAnimations();
});

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener("click", function() {
            navLinks.classList.toggle("active");
            const icon = mobileMenuBtn.querySelector("i");
            if (navLinks.classList.contains("active")) {
                icon.classList.replace("fa-bars", "fa-times");
            } else {
                icon.classList.replace("fa-times", "fa-bars");
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll(".nav-item").forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            
            // Handle external links (like about.html)
            if (targetId.startsWith("about.html")) {
                window.location.href = targetId;
                return;
            }

            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
                
                // Close mobile menu
                navLinks.classList.remove("active");
                const icon = mobileMenuBtn.querySelector("i");
                icon.classList.replace("fa-times", "fa-bars");
                
                // Update active link
                document.querySelectorAll(".nav-item").forEach(l => l.classList.remove("active"));
                this.classList.add("active");
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener("scroll", function() {
        const navbar = document.querySelector(".main-nav");
        if (window.scrollY > 100) {
            navbar.style.background = "rgba(255, 255, 255, 0.98)";
            navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
        } else {
            navbar.style.background = "rgba(255, 255, 255, 0.95)";
            navbar.style.boxShadow = "none";
        }
    });
}

// Search functionality
function initializeSearch() {
    if (heroSearch) {
        heroSearch.addEventListener("input", debounce(handleSearch, 300));
    }
    
    if (sportFilter) {
        sportFilter.addEventListener("change", handleSearch);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener("change", handleSearch);
    }

    // Search button
    document.querySelector(".search-btn")?.addEventListener("click", function(e) {
        e.preventDefault();
        handleSearch();
        showToast("Searching for events...", "success");
    });
}

function handleSearch() {
    const searchTerm = heroSearch?.value.toLowerCase() || "";
    const selectedSport = sportFilter?.value || "";
    const selectedDate = dateFilter?.value || "";

    filteredEvents = currentEvents.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                            event.venue.toLowerCase().includes(searchTerm);
        const matchesSport = !selectedSport || event.sport === selectedSport;
        const matchesDate = !selectedDate || checkDateFilter(event.date, selectedDate);
        
        return matchesSearch && matchesSport && matchesDate;
    });

    renderEvents();
}

function checkDateFilter(eventDate, filter) {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    
    switch (filter) {
        case "today":
            return eventDateObj.toDateString() === today.toDateString();
        case "tomorrow":
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return eventDateObj.toDateString() === tomorrow.toDateString();
        case "week":
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return eventDateObj >= today && eventDateObj <= weekFromNow;
        case "month":
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return eventDateObj >= today && eventDateObj <= monthFromNow;
        default:
            return true;
    }
}

// Event rendering
function renderEvents() {
    if (!eventsList) return;

    if (filteredEvents.length === 0) {
        eventsList.innerHTML = `
            <div class="no-events">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--neutral-light); margin-bottom: 1rem;"></i>
                <h3>No events found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    eventsList.innerHTML = filteredEvents.map(event => `
        <div class="event-card fade-in-up" onclick="viewEvent(${event.id})">
            <div class="event-image">
                <img src="${event.image}" alt="${event.title}" loading="lazy">
                <div class="event-date">${formatDate(event.date)}</div>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-venue">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.venue}</span>
                </div>
                <div class="event-footer">
                    <div class="event-price">
                        <span class="from">From</span> $${event.price}
                    </div>
                    <button class="btn-primary" onclick="event.stopPropagation(); bookEvent(${event.id})">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// Modal functionality
function initializeModals() {
    // Close modal when clicking outside
    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-overlay.active").forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

function switchModal(fromModalId, toModalId) {
    closeModal(fromModalId);
    setTimeout(() => openModal(toModalId), 150);
}

// Form handling
function initializeForms() {
    // Login form (modal)
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            if (!email || !password) {
                showToast("Please fill in all fields.", "error");
                return;
            }
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showToast("Login successful! Welcome back.", "success");
                    closeModal("loginModal");
                    setTimeout(() => {
                        updateUIForLoggedInUser(data.user.email);
                    }, 500);
                } else {
                    showToast(data.message || "Login failed.", "error");
                }
            } catch (err) {
                showToast("Server error.", "error");
            }
        });
    }

    // Register form (modal)
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const firstName = document.getElementById("register-firstname")?.value;
            const lastName = document.getElementById("register-lastname")?.value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;
            const confirmPassword = document.getElementById("register-confirm").value;
            if (!email || !password || !confirmPassword) {
                showToast("Please fill in all fields.", "error");
                return;
            }
            if (password !== confirmPassword) {
                showToast("Passwords do not match.", "error");
                return;
            }
            if (password.length < 6) {
                showToast("Password must be at least 6 characters.", "error");
                return;
            }
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    showToast("Account created successfully! Please login.", "success");
                    closeModal("registerModal");
                    setTimeout(() => {
                        openModal("loginModal");
                    }, 500);
                } else {
                    showToast(data.message || "Registration failed.", "error");
                }
            } catch (err) {
                showToast("Server error.", "error");
            }
        });
    }

    // Newsletter form
    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const email = this.querySelector("input[type='email']").value;
            if (email) {
                showToast("Thank you for subscribing to our newsletter!", "success");
                this.reset();
            } else {
                showToast("Please enter a valid email address.", "error");
            }
        });
    }
}

// Category cards functionality
function initializeCategoryCards() {
    document.querySelectorAll(".category-item").forEach(card => {
        card.addEventListener("click", function() {
            const sport = this.dataset.sport;
            if (sport) {
                // Update sport filter
                if (sportFilter) {
                    sportFilter.value = sport;
                }
                // Clear other filters
                if (heroSearch) heroSearch.value = "";
                if (dateFilter) dateFilter.value = "";
                
                handleSearch();
                
                // Scroll to events section
                document.getElementById("events")?.scrollIntoView({
                    behavior: "smooth"
                });
                
                showToast(`Showing ${sport} events`, "success");
            }
        });
    });
}

// Event actions
function viewEvent(eventId) {
    const event = sampleEvents.find(e => e.id === eventId);
    if (event) {
        showToast(`Viewing ${event.title} details...`, "success");
        // In a real app, this would navigate to event details page
        console.log("Viewing event:", event);
    }
}

function bookEvent(eventId) {
    const event = sampleEvents.find(e => e.id === eventId);
    if (event) {
        showToast(`Booking ${event.title}...`, "success");
        // In a real app, this would open booking flow
        console.log("Booking event:", event);
    }
}

function loadMoreEvents() {
    // Add more events to current display
    const moreEvents = sampleEvents.filter(event => !event.featured);
    currentEvents = [...currentEvents, ...moreEvents];
    filteredEvents = [...currentEvents];
    renderEvents();
    showToast("More events loaded!", "success");
}

// Toast notifications
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="removeToast(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastWrapper.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add("show"), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => removeToast(toast.querySelector(".toast-close")), 5000);
}

function removeToast(closeButton) {
    const toast = closeButton.closest(".toast");
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("fade-in-up");
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll(".feature-item, .category-item, .event-card").forEach(el => {
        observer.observe(el);
    });
}

// UI updates for logged in user
function updateUIForLoggedInUser(email) {
    const navButtons = document.querySelector(".nav-buttons");
    if (navButtons) {
        navButtons.innerHTML = `
            <div class="user-menu">
                <span class="user-email">${email}</span>
                <button class="btn-outline" onclick="logout()">Logout</button>
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    showToast("Logged out successfully!", "success");
    // Reset nav buttons
    const navButtons = document.querySelector(".nav-buttons");
    if (navButtons) {
        navButtons.innerHTML = `
            <a href="login.html" class="btn-outline">Login</a>
            <a href="register.html" class="btn-primary">Sign Up</a>
            <button class="mobile-menu-btn" id="mobile-menu-btn">
                <i class="fas fa-bars"></i>
            </button>
        `;
        // Reinitialize navigation
        initializeNavigation();
    }
}

// --- Ensure admin user exists on load ---
(async function ensureAdminUser() {
    try {
        const res = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mamishovrasul028@gmail.com',
                password: 'R5661007'
            })
        });
        // If already exists, try to login and set admin flag in localStorage
        if (!res.ok) {
            const loginRes = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'mamishovrasul028@gmail.com',
                    password: 'R5661007'
                })
            });
            if (loginRes.ok) {
                const data = await loginRes.json();
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        }
    } catch (e) {
        // Ignore errors (e.g., server not running)
    }
})();

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        month: "short", 
        day: "numeric",
        weekday: "short"
    };
    return date.toLocaleDateString("en-US", options);
}

// Performance optimization
function lazyLoadImages() {
    const images = document.querySelectorAll("img[loading="lazy"]");
    
    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove("lazy");
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading
document.addEventListener("DOMContentLoaded", lazyLoadImages);

// Error handling
window.addEventListener("error", function(e) {
    console.error("JavaScript error:", e.error);
    showToast("Something went wrong. Please try again.", "error");
});

// Service worker registration (for PWA features)
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("/sw.js")
            .then(registration => {
                console.log("SW registered: ", registration);
            })
            .catch(registrationError => {
                console.log("SW registration failed: ", registrationError);
            });
    });
}
const socket = io('http://localhost:3000');

document.getElementById('chatFloatBtn').addEventListener('click', () => {
    document.getElementById('chatModal').classList.add('active');
});

document.getElementById('chatCloseBtn').addEventListener('click', () => {
    document.getElementById('chatModal').classList.remove('active');
});

document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (message) {
        socket.emit('chatMessage', { message, sender: 'user' });
        addMessage(message, 'user');
        input.value = '';
    }
});

socket.on('chatMessage', (data) => {
    addMessage(data.message, data.sender);
});

function addMessage(message, sender) {
    const chatBody = document.getElementBy
