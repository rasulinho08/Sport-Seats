// Events Page JavaScript

class EventsManager {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadEvents();
    }

    cacheElements() {
        this.eventsGrid = document.getElementById("events-grid");
        this.mobileMenuBtn = document.getElementById("mobile-menu-btn");
        this.navLinks = document.getElementById("nav-links");
    }

    bindEvents() {
        // Mobile menu
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener("click", this.toggleMobileMenu.bind(this));
        }

        // Event card interactions
        this.eventsGrid.addEventListener("click", this.handleEventClick.bind(this));
    }

    async loadEvents() {
        try {
            const response = await fetch("/api/events");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.events = data.events;
            this.filteredEvents = [...this.events];
            this.renderEvents();
        } catch (error) {
            console.error("Error fetching events:", error);
            this.eventsGrid.innerHTML = `<p class="error-message">Failed to load events. Please try again later.</p>`;
        }
    }

    renderEvents() {
        this.eventsGrid.innerHTML = ""; // Clear previous events

        if (this.filteredEvents.length === 0) {
            this.eventsGrid.innerHTML = `<p class="no-events-message">No events found.</p>`;
            return;
        }

        this.filteredEvents.forEach(event => {
            const eventCard = document.createElement("div");
            eventCard.classList.add("event-card");
            eventCard.innerHTML = `
                <div class="event-image-container">
                    <img src="${event.image}" alt="${event.title}" class="event-image">
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-meta">
                        <i class="fas fa-futbol"></i>
                        <span>${event.sport}</span>
                    </div>
                    <div class="event-meta">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.venue}</span>
                    </div>
                    <div class="event-meta">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${this.formatDate(event.date)} at ${event.time}</span>
                    </div>
                    <div class="event-price">
                        <i class="fas fa-dollar-sign"></i>
                        <span>From $${event.price.toFixed(2)}</span>
                    </div>
                    <div class="event-actions">
                        <button class="btn-primary" data-event-id="${event.id}">Buy Tickets</button>
                    </div>
                </div>
            `;
            this.eventsGrid.appendChild(eventCard);
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    handleEventClick(event) {
        const buyTicketsBtn = event.target.closest(".btn-primary");
        if (buyTicketsBtn && buyTicketsBtn.textContent.includes("Buy Tickets")) {
            event.preventDefault();
            const eventId = buyTicketsBtn.dataset.eventId;
            this.handleBuyTickets(eventId);
            return;
        }
    }

    handleBuyTickets(eventId) {
        const event = this.events.find(e => e.id == eventId);
        if (event) {
            this.showNotification(`Redirecting to ticket purchase for ${event.title}...`, "info");
            // Here you would typically redirect to a ticket purchase page
            // For demo purposes, we'll just show a notification
            setTimeout(() => {
                this.showNotification("Ticket purchase feature coming soon!", "info");
            }, 1500);
        }
    }

    toggleMobileMenu() {
        this.navLinks.classList.toggle("active");
        const icon = this.mobileMenuBtn.querySelector("i");
        if (this.navLinks.classList.contains("active")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-times");
        } else {
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
        }
    }

    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.classList.add("notification", `notification-${type}`);
        notification.textContent = message;
        
        // Add notification styles if they don't exist
        if (!document.querySelector("style[data-notifications]")) {
            const style = document.createElement("style");
            style.setAttribute("data-notifications", "true");
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification-info {
                    background-color: #2196F3;
                }
                .notification-success {
                    background-color: #4CAF50;
                }
                .notification-error {
                    background-color: #f44336;
                }
                .notification-warning {
                    background-color: #FF9800;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add("show");
        }, 10);

        setTimeout(() => {
            notification.classList.remove("show");
            notification.addEventListener("transitionend", () => {
                notification.remove();
            });
        }, 3000);
    }
}

// Initialize the events manager when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    window.eventsManager = new EventsManager();
});

