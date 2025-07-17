// Global variables
let events = [];
let currentEditingEvent = null;

// Check if user is admin on page load
document.addEventListener("DOMContentLoaded", function() {
    // Skip authentication check for demo purposes
    // checkAdminAuth();
    loadEvents();
    updateDashboardStats();
});

// Authentication check
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.is_admin) {
        window.location.href = "index.html";
        return;
    }
}

// Logout function
function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// API helper function
async function apiCall(endpoint, method = "GET", data = null) {
    const token = localStorage.getItem("access_token");
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
        }
    };

    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`/api${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || "API request failed");
        }
        
        return result;
    } catch (error) {
        console.error("API Error:", error);
        showNotification(error.message, "error");
        throw error;
    }
}

// Load events from API
async function loadEvents() {
    try {
        const response = await apiCall("/events");
        events = response.events || [];
        renderEventsTable();
        updateDashboardStats();
    } catch (error) {
        console.error("Error loading events:", error);
        showNotification("Failed to load events", "error");
    }
}

// Render events table
function renderEventsTable() {
    const tbody = document.getElementById("events-table-body");
    tbody.innerHTML = "";

    if (events.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: #7f8c8d;">
                    <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No events found. Click "Add New Event" to create your first event.
                </td>
            </tr>
        `;
        return;
    }

    events.forEach(event => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${event.id}</td>
            <td><strong>${event.title}</strong></td>
            <td><span style="text-transform: capitalize;">${event.sport}</span></td>
            <td>${event.venue}</td>
            <td>${formatDate(event.date)}</td>
            <td>${event.time}</td>
            <td>$${parseFloat(event.price).toFixed(2)}</td>
            <td>
                ${event.featured 
                    ? "<span class=\"featured-badge\"><i class=\"fas fa-star\"></i> Featured</span>" 
                    : "<span class=\"not-featured\">Not Featured</span>"
                }
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editEvent(${event.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalEvents = events.length;
    const featuredEvents = events.filter(event => event.featured).length;
    const today = new Date().toISOString().split("T")[0];
    const upcomingEvents = events.filter(event => event.date >= today).length;

    document.getElementById("total-events").textContent = totalEvents;
    document.getElementById("featured-events").textContent = featuredEvents;
    document.getElementById("upcoming-events").textContent = upcomingEvents;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// Filter events
function filterEvents() {
    const searchTerm = document.getElementById("search-events").value.toLowerCase();
    const sportFilter = document.getElementById("sport-filter").value;

    let filteredEvents = events;

    if (searchTerm) {
        filteredEvents = filteredEvents.filter(event =>
            event.title.toLowerCase().includes(searchTerm) ||
            event.venue.toLowerCase().includes(searchTerm) ||
            event.sport.toLowerCase().includes(searchTerm)
        );
    }

    if (sportFilter) {
        filteredEvents = filteredEvents.filter(event => event.sport === sportFilter);
    }

    // Temporarily replace events array for rendering
    const originalEvents = events;
    events = filteredEvents;
    renderEventsTable();
    events = originalEvents;
}

// Modal functions
function openAddEventModal() {
    currentEditingEvent = null;
    document.getElementById("modal-title").textContent = "Add New Event";
    document.getElementById("event-form").reset();
    document.getElementById("event-modal").style.display = "block";
}

function editEvent(eventId) {
    currentEditingEvent = events.find(event => event.id === eventId);
    if (!currentEditingEvent) return;

    document.getElementById("modal-title").textContent = "Edit Event";
    document.getElementById("event-title").value = currentEditingEvent.title;
    document.getElementById("event-sport").value = currentEditingEvent.sport;
    document.getElementById("event-venue").value = currentEditingEvent.venue;
    document.getElementById("event-date").value = currentEditingEvent.date;
    document.getElementById("event-time").value = currentEditingEvent.time;
    document.getElementById("event-price").value = currentEditingEvent.price;
    document.getElementById("event-image").value = currentEditingEvent.image || "";
    document.getElementById("event-featured").checked = currentEditingEvent.featured;

    document.getElementById("event-modal").style.display = "block";
}

function closeEventModal() {
    document.getElementById("event-modal").style.display = "none";
    currentEditingEvent = null;
}

// Save event (create or update)
async function saveEvent(event) {
    event.preventDefault();

    // Get form values
    const title = document.getElementById("event-title").value;
    const sport = document.getElementById("event-sport").value;
    const venue = document.getElementById("event-venue").value;
    const dateInput = document.getElementById("event-date");
    const timeInput = document.getElementById("event-time");
    const price = parseFloat(document.getElementById("event-price").value);
    const image = document.getElementById("event-image").value;
    const featured = document.getElementById("event-featured").checked;

    // Validate inputs to prevent null errors
    if (!dateInput || !timeInput) {
        showNotification("Date or Time input element not found.", "error");
        return;
    }

    // Get values after checking for null
    const dateValue = dateInput.value;
    const timeValue = timeInput.value;

    // Convert date format from MM/DD/YYYY to YYYY-MM-DD (if needed)
    let formattedDate = dateValue;
    // Assuming dateValue is already in YYYY-MM-DD from input type="date"
    // If user inputs MM/DD/YYYY, convert it
    if (dateValue.includes("/")) {
        const dateParts = dateValue.split("/");
        if (dateParts.length === 3) {
            formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`;
        }
    }

    // Convert time format from 12-hour to 24-hour (if needed)
    let formattedTime = timeValue;
    // Assuming timeValue is already in HH:MM from input type="time"
    // If user inputs 12-hour format, convert it
    if (timeValue.includes("AM") || timeValue.includes("PM")) {
        const timeStr = timeValue.replace(/\s+/g, "");
        const isPM = timeStr.includes("PM");
        const timeOnly = timeStr.replace(/AM|PM/g, "");
        const [hours, minutes] = timeOnly.split(":");
        let hour24 = parseInt(hours);
        
        if (isPM && hour24 !== 12) {
            hour24 += 12;
        } else if (!isPM && hour24 === 12) {
            hour24 = 0;
        }
        
        formattedTime = `${hour24.toString().padStart(2, "0")}:${minutes}`;
    }

    const eventData = {
        title: title,
        sport: sport,
        venue: venue,
        date: formattedDate,
        time: formattedTime,
        price: price,
        image: image,
        featured: featured
    };

    try {
        let response;
        if (currentEditingEvent) {
            // Update existing event
            response = await apiCall(`/events/${currentEditingEvent.id}`, "PUT", eventData);
            showNotification("Event updated successfully!", "success");
        } else {
            // Create new event
            response = await apiCall("/events", "POST", eventData);
            showNotification("Event created successfully!", "success");
        }

        closeEventModal();
        loadEvents(); // Reload events to reflect changes
    } catch (error) {
        console.error("Error saving event:", error);
        showNotification(`Error saving event: ${error.message}`, "error");
    }
}

// Delete event
async function deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
        return;
    }

    try {
        await apiCall(`/events/${eventId}`, "DELETE");
        showNotification("Event deleted successfully!", "success");
        loadEvents(); // Reload events to reflect changes
    } catch (error) {
        console.error("Error deleting event:", error);
        showNotification(`Error deleting event: ${error.message}`, "error");
    }
}

// Show notification
function showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById("event-modal");
    if (event.target === modal) {
        closeEventModal();
    }
}

// Handle escape key to close modal
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeEventModal();
    }
});
