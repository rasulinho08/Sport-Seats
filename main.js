// DOM Elements
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navLinks = document.getElementById("nav-links");
const eventsList = document.getElementById("events-list");
const heroSearch = document.getElementById("hero-search");
const sportFilter = document.getElementById("sport-filter");
const dateFilter = document.getElementById("date-filter");
const toastWrapper = document.getElementById("toast-wrapper");



// ...existing code...
const sampleEvents = [
    {
        id: 1,
        title: "NFL: Patriots vs. Jets",
        venue: "Gillette Stadium",
        date: "2025-08-15",
        sport: "football",
        price: 99,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
        featured: true
    },
    {
        id: 2,
        title: "NBA: Lakers vs. Celtics",
        venue: "Staples Center",
        date: "2025-08-20",
        sport: "basketball",
        price: 150,
        image: "",
        featured: true
    },
    {
        id: 3,
        title: "MLB: Yankees vs. Red Sox",
        venue: "Yankee Stadium",
        date: "2025-08-25",
        sport: "baseball",
        price: 85,
        image: "",
        featured: false
    },
    {
        id: 4,
        title: "MLS: LA Galaxy vs. Seattle Sounders",
        venue: "Dignity Health Sports Park",
        date: "2025-09-05",
        sport: "soccer",
        price: 70,
        image: "",
        featured: true
    },
    {
        id: 5,
        title: "UFC 310: Main Event",
        venue: "T-Mobile Arena",
        date: "2025-09-12",
        sport: "mma",
        price: 250,
        image: "https://example.com/ufc-310.jpg",
        featured: false
    },
    {
        id: 6,
        title: "NHL: Rangers vs. Islanders",
        venue: "Madison Square Garden",
        date: "2025-10-10",
        sport: "hockey",
        price: 120,
        image: "https://example.com/rangers-islanders.jpg",
        featured: true
    },
    {
        id: 7,
        title: "F1: United States Grand Prix",
        venue: "Circuit of the Americas",
        date: "2025-10-19",
        sport: "motorsport",
        price: 300,
        image: "https://example.com/f1-usgp.jpg",
        featured: false
    }
];

// State
let currentEvents = sampleEvents.filter(event => event.featured);
// ...existing
// State
let filteredEvents = [...currentEvents];

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    console.log('Main DOMContentLoaded: Initializing core features');
    initializeNavigation();
    initializeSearch();
    initializeModals();
    initializeForms();
    initializeCategoryCards();
    renderEvents();
    initializeScrollAnimations();
});

// Initialize Socket.IO
const socket = io('http://localhost:3000', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

// Navigation functionality
function initializeNavigation() {
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

    document.querySelectorAll(".nav-item").forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            
            if (targetId.startsWith("about.html") || targetId.startsWith("venues.html") || 
                targetId.startsWith("shop.html") || targetId.startsWith("login.html") || 
                targetId.startsWith("register.html") || targetId.startsWith("admin.html")) {
                window.location.href = targetId;
                return;
            }

            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
                
                navLinks.classList.remove("active");
                const icon = mobileMenuBtn.querySelector("i");
                icon.classList.replace("fa-times", "fa-bars");
                
                document.querySelectorAll(".nav-item").forEach(l => l.classList.remove("active"));
                this.classList.add("active");
            }
        });
    });

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
    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

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
        console.log(`Opening modal: ${modalId}`);
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    } else {
        console.error(`Modal with ID ${modalId} not found`);
        showToast("Error opening modal. Please try again.", "error");
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        console.log(`Closing modal: ${modalId}`);
        modal.classList.remove("active");
        document.body.style.overflow = "";
    } else {
        console.error(`Modal with ID ${modalId} not found`);
    }
}

function switchModal(fromModalId, toModalId) {
    closeModal(fromModalId);
    setTimeout(() => openModal(toModalId), 150);
}

// Form handling
function initializeForms() {
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
                const res = await fetch('http://localhost:5000/api/login', {
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
                const res = await fetch('http://localhost:5000/api/register', {
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
                if (sportFilter) {
                    sportFilter.value = sport;
                }
                if (heroSearch) heroSearch.value = "";
                if (dateFilter) dateFilter.value = "";
                
                handleSearch();
                
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
        console.log("Viewing event:", event);
    }
}

function bookEvent(eventId) {
    const event = sampleEvents.find(e => e.id === eventId);
    if (event) {
        showToast(`Booking ${event.title}...`, "success");
        console.log("Booking event:", event);
    }
}

function loadMoreEvents() {
    const moreEvents = sampleEvents.filter(event => !event.featured);
    currentEvents = [...currentEvents, ...moreEvents];
    filteredEvents = [...currentEvents];
    renderEvents();
    showToast("More events loaded!", "success");
}

// Toast notifications
function showToast(message, type = "success") {
    if (!toastWrapper) {
        console.error('Toast wrapper not found');
        return;
    }
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
    
    setTimeout(() => toast.classList.add("show"), 100);
    
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
                ${email === 'mamishovrasul028@gmail.com' ? '<a href="admin.html" class="btn-outline" id="admin-panel-link" style="margin-left:10px;">Admin Panel</a>' : ''}
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    showToast("Logged out successfully!", "success");
    const navButtons = document.querySelector(".nav-buttons");
    if (navButtons) {
        navButtons.innerHTML = `
            <a href="login.html" class="btn-outline">Login</a>
            <a href="register.html" class="btn-primary">Sign Up</a>
            <button class="mobile-menu-btn" id="mobile-menu-btn">
                <i class="fas fa-bars"></i>
            </button>
        `;
        initializeNavigation();
    }
}

// Ensure admin user (optional, comment out if no backend at port 5000)
/*(async function ensureAdminUser() {
    try {
        const res = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mamishovrasul028@gmail.com',
                password: 'R5661007'
            })
        });
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
                updateUIForLoggedInUser(data.user.email);
            }
        }
    } catch (e) {
        console.log('Admin user setup skipped (no backend at port 5000)');
    }
})();*/

// Chat functionality
function initializeChat() {
    const chatFloatBtn = document.getElementById('chatFloatBtn');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatModal = document.getElementById('chatModal');
    const chatForm = document.getElementById('chatForm');
    const chatMessages = document.getElementById('chatMessages');

    // Debug: Log element presence
    console.log('Chat elements found:', {
        chatFloatBtn: !!chatFloatBtn,
        chatCloseBtn: !!chatCloseBtn,
        chatModal: !!chatModal,
        chatForm: !!chatForm,
        chatMessages: !!chatMessages
    });

    // Check for critical elements
    if (!chatFloatBtn || !chatModal) {
        console.error('Chat button or modal not found');
        showToast('Chat feature unavailable. Please refresh the page.', 'error');
        return;
    }

    // Clone button to clear any existing listeners
    const newChatFloatBtn = chatFloatBtn.cloneNode(true);
    chatFloatBtn.parentNode.replaceChild(newChatFloatBtn, chatFloatBtn);

    // Add click event for chat button
    newChatFloatBtn.addEventListener('click', () => {
        console.log('Chat button clicked!');
        openModal('chatModal');
    });

    // Add close button event if present
    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => {
            console.log('Chat close button clicked');
            closeModal('chatModal');
        });
    }

    // Handle form submission if form exists
    if (chatForm && chatMessages) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            const user = JSON.parse(localStorage.getItem('user')) || { email: 'Guest' };

            if (message) {
                const messageData = {
                    message,
                    sender: user.email === 'mamishovrasul028@gmail.com' ? 'support' : 'user',
                    email: user.email,
                    timestamp: new Date().toISOString()
                };
                console.log('Sending message:', messageData);
                socket.emit('chatMessage', messageData);
                addMessage(messageData);
                input.value = '';
            } else {
                showToast('Please enter a message.', 'error');
            }
        });

        // Handle incoming messages
        socket.on('chatMessage', (data) => {
            console.log('Received message:', data);
            addMessage(data);
        });

        // Handle connection errors
        socket.on('connect_error', (err) => {
            console.error('Socket.IO connection error:', err);
            showToast('Unable to connect to chat server. Please try again later.', 'error');
        });

        // Handle reconnection
        socket.on('reconnect', () => {
            showToast('Reconnected to chat server!', 'success');
        });
    }
}

// Add message to chat body
function addMessage(data) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return;
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', data.sender);
    messageElement.innerHTML = `
        <div class="chat-message-content">
            <p>${data.message}</p>
            <div class="chat-message-timestamp">${formatDate(data.timestamp)}</div>
        </div>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize chat on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Chat DOMContentLoaded: Initializing chat');
    initializeChat();
});

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
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit"
    };
    return date.toLocaleDateString("en-US", options);
}

// Performance optimization
function lazyLoadImages() {
    const images = document.querySelectorAll("img[loading='lazy']");
    
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
