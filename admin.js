// Global variables
let events = [];
let features = [];
let currentEditingEvent = null;
let currentEditingFeature = null;

// Check if user is admin on page load
document.addEventListener("DOMContentLoaded", function() {
    // Skip authentication check for demo purposes
    // checkAdminAuth();
    loadEvents();
    loadFeatures();
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

// Tab management
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked tab button
    event.target.classList.add('active');
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
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error("API did not return JSON. Response was: " + text.substring(0, 200));
        }
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

// Load features from API
async function loadFeatures() {
    try {
        const response = await apiCall("/features");
        features = response.features || [];
        renderFeaturesTable();
        updateDashboardStats();
    } catch (error) {
        console.error("Error loading features:", error);
        showNotification("Failed to load features", "error");
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

// Render features table
function renderFeaturesTable() {
    const tbody = document.getElementById("features-table-body");
    tbody.innerHTML = "";

    if (features.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #7f8c8d;">
                    <i class="fas fa-cogs" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No features found. Click "Add New Feature" to create your first feature.
                </td>
            </tr>
        `;
        return;
    }

    features.forEach(feature => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${feature.id}</td>
            <td><strong>${feature.name}</strong></td>
            <td>${feature.description || 'No description'}</td>
            <td>${feature.category ? `<span class="category-badge">${feature.category}</span>` : '-'}</td>
            <td>
                <span class="status-badge status-${feature.status}">
                    ${feature.status}
                </span>
            </td>
            <td>${formatDate(feature.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editFeature(${feature.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteFeature(${feature.id})">
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
    
    const totalFeatures = features.length;
    const enabledFeatures = features.filter(feature => feature.status === 'enabled').length;

    document.getElementById("total-events").textContent = totalEvents;
    document.getElementById("featured-events").textContent = featuredEvents;
    document.getElementById("upcoming-events").textContent = upcomingEvents;
    document.getElementById("total-features").textContent = totalFeatures;
    document.getElementById("enabled-features").textContent = enabledFeatures;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
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

// Filter features
function filterFeatures() {
    const searchTerm = document.getElementById("search-features").value.toLowerCase();
    const statusFilter = document.getElementById("status-filter").value;
    const categoryFilter = document.getElementById("category-filter").value;

    let filteredFeatures = features;

    if (searchTerm) {
        filteredFeatures = filteredFeatures.filter(feature =>
            feature.name.toLowerCase().includes(searchTerm) ||
            (feature.description && feature.description.toLowerCase().includes(searchTerm)) ||
            (feature.category && feature.category.toLowerCase().includes(searchTerm))
        );
    }

    if (statusFilter) {
        filteredFeatures = filteredFeatures.filter(feature => feature.status === statusFilter);
    }

    if (categoryFilter) {
        filteredFeatures = filteredFeatures.filter(feature => feature.category === categoryFilter);
    }

    // Temporarily replace features array for rendering
    const originalFeatures = features;
    features = filteredFeatures;
    renderFeaturesTable();
    features = originalFeatures;
}

// Event modal functions
function openAddEventModal() {
    currentEditingEvent = null;
    document.getElementById("event-modal-title").textContent = "Add New Event";
    document.getElementById("event-form").reset();
    document.getElementById("event-modal").style.display = "block";
}

function editEvent(eventId) {
    currentEditingEvent = events.find(event => event.id === eventId);
    if (!currentEditingEvent) return;

    document.getElementById("event-modal-title").textContent = "Edit Event";
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

// Feature modal functions
function openAddFeatureModal() {
    currentEditingFeature = null;
    document.getElementById("feature-modal-title").textContent = "Add New Feature";
    document.getElementById("feature-form").reset();
    document.getElementById("feature-modal").style.display = "block";
}

function editFeature(featureId) {
    currentEditingFeature = features.find(feature => feature.id === featureId);
    if (!currentEditingFeature) return;

    document.getElementById("feature-modal-title").textContent = "Edit Feature";
    document.getElementById("feature-name").value = currentEditingFeature.name;
    document.getElementById("feature-description").value = currentEditingFeature.description || "";
    document.getElementById("feature-status").value = currentEditingFeature.status;
    document.getElementById("feature-category").value = currentEditingFeature.category || "";

    document.getElementById("feature-modal").style.display = "block";
}

function closeFeatureModal() {
    document.getElementById("feature-modal").style.display = "none";
    currentEditingFeature = null;
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

    const eventData = {
        title: title,
        sport: sport,
        venue: venue,
        date: dateValue,
        time: timeValue,
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

// Save feature (create or update)
async function saveFeature(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById("feature-name").value;
    const description = document.getElementById("feature-description").value;
    const status = document.getElementById("feature-status").value;
    const category = document.getElementById("feature-category").value;

    const featureData = {
        name: name,
        description: description,
        status: status,
        category: category
    };

    try {
        let response;
        if (currentEditingFeature) {
            // Update existing feature
            response = await apiCall(`/features/${currentEditingFeature.id}`, "PUT", featureData);
            showNotification("Feature updated successfully!", "success");
        } else {
            // Create new feature
            response = await apiCall("/features", "POST", featureData);
            showNotification("Feature created successfully!", "success");
        }

        closeFeatureModal();
        loadFeatures(); // Reload features to reflect changes
    } catch (error) {
        console.error("Error saving feature:", error);
        showNotification(`Error saving feature: ${error.message}`, "error");
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

// Delete feature
async function deleteFeature(featureId) {
    if (!confirm("Are you sure you want to delete this feature? This action cannot be undone.")) {
        return;
    }

    try {
        await apiCall(`/features/${featureId}`, "DELETE");
        showNotification("Feature deleted successfully!", "success");
        loadFeatures(); // Reload features to reflect changes
    } catch (error) {
        console.error("Error deleting feature:", error);
        showNotification(`Error deleting feature: ${error.message}`, "error");
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
    const eventModal = document.getElementById("event-modal");
    const featureModal = document.getElementById("feature-modal");
    
    if (event.target === eventModal) {
        closeEventModal();
    }
    if (event.target === featureModal) {
        closeFeatureModal();
    }
}

// Handle escape key to close modal
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeEventModal();
        closeFeatureModal();
    }
});

