class ShoppingCart {
    constructor() {
        this.bookingData = null;
        this.appliedPromo = null;
        this.promoCodes = {
            "SAVE10": 0.10, // 10% discount
            "FREEDELIVERY": 0 // Example for free delivery, not implemented in pricing
        };

        this.cartEventTitle = document.getElementById("cart-event-title");
        this.cartEventDate = document.getElementById("cart-event-date");
        this.cartEventTime = document.getElementById("cart-event-time");
        this.cartEventVenue = document.getElementById("cart-event-venue");
        this.cartSeatsList = document.getElementById("cart-seats-list");
        this.cartSubtotal = document.getElementById("cart-subtotal");
        this.cartServiceFee = document.getElementById("cart-service-fee");
        this.cartDiscount = document.getElementById("cart-discount");
        this.discountRow = document.getElementById("discount-row");
        this.cartTotal = document.getElementById("cart-total");
        this.promoCodeInput = document.getElementById("promo-code");
        this.proceedToCheckoutButton = document.getElementById("proceed-to-checkout");

        this.init();
    }

    init() {
        this.loadBookingData();
        this.renderCart();
        this.updateSummary();
        this.bindEvents();
    }

    loadBookingData() {
        const storedBooking = localStorage.getItem("currentBooking");
        if (storedBooking) {
            this.bookingData = JSON.parse(storedBooking);
        } else {
            // Fallback for demo purposes if no booking data is found
            this.bookingData = {
                event: {
                    title: "NFL: Patriots vs. Jets",
                    date: "August 15, 2025",
                    time: "8:00 PM",
                    venue: "Gillette Stadium"
                },
                seats: [
                    { id: "North-1-1", section: "North", row: "A", seat: "1", type: "Premium", price: 150 }
                ],
                pricing: {
                    subtotal: 150,
                    serviceFee: 22.50,
                    total: 172.50
                }
            };
        }
        const storedPromo = localStorage.getItem("appliedPromo");
        if (storedPromo) {
            this.appliedPromo = JSON.parse(storedPromo);
        }
    }

    renderCart() {
        if (this.bookingData && this.bookingData.event) {
            this.cartEventTitle.textContent = this.bookingData.event.title;
            this.cartEventDate.textContent = this.bookingData.event.date;
            this.cartEventTime.textContent = this.bookingData.event.time;
            this.cartEventVenue.textContent = this.bookingData.event.venue;
        }

        this.cartSeatsList.innerHTML = "";
        if (this.bookingData && this.bookingData.seats && this.bookingData.seats.length > 0) {
            this.bookingData.seats.forEach(seat => {
                const seatItem = document.createElement("div");
                seatItem.classList.add("seat-item");
                seatItem.innerHTML = `
                    <div>
                        <div class="seat-info">${seat.section} Section - Row ${seat.row}, Seat ${seat.seat}</div>
                        <div class="seat-type">${seat.type} Seating</div>
                        <div class="seat-features">
                            <span class="feature-tag">Premium View</span>
                            <span class="feature-tag">Wider Seats</span>
                            <span class="feature-tag">VIP Access</span>
                            <span class="feature-tag">Complimentary Snacks</span>
                        </div>
                    </div>
                    <div class="seat-price">$${seat.price.toFixed(2)}</div>
                    <button class="remove-seat-btn" data-seat-id="${seat.id}" title="Remove seat"><i class="fas fa-times"></i></button>
                `;
                this.cartSeatsList.appendChild(seatItem);
            });
            document.querySelectorAll(".remove-seat-btn").forEach(button => {
                button.addEventListener("click", this.removeSeat.bind(this));
            });
        } else {
            this.cartSeatsList.innerHTML = "<p>Your cart is empty. Please go back to select seats.</p>";
            this.proceedToCheckoutButton.disabled = true;
        }
    }

    updateSummary() {
        if (!this.bookingData || !this.bookingData.pricing) {
            return;
        }

        let subtotal = this.bookingData.pricing.subtotal;
        let serviceFee = this.bookingData.pricing.serviceFee;
        let total = subtotal + serviceFee;
        let discountAmount = 0;

        if (this.appliedPromo && this.promoCodes[this.appliedPromo.code]) {
            const discountRate = this.promoCodes[this.appliedPromo.code];
            discountAmount = total * discountRate;
            total -= discountAmount;
            this.discountRow.style.display = "flex";
            this.cartDiscount.textContent = `-$${discountAmount.toFixed(2)}`;
        } else {
            this.discountRow.style.display = "none";
            this.cartDiscount.textContent = "-$0.00";
        }

        this.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        this.cartServiceFee.textContent = `$${serviceFee.toFixed(2)}`;
        this.cartTotal.textContent = `$${total.toFixed(2)}`;
        this.proceedToCheckoutButton.textContent = `Proceed to Checkout ($${total.toFixed(2)})`;

        // Update bookingData in localStorage with current pricing
        this.bookingData.pricing.total = total;
        this.bookingData.pricing.discountAmount = discountAmount;
        localStorage.setItem("currentBooking", JSON.stringify(this.bookingData));
    }

    bindEvents() {
        this.proceedToCheckoutButton.addEventListener("click", this.proceedToCheckout.bind(this));
    }

    removeSeat(event) {
        const seatIdToRemove = event.currentTarget.dataset.seatId;
        this.bookingData.seats = this.bookingData.seats.filter(seat => seat.id !== seatIdToRemove);

        // Recalculate subtotal and service fee based on remaining seats
        this.bookingData.pricing.subtotal = this.bookingData.seats.reduce((sum, seat) => sum + seat.price, 0);
        this.bookingData.pricing.serviceFee = this.bookingData.pricing.subtotal * 0.15; // Reapply 15% service fee

        localStorage.setItem("currentBooking", JSON.stringify(this.bookingData));
        this.renderCart();
        this.updateSummary();
    }

    applyPromoCode() {
        const code = this.promoCodeInput.value.trim().toUpperCase();
        if (this.promoCodes[code]) {
            this.appliedPromo = { code: code, discount: this.promoCodes[code] };
            localStorage.setItem("appliedPromo", JSON.stringify(this.appliedPromo));
            this.updateSummary();
            this.showToast("Promo code applied successfully!", "success");
        } else {
            this.appliedPromo = null;
            localStorage.removeItem("appliedPromo");
            this.updateSummary();
            this.showToast("Invalid promo code.", "error");
        }
    }

    proceedToCheckout() {
        if (this.bookingData && this.bookingData.seats && this.bookingData.seats.length > 0) {
            // Store final checkout data (including applied promo and final total)
            localStorage.setItem("checkoutData", JSON.stringify(this.bookingData));
            window.location.href = "checkout.html";
        } else {
            this.showToast("Your cart is empty. Please select seats first.", "error");
        }
    }

    showToast(message, type = "info") {
        // Re-using the showToast function from main.js or defining a local one
        const toastWrapper = document.body; // Or a specific toast container element
        if (!toastWrapper) {
            console.error("Toast wrapper not found");
            return;
        }
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#007bff"};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        `;
        toast.textContent = message;
        toastWrapper.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "1";
        }, 100);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.addEventListener("transitionend", () => toast.remove());
        }, 3000);
    }
}

let cart;
document.addEventListener("DOMContentLoaded", () => {
    cart = new ShoppingCart();
});

// Expose applyPromoCode to global scope for onclick in HTML
function applyPromoCode() {
    if (cart) {
        cart.applyPromoCode();
    }
}
