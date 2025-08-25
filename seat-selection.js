class SeatSelectionSystem {
    constructor() {
        this.selectedEvent = null;
        this.selectedSeats = [];
        this.seatPrice = 150; // Example price per seat
        this.serviceFeePercentage = 0.15; // 15% service fee

        this.northStandContainer = document.getElementById("north-stand");
        this.southStandContainer = document.getElementById("south-stand");
        this.selectedSeatsList = document.getElementById("selected-seats-list");
        this.subtotalSpan = document.getElementById("subtotal");
        this.serviceFeeSpan = document.getElementById("service-fee");
        this.totalSpan = document.getElementById("total");
        this.continueButton = document.getElementById("continue-to-cart");

        this.init();
    }

    init() {
        this.loadEventDetails();
        this.renderSeats();
        this.updateSummary();
        this.bindEvents();
    }

    loadEventDetails() {
        const storedEvent = localStorage.getItem("selectedEvent");
        if (storedEvent) {
            this.selectedEvent = JSON.parse(storedEvent);
            document.getElementById("event-title").textContent = this.selectedEvent.title;
            document.getElementById("event-date").textContent = this.selectedEvent.date;
            document.getElementById("event-time").textContent = this.selectedEvent.time;
            document.getElementById("event-venue").textContent = this.selectedEvent.venue;
        } else {
            // Fallback if no event is selected (e.g., direct access to page)
            document.getElementById("event-title").textContent = "NFL: Patriots vs. Jets";
            document.getElementById("event-date").textContent = "August 15, 2025";
            document.getElementById("event-time").textContent = "8:00 PM";
            document.getElementById("event-venue").textContent = "Gillette Stadium";
            this.selectedEvent = {
                id: "fallback-event",
                title: "NFL: Patriots vs. Jets",
                date: "August 15, 2025",
                time: "8:00 PM",
                venue: "Gillette Stadium",
                price: 99,
                image: "images/event1.jpg",
                featured: true
            };
        }
    }

    renderSeats() {
        this.northStandContainer.innerHTML = this.generateSeats("North", 10, 12, "premium");
        this.southStandContainer.innerHTML = this.generateSeats("South", 10, 12, "premium");
    }

    generateSeats(section, rows, seatsPerRow, type = "standard") {
        let seatsHtml = "";
        for (let r = 1; r <= rows; r++) {
            for (let s = 1; s <= seatsPerRow; s++) {
                const seatId = `${section}-${r}-${s}`;
                const isOccupied = Math.random() < 0.1; // 10% chance of being occupied
                const seatClass = `seat ${type} ${isOccupied ? "occupied" : "available"}`;
                seatsHtml += `
                    <div class="${seatClass}" data-seat-id="${seatId}" data-section="${section}" data-row="${r}" data-seat="${s}" data-type="${type}" data-price="${this.seatPrice}" ${isOccupied ? "disabled" : ""}>
                        <span class="seat-info">${section} ${r}${s}</span>
                    </div>
                `;
            }
        }
        return seatsHtml;
    }

    bindEvents() {
        document.querySelectorAll(".seat.available").forEach(seat => {
            seat.addEventListener("click", this.toggleSeatSelection.bind(this));
        });
        this.continueButton.addEventListener("click", this.continueToCart.bind(this));
    }

    toggleSeatSelection(event) {
        const seatElement = event.currentTarget;
        const seatId = seatElement.dataset.seatId;

        if (seatElement.classList.contains("occupied")) {
            return; // Cannot select occupied seats
        }

        const existingIndex = this.selectedSeats.findIndex(seat => seat.id === seatId);

        if (existingIndex > -1) {
            // Deselect seat
            this.selectedSeats.splice(existingIndex, 1);
            seatElement.classList.remove("selected");
        } else {
            // Select seat
            const seatData = {
                id: seatId,
                section: seatElement.dataset.section,
                row: seatElement.dataset.row,
                seat: seatElement.dataset.seat,
                type: seatElement.dataset.type,
                price: parseFloat(seatElement.dataset.price)
            };
            this.selectedSeats.push(seatData);
            seatElement.classList.add("selected");
        }
        this.updateSummary();
    }

    updateSummary() {
        this.selectedSeatsList.innerHTML = "";
        if (this.selectedSeats.length === 0) {
            this.selectedSeatsList.innerHTML = "No seats selected";
            this.continueButton.disabled = true;
            this.continueButton.textContent = "Continue to Cart";
        } else {
            this.selectedSeats.forEach(seat => {
                const seatItem = document.createElement("div");
                seatItem.classList.add("selected-seat-item");
                seatItem.innerHTML = `
                    <div>
                        ${seat.section} ${seat.row}${seat.seat} (${seat.type})
                          
<span>$${seat.price}</span>
                    </div>
                    <button class="remove-seat" data-seat-id="${seat.id}" title="Remove seat"><i class="fas fa-times"></i></button>
                `;
                this.selectedSeatsList.appendChild(seatItem);
            });
            document.querySelectorAll(".remove-seat").forEach(button => {
                button.addEventListener("click", this.removeSeat.bind(this));
            });
            this.continueButton.disabled = false;
            this.continueButton.textContent = `Continue with ${this.selectedSeats.length} seat${this.selectedSeats.length > 1 ? "s" : ""}`;
        }

        const subtotal = this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
        const serviceFee = subtotal * this.serviceFeePercentage;
        const total = subtotal + serviceFee;

        this.subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        this.serviceFeeSpan.textContent = `$${serviceFee.toFixed(2)}`;
        this.totalSpan.textContent = `$${total.toFixed(2)}`;
    }

    removeSeat(event) {
        const seatIdToRemove = event.currentTarget.dataset.seatId;
        const seatElement = document.querySelector(`[data-seat-id="${seatIdToRemove}"]`);
        if (seatElement) {
            seatElement.classList.remove("selected");
        }
        this.selectedSeats = this.selectedSeats.filter(seat => seat.id !== seatIdToRemove);
        this.updateSummary();
    }

    continueToCart() {
        if (this.selectedSeats.length > 0) {
            const bookingData = {
                event: this.selectedEvent,
                seats: this.selectedSeats,
                pricing: {
                    subtotal: parseFloat(this.subtotalSpan.textContent.replace("$", "")),
                    serviceFee: parseFloat(this.serviceFeeSpan.textContent.replace("$", "")),
                    total: parseFloat(this.totalSpan.textContent.replace("$", ""))
                }
            };
            localStorage.setItem("currentBooking", JSON.stringify(bookingData));
            window.location.href = "cart.html";
        } else {
            alert("Please select at least one seat.");
        }
    }
}

let seatSystem;
document.addEventListener("DOMContentLoaded", () => {
    seatSystem = new SeatSelectionSystem();
});
