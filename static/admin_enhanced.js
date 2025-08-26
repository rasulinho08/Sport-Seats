document.addEventListener("DOMContentLoaded", () => {
    const sidebarLinks = document.querySelectorAll(".sidebar nav ul li a");
    const adminSections = document.querySelectorAll(".admin-section");
    const logoutButton = document.getElementById("logoutButton");

    const userModal = document.getElementById("userModal");
    const addUserBtn = document.getElementById("addUserBtn");
    const userForm = document.getElementById("userForm");
    const userIdField = document.getElementById("userId");
    const userEmailField = document.getElementById("userEmail");
    const userPasswordField = document.getElementById("userPassword");
    const userIsAdminField = document.getElementById("userIsAdmin");

    const eventModal = document.getElementById("eventModal");
    const addEventBtn = document.getElementById("addEventBtn");
    const eventForm = document.getElementById("eventForm");
    const eventIdField = document.getElementById("eventId");
    const eventTitleField = document.getElementById("eventTitle");
    const eventSportField = document.getElementById("eventSport");
    const eventVenueField = document.getElementById("eventVenue");
    const eventDateField = document.getElementById("eventDate");
    const eventTimeField = document.getElementById("eventTime");
    const eventPriceField = document.getElementById("eventPrice");
    const eventImageField = document.getElementById("eventImage");

    const closeButtons = document.querySelectorAll(".modal .close-button");

    // --- MOCK DATA (FOR DEMONSTRATION PURPOSES) ---
    const mockData = {
        users: [
            {
                id: 1,
                email: "example123@gmail.com",
                is_admin: false,
                created_at: "2025-08-27"
            },
            {
                id: 2,
                email: "admin.user@sportsseat.com",
                is_admin: true,
                created_at: "2025-07-01"
            }
        ],
        events: [
            {
                id: 101,
                title: "NFL: Detroit Lions vs. Los Angeles Chargers (Hall of Fame Game)",
                sport: "National Football League",
                venue: "Tom Benson Hall of Fame Stadium",
                date: "2025-08-15",
                time: "20:00",
                price: 172.50,
                image: "/static/images/football.jpg"
            },
            {
                id: 102,
                title: "Basketball Championship",
                sport: "BasketbalNFL Preseason: Pittsburgh Steelers vs. Carolina Panthersl",
                venue: "City Arena",
                date: "2025-11-10",
                time: "19:30",
                price: 80.00,
                image: "/static/images/basketball.jpg"
            }
        ],
        bookings: [
            {
                id: 1001,
                user_email: "example123@gmail.com",
                event_title: "Grand Football Final",
                num_tickets: 4,
                total_price: 690.00,
                status: "Confirmed",
                booking_date: "2025-02-01T14:00:00Z"
            },
     
        ],
        payments: [
            {
                id: 2001,
                user_email: "example123@gmail.com",
                amount: 690.00,
                status: "Completed",
                payment_date: "2025-08-27"
            },
   
        ],
        stats: {
            total_users: 2,
            total_events: 2,
            total_bookings: 1,
            total_revenue: 380.00,
            revenue_over_time: [
                { month: "Jan", revenue: 100 },
                { month: "Feb", revenue: 280 },
                { month: "Mar", revenue: 50 }
            ],
            users_by_month: [
                { month: "Jan", count: 1 },
                { month: "Nov", count: 1 }
            ],
            bookings_by_event: [
                { event_title: "NFL Preseason: Pittsburgh Steelers vs. Carolina Panthers,", count: 1 }
            ]
        }
    };

    // --- Helper Functions ---
    function getToken() {
        return localStorage.getItem("access_token");
    }

    function showSection(sectionId) {
        adminSections.forEach(section => {
            section.classList.remove("active");
        });
        document.getElementById(sectionId).classList.add("active");

        sidebarLinks.forEach(link => {
            link.classList.remove("active");
            if (link.dataset.section === sectionId) {
                link.classList.add("active");
            }
        });
    }

    function showModal(modal) {
        modal.style.display = "flex";
    }

    function hideModal(modal) {
        modal.style.display = "none";
    }

    // Modified fetchData to use mockData if available for admin panel
    async function fetchData(url, method = "GET", body = null) {
        // Check if the request is for admin data and if mockData exists
        if (url.startsWith("/api/admin/")) {
            const endpoint = url.replace("/api/admin/", "").split("/")[0];
            if (mockData[endpoint]) {
                console.log(`Using mock data for ${endpoint}`);
                // Simulate async behavior
                return new Promise(resolve => setTimeout(() => {
                    if (method === "GET") {
                        resolve(mockData[endpoint]);
                    } else if (method === "POST") {
                        // Simulate adding new item
                        const newItem = { id: Math.floor(Math.random() * 10000) + 1000, ...body };
                        mockData[endpoint].push(newItem);
                        resolve({ message: `${endpoint} added successfully!`, [endpoint.slice(0, -1)]: newItem });
                    } else if (method === "PUT") {
                        // Simulate updating item
                        const id = url.split("/").pop();
                        const index = mockData[endpoint].findIndex(item => item.id == id);
                        if (index !== -1) {
                            mockData[endpoint][index] = { ...mockData[endpoint][index], ...body };
                            resolve({ message: `${endpoint} updated successfully!` });
                        } else {
                            throw new Error(`${endpoint} not found`);
                        }
                    } else if (method === "DELETE") {
                        // Simulate deleting item
                        const id = url.split("/").pop();
                        mockData[endpoint] = mockData[endpoint].filter(item => item.id != id);
                        resolve({ message: `${endpoint} deleted successfully!` });
                    }
                }, 500));
            } else if (endpoint === "stats" && mockData.stats) {
                console.log("Using mock data for stats");
                return new Promise(resolve => setTimeout(() => resolve(mockData.stats), 500));
            } else if (endpoint === "reports" && mockData.reports) {
                console.log("Using mock data for reports");
                return new Promise(resolve => setTimeout(() => resolve(mockData.reports), 500));
            }
        }

        // Fallback to actual API call if not mock data or not admin endpoint
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        };

        const options = {
            method,
            headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    function showAlert(message, type = "success") {
        alert(`${type.toUpperCase()}: ${message}`);
    }

    // --- Load Data Functions (now using fetchData which can use mock data) ---
    async function loadDashboardStats() {
        try {
            const stats = await fetchData("/api/admin/stats");
            document.getElementById("totalUsers").textContent = stats.total_users;
            document.getElementById("totalEvents").textContent = stats.total_events;
            document.getElementById("totalBookings").textContent = stats.total_bookings;
            document.getElementById("totalRevenue").textContent = `$${stats.total_revenue.toFixed(2)}`;

            // Revenue Chart (using Chart.js)
            const ctx = document.getElementById("revenueChart").getContext("2d");
            // Destroy existing chart if it exists
            if (window.revenueChartInstance) {
                window.revenueChartInstance.destroy();
            }
            window.revenueChartInstance = new Chart(ctx, {
                type: "line",
                data: {
                    labels: stats.revenue_over_time.map(d => d.month),
                    datasets: [{
                        label: "Revenue",
                        data: stats.revenue_over_time.map(d => d.revenue),
                        borderColor: "#6a11cb",
                        backgroundColor: "rgba(106, 17, 203, 0.2)",
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Error loading dashboard stats:", error);
            showAlert("Failed to load dashboard stats.", "error");
        }
    }

    async function loadUsers() {
        try {
            const users = await fetchData("/api/admin/users");
            const tbody = document.getElementById("userTableBody");
            tbody.innerHTML = "";
            users.forEach(user => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.email}</td>
                    <td>${user.is_admin ? "Yes" : "No"}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td class="action-buttons">
                        <button class="edit" data-id="${user.id}" data-type="user"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete" data-id="${user.id}" data-type="user"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
            });
            addTableEventListeners();
        } catch (error) {
            console.error("Error loading users:", error);
            showAlert("Failed to load users.", "error");
        }
    }

    async function loadEvents() {
        try {
            const events = await fetchData("/api/admin/events");
            const tbody = document.getElementById("eventTableBody");
            tbody.innerHTML = "";
            events.forEach(event => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${event.id}</td>
                    <td>${event.title}</td>
                    <td>${event.sport}</td>
                    <td>${event.venue}</td>
                    <td>${event.date}</td>
                    <td>$${event.price.toFixed(2)}</td>
                    <td class="action-buttons">
                        <button class="edit" data-id="${event.id}" data-type="event"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete" data-id="${event.id}" data-type="event"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
            });
            addTableEventListeners();
        } catch (error) {
            console.error("Error loading events:", error);
            showAlert("Failed to load events.", "error");
        }
    }

    async function loadBookings() {
        try {
            const bookings = await fetchData("/api/admin/bookings");
            const tbody = document.getElementById("bookingTableBody");
            tbody.innerHTML = "";
            bookings.forEach(booking => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${booking.id}</td>
                    <td>${booking.user_email}</td>
                    <td>${booking.event_title}</td>
                    <td>${booking.num_tickets}</td>
                    <td>$${booking.total_price.toFixed(2)}</td>
                    <td>${booking.status}</td>
                    <td class="action-buttons">
                        <button class="edit" data-id="${booking.id}" data-type="booking"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete" data-id="${booking.id}" data-type="booking"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
            });
            addTableEventListeners();
        } catch (error) {
            console.error("Error loading bookings:", error);
            showAlert("Failed to load bookings.", "error");
        }
    }

    async function loadPayments() {
        try {
            const payments = await fetchData("/api/admin/payments");
            const tbody = document.getElementById("paymentTableBody");
            tbody.innerHTML = "";
            payments.forEach(payment => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${payment.id}</td>
                    <td>${payment.user_email}</td>
                    <td>$${payment.amount.toFixed(2)}</td>
                    <td>${payment.status}</td>
                    <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td class="action-buttons">
                        <button class="edit" data-id="${payment.id}" data-type="payment"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete" data-id="${payment.id}" data-type="payment"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
            });
            addTableEventListeners();
        } catch (error) {
            console.error("Error loading payments:", error);
            showAlert("Failed to load payments.", "error");
        }
    }

    async function loadReports() {
        try {
            const reports = await fetchData("/api/admin/reports");

            // Users by Registration Month Chart
            const usersByMonthCtx = document.getElementById("usersByMonthChart").getContext("2d");
            if (window.usersByMonthChartInstance) {
                window.usersByMonthChartInstance.destroy();
            }
            window.usersByMonthChartInstance = new Chart(usersByMonthCtx, {
                type: "bar",
                data: {
                    labels: reports.users_by_month.map(d => d.month),
                    datasets: [{
                        label: "New Users",
                        data: reports.users_by_month.map(d => d.count),
                        backgroundColor: "#2575fc",
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Bookings by Event Chart
            const bookingsByEventCtx = document.getElementById("bookingsByEventChart").getContext("2d");
            if (window.bookingsByEventChartInstance) {
                window.bookingsByEventChartInstance.destroy();
            }
            window.bookingsByEventChartInstance = new Chart(bookingsByEventCtx, {
                type: "pie",
                data: {
                    labels: reports.bookings_by_event.map(d => d.event_title),
                    datasets: [{
                        data: reports.bookings_by_event.map(d => d.count),
                        backgroundColor: [
                            "#6a11cb", "#2575fc", "#FF6384", "#36A2EB", "#FFCE56",
                            "#4BC0C0", "#9966FF", "#FF9900", "#C9CBCF", "#8AC926"
                        ],
                    }]
                },
                options: {
                    responsive: true,
                }
            });

        } catch (error) {
            console.error("Error loading reports:", error);
            showAlert("Failed to load reports.", "error");
        }
    }

    // --- Event Listeners ---
    sidebarLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            if (sectionId) {
                showSection(sectionId);
                // Load data specific to the section
                if (sectionId === "dashboard") loadDashboardStats();
                if (sectionId === "users") loadUsers();
                if (sectionId === "events") loadEvents();
                if (sectionId === "bookings") loadBookings();
                if (sectionId === "payments") loadPayments();
                if (sectionId === "reports") loadReports();
            }
        });
    });

    logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("access_token");
        window.location.href = "/login.html"; // Redirect to login page
    });

    closeButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            hideModal(e.target.closest(".modal"));
        });
    });

    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            hideModal(e.target);
        }
    });

    // User Modal Logic
    addUserBtn.addEventListener("click", () => {
        userForm.reset();
        userIdField.value = "";
        userPasswordField.required = true;
        showModal(userModal);
    });

    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = userIdField.value;
        const email = userEmailField.value;
        const password = userPasswordField.value;
        const is_admin = userIsAdminField.checked;

        const userData = { email, is_admin };
        if (password) {
            userData.password = password;
        }

        try {
            if (id) {
                await fetchData(`/api/admin/users/${id}`, "PUT", userData);
                showAlert("User updated successfully!");
            } else {
                await fetchData("/api/admin/users", "POST", userData);
                showAlert("User added successfully!");
            }
            hideModal(userModal);
            loadUsers();
        } catch (error) {
            console.error("Error saving user:", error);
            showAlert(`Failed to save user: ${error.message}`, "error");
        }
    });

    // Event Modal Logic
    addEventBtn.addEventListener("click", () => {
        eventForm.reset();
        eventIdField.value = "";
        showModal(eventModal);
    });

    eventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = eventIdField.value;
        const eventData = {
            title: eventTitleField.value,
            sport: eventSportField.value,
            venue: eventVenueField.value,
            date: eventDateField.value,
            time: eventTimeField.value,
            price: parseFloat(eventPriceField.value),
            image: eventImageField.value
        };

        try {
            if (id) {
                await fetchData(`/api/admin/events/${id}`, "PUT", eventData);
                showAlert("Event updated successfully!");
            } else {
                await fetchData("/api/admin/events", "POST", eventData);
                showAlert("Event added successfully!");
            }
            hideModal(eventModal);
            loadEvents();
        } catch (error) {
            console.error("Error saving event:", error);
            showAlert(`Failed to save event: ${error.message}`, "error");
        }
    });

    // Edit/Delete Button Logic for Tables
    function addTableEventListeners() {
        document.querySelectorAll(".action-buttons button.edit").forEach(button => {
            button.onclick = async (e) => {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                try {
                    if (type === "user") {
                        const user = await fetchData(`/api/admin/users/${id}`);
                        userIdField.value = user.id;
                        userEmailField.value = user.email;
                        userPasswordField.required = false; // Not required for edit
                        userIsAdminField.checked = user.is_admin;
                        showModal(userModal);
                    } else if (type === "event") {
                        const event = await fetchData(`/api/admin/events/${id}`);
                        eventIdField.value = event.id;
                        eventTitleField.value = event.title;
                        eventSportField.value = event.sport;
                        eventVenueField.value = event.venue;
                        eventDateField.value = event.date;
                        eventTimeField.value = event.time;
                        eventPriceField.value = event.price;
                        eventImageField.value = event.image;
                        showModal(eventModal);
                    } else if (type === "booking") {
                        // For simplicity, bookings are not editable via modal in this example
                        showAlert("Booking details can be viewed but not edited directly here.", "info");
                    } else if (type === "payment") {
                        // For simplicity, payments are not editable via modal in this example
                        showAlert("Payment details can be viewed but not edited directly here.", "info");
                    }
                } catch (error) {
                    console.error(`Error fetching ${type} for edit:`, error);
                    showAlert(`Failed to load ${type} for edit: ${error.message}`, "error");
                }
            };
        });

        document.querySelectorAll(".action-buttons button.delete").forEach(button => {
            button.onclick = async (e) => {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                if (confirm(`Are you sure you want to delete this ${type}?`)) {
                    try {
                        await fetchData(`/api/admin/${type}s/${id}`, "DELETE");
                        showAlert(`${type} deleted successfully!`);
                        if (type === "user") loadUsers();
                        else if (type === "event") loadEvents();
                        else if (type === "booking") loadBookings();
                        else if (type === "payment") loadPayments();
                    } catch (error) {
                        console.error(`Error deleting ${type}:`, error);
                        showAlert(`Failed to delete ${type}: ${error.message}`, "error");
                    }
                }
            };
        });
    }

    // Initial load
    showSection("dashboard");
    loadDashboardStats();
});
