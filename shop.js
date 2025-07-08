// // Shop functionality for SportsSeat
// class ShopManager {
//     constructor() {
//         this.cart = JSON.parse(localStorage.getItem('sportsseat_cart')) || [];
//         this.products = [];
//         this.filteredProducts = [];
//         this.currentCategory = 'all';
//         this.maxPrice = 500;
        
//         this.init();
//     }

//     init() {
//         this.loadProducts();
//         this.setupEventListeners();
//         this.updateBasketCount();
//         this.renderProducts();
//     }

//     loadProducts() {
//         // Sample product data - in a real app, this would come from an API
//         this.products = [
//             // Sportswear & Apparel (7 items)
//             { id: 1, name: 'Basketball Jersey', category: 'sportswear', price: 50, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Basketball+Jersey', description: 'Breathable and comfortable jersey for the court.', sizes: ['S', 'M', 'L', 'XL'] },
//             { id: 23, name: 'Compression Shorts', category: 'sportswear', price: 35, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Compression+Shorts', description: 'Supportive compression shorts for enhanced performance.', sizes: ['S', 'M', 'L', 'XL'] },
//             { id: 30, name: 'Tracksuit', category: 'sportswear', price: 70, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Tracksuit', description: 'Comfortable and stylish tracksuit for training or casual wear.', sizes: ['S', 'M', 'L', 'XL'] },
//             { id: 37, name: 'Swim Trunks', category: 'sportswear', price: 40, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Swim+Trunks', description: 'Quick-dry swim trunks for aquatic sports.', sizes: ['S', 'M', 'L', 'XL'] },
//             { id: 49, name: 'Running Tights', category: 'sportswear', price: 45, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Running+Tights', description: 'Comfortable and supportive running tights.', sizes: ['S', 'M', 'L', 'XL'] },
//             { id: 56, name: 'Sports Bra', category: 'sportswear', price: 30, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Sports+Bra', description: 'High-support sports bra for intense workouts.', sizes: ['S', 'M', 'L', 'XL'] },
//             { id: 63, name: 'Hoodie', category: 'sportswear', price: 55, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Hoodie', description: 'Warm and comfortable hoodie for casual wear or training.', sizes: ['S', 'M', 'L', 'XL'] },

//             // Sports Equipment (7 items)
//             { id: 3, name: 'Football', category: 'equipment', price: 30, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Football', description: 'Durable football for training and matches.' },
//             { id: 10, name: 'Yoga Mat', category: 'equipment', price: 40, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Yoga+Mat', description: 'Non-slip yoga mat for all your poses.' },
//             { id: 17, name: 'Resistance Bands Set', category: 'equipment', price: 25, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Resistance+Bands', description: 'Versatile bands for strength training and rehabilitation.' },
//             { id: 24, name: 'Dumbbell Set', category: 'equipment', price: 150, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Dumbbell+Set', description: 'Adjustable dumbbell set for home workouts.' },
//             { id: 31, name: 'Boxing Gloves', category: 'equipment', price: 60, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Boxing+Gloves', description: 'High-quality boxing gloves for training and sparring.' },
//             { id: 38, name: 'Golf Clubs Set', category: 'equipment', price: 600, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Golf+Clubs', description: 'Complete set of golf clubs for all skill levels.' },
//             { id: 43, name: 'Jump Rope', category: 'equipment', price: 10, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Jump+Rope', description: 'Adjustable jump rope for cardio and agility training.' },

//             // Footwear (7 items)
//             { id: 1, name: 'Running Shoes', category: 'footwear', price: 120, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Running+Shoes', description: 'High-performance running shoes for all terrains.', sizes: ['7', '8', '9', '10', '11', '12'] },
//             { id: 15, name: 'Soccer Cleats', category: 'footwear', price: 80, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Soccer+Cleats', description: 'Lightweight and agile cleats for the soccer field.', sizes: ['7', '8', '9', '10', '11', '12'] },
//             { id: 71, name: 'Basketball Sneakers', category: 'footwear', price: 140, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Basketball+Sneakers', description: 'High-top sneakers for court performance.', sizes: ['7', '8', '9', '10', '11', '12'] },
//             { id: 72, name: 'Tennis Shoes', category: 'footwear', price: 90, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Tennis+Shoes', description: 'Stable and comfortable shoes for tennis.', sizes: ['7', '8', '9', '10', '11', '12'] },
//             { id: 73, name: 'Cross Training Shoes', category: 'footwear', price: 110, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Cross+Training', description: 'Versatile shoes for various workouts.', sizes: ['7', '8', '9', '10', '11', '12'] },
//             { id: 74, name: 'Hiking Boots', category: 'footwear', price: 160, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Hiking+Boots', description: 'Durable boots for outdoor adventures.', sizes: ['7', '8', '9', '10', '11', '12'] },
//             { id: 75, name: 'Cycling Shoes', category: 'footwear', price: 130, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Cycling+Shoes', description: 'Specialized shoes for cycling performance.', sizes: ['7', '8', '9', '10', '11', '12'] },

//             // Nutrition & Supplements (7 items)
//             { id: 4, name: 'Protein Powder', category: 'nutrition', price: 45, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Protein+Powder', description: 'High-quality protein for muscle recovery.' },
//             { id: 11, name: 'Energy Bars (Box of 12)', category: 'nutrition', price: 28, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Energy+Bars', description: 'Quick energy boost for your workouts.' },
//             { id: 18, name: 'Vitamin Pack', category: 'nutrition', price: 30, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Vitamin+Pack', description: 'Essential vitamins and minerals for overall health.' },
//             { id: 25, name: 'Meal Replacement Shakes', category: 'nutrition', price: 55, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Meal+Replacement', description: 'Nutrient-rich shakes for convenient meals.' },
//             { id: 32, name: 'Creatine Monohydrate', category: 'nutrition', price: 25, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Creatine', description: 'Boost strength and performance with pure creatine.' },
//             { id: 39, name: 'Pre-Workout Supplement', category: 'nutrition', price: 35, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Pre-Workout', description: 'Boost energy and focus before your workout.' },
//             { id: 44, name: 'Post-Workout Recovery Drink', category: 'nutrition', price: 30, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Recovery+Drink', description: 'Aid muscle recovery with this essential drink.' },

//             // Tech & Gadgets (7 items)
//             { id: 5, name: 'Smartwatch', category: 'tech', price: 200, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Smartwatch', description: 'Track your fitness and stay connected.' },
//             { id: 12, name: 'Wireless Earbuds', category: 'tech', price: 99, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Wireless+Earbuds', description: 'High-fidelity sound for your active lifestyle.' },
//             { id: 19, name: 'Fitness Tracker', category: 'tech', price: 150, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Fitness+Tracker', description: 'Monitor your activity, heart rate, and sleep.' },
//             { id: 26, name: 'Action Camera', category: 'tech', price: 300, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Action+Camera', description: 'Capture your adventures in stunning 4K.' },
//             { id: 33, name: 'VR Sports Game', category: 'tech', price: 50, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=VR+Game', description: 'Immersive virtual reality sports experience.' },
//             { id: 40, name: 'Drone with Camera', category: 'tech', price: 450, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Drone', description: 'Capture aerial footage of your outdoor activities.' },
//             { id: 45, name: 'Portable Bluetooth Speaker', category: 'tech', price: 70, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Bluetooth+Speaker', description: 'Enjoy your music anywhere with powerful sound.' },

//             // Services (7 items)
//             { id: 6, name: 'Personal Training Session', category: 'services', price: 75, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Training+Session', description: 'One-on-one session with a certified trainer.' },
//             { id: 20, name: 'Sports Massage', category: 'services', price: 90, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Sports+Massage', description: 'Relax and recover with a professional sports massage.' },
//             { id: 27, name: 'Sports Psychology Coaching', category: 'services', price: 120, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Psychology+Coaching', description: 'Improve mental game with expert coaching.' },
//             { id: 34, name: 'Sports Injury Rehabilitation', category: 'services', price: 150, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Rehab+Service', description: 'Expert rehabilitation for sports-related injuries.' },
//             { id: 41, name: 'Sports Nutrition Consultation', category: 'services', price: 100, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Nutrition+Consultation', description: 'Personalized nutrition plan from a sports dietitian.' },
//             { id: 46, name: 'Sports Photography Session', category: 'services', price: 200, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Photography+Session', description: 'Professional photos capturing your athletic moments.' },
//             { id: 53, name: 'Sports Event Planning', category: 'services', price: 300, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Event+Planning', description: 'Professional planning for your sports events.' },

//             // Subscriptions & Collectibles (7 items)
//             { id: 13, name: 'Monthly Fitness Subscription', category: 'subscriptions', price: 35, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Fitness+Subscription', description: 'Access to online fitness classes and personalized plans.' },
//             { id: 21, name: 'Autographed Ball', category: 'subscriptions', price: 250, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Autographed+Ball', description: 'Rare collectible: autographed by a legendary athlete.' },
//             { id: 28, name: 'Signed Jersey', category: 'subscriptions', price: 400, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Signed+Jersey', description: 'Authentic signed jersey from a sports legend.' },
//             { id: 35, name: 'Limited Edition Sports Card', category: 'subscriptions', price: 180, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Sports+Card', description: 'Rare limited edition sports trading card.' },
//             { id: 47, name: 'Collector\'s Edition Sports Book', category: 'subscriptions', price: 75, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Sports+Book', description: 'A must-have for any sports enthusiast\'s library.' },
//             { id: 54, name: 'Signed Photo', category: 'subscriptions', price: 100, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Signed+Photo', description: 'Authentic signed photo of a sports icon.' },
//             { id: 61, name: 'Vintage Sports Magazine', category: 'subscriptions', price: 40, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Vintage+Magazine', description: 'Rare vintage sports magazine for collectors.' },

//             // Accessories (7 items)
//             { id: 8, name: 'Sports Socks (3-pack)', category: 'accessories', price: 15, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Sports+Socks', description: 'Comfortable and durable sports socks.' },
//             { id: 14, name: 'Water Bottle', category: 'accessories', price: 10, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Water+Bottle', description: 'Durable and leak-proof water bottle.' },
//             { id: 22, name: 'Gym Towel', category: 'accessories', price: 8, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Gym+Towel', description: 'Quick-drying and absorbent gym towel.' },
//             { id: 29, name: 'Headband Set', category: 'accessories', price: 12, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Headband+Set', description: 'Keep sweat out of your eyes with these comfortable headbands.' },
//             { id: 36, name: 'Wristbands (Pair)', category: 'accessories', price: 7, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Wristbands', description: 'Absorbent wristbands for intense workouts.' },
//             { id: 48, name: 'Gym Bag', category: 'accessories', price: 40, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Gym+Bag', description: 'Spacious and durable gym bag for all your gear.' },
//             { id: 55, name: 'Resistance Loop Bands', category: 'accessories', price: 15, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Loop+Bands', description: 'Compact and effective for various exercises.' },

//             // Branded Merchandise (7 items)
//             { id: 7, name: 'Fan Collectible Mug', category: 'merchandise', price: 25, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Fan+Mug', description: 'Official team branded collectible mug.' },
//             { id: 9, name: 'Baseball Cap', category: 'merchandise', price: 20, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Baseball+Cap', description: 'Stylish baseball cap with team logo.' },
//             { id: 16, name: 'Team Scarf', category: 'merchandise', price: 22, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Team+Scarf', description: 'Show your team pride with this warm scarf.' },
//             { id: 42, name: 'Team Pennant', category: 'merchandise', price: 18, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Team+Pennant', description: 'Decorate your space with an official team pennant.' },
//             { id: 68, name: 'Team Flag', category: 'merchandise', price: 30, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Team+Flag', description: 'Wave your team flag high with pride.' },
//             { id: 80, name: 'Team Keychain', category: 'merchandise', price: 8, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Keychain', description: 'Small but proud team keychain.' },
//             { id: 92, name: 'Team Banner', category: 'merchandise', price: 50, image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Team+Banner', description: 'Large team banner to display your unwavering support.' }
//         ];

//         this.filteredProducts = [...this.products];
//     }

//     setupEventListeners() {
//         // Category filter listeners
//         document.querySelectorAll('.category-list a').forEach(link => {
//             link.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 this.handleCategoryFilter(e.target);
//             });
//         });

//         // Price range listener
//         const priceRange = document.getElementById('price-range');
//         const priceValue = document.getElementById('price-value');
//         if (priceRange && priceValue) {
//             priceRange.addEventListener('input', (e) => {
//                 this.maxPrice = parseInt(e.target.value);
//                 priceValue.textContent = this.maxPrice;
//                 this.filterProducts();
//             });
//         }

//         // Basket button listener
//         const basketBtn = document.getElementById('basket-float-btn');
//         if (basketBtn) {
//             basketBtn.addEventListener('click', () => this.openCartModal());
//         }

//         // Modal listeners
//         this.setupModalListeners();
//     }

//     setupModalListeners() {
//         // Close modals when clicking outside
//         document.addEventListener('click', (e) => {
//             if (e.target.classList.contains('cart-modal') || e.target.classList.contains('checkout-modal')) {
//                 this.closeModal(e.target);
//             }
//         });

//         // Close modals with escape key
//         document.addEventListener('keydown', (e) => {
//             if (e.key === 'Escape') {
//                 this.closeAllModals();
//             }
//         });
//     }

//     handleCategoryFilter(element) {
//         // Update active category
//         document.querySelectorAll('.category-list a').forEach(link => {
//             link.classList.remove('active');
//         });
//         element.classList.add('active');

//         this.currentCategory = element.dataset.category || 'all';
//         this.filterProducts();
//     }

//     filterProducts() {
//         this.filteredProducts = this.products.filter(product => {
//             const matchesCategory = this.currentCategory === 'all' || product.category === this.currentCategory;
//             const matchesPrice = product.price <= this.maxPrice;
//             return matchesCategory && matchesPrice;
//         });
//         this.renderProducts();
//     }

//     renderProducts() {
//         const productGrid = document.getElementById('product-grid');
//         if (!productGrid) return;

//         productGrid.innerHTML = '';

//         if (this.filteredProducts.length === 0) {
//             productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--neutral-medium);">No products found matching your criteria.</p>';
//             return;
//         }

//         this.filteredProducts.forEach(product => {
//             const productCard = this.createProductCard(product);
//             productGrid.appendChild(productCard);
//         });
//     }

//     createProductCard(product) {
//         const card = document.createElement('div');
//         card.className = 'product-card';
        
//         card.innerHTML = `
//             <img src="${product.image}" alt="${product.name}" loading="lazy">
//             <h3>${product.name}</h3>
//             <p class="product-price">$${product.price.toFixed(2)}</p>
//             <p>${product.description}</p>
//             ${product.sizes ? `
//                 <div class="product-sizes">
//                     <label for="size-${product.id}">Size:</label>
//                     <select id="size-${product.id}">
//                         ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
//                     </select>
//                 </div>
//             ` : ''}
//             <button class="add-to-cart" data-product-id="${product.id}">Add to Cart</button>
//         `;

//         // Add event listener to the add to cart button
//         const addToCartBtn = card.querySelector('.add-to-cart');
//         addToCartBtn.addEventListener('click', () => this.addToCart(product.id));

//         return card;
//     }

//     addToCart(productId) {
//         const product = this.products.find(p => p.id === productId);
//         if (!product) return;

//         const sizeSelect = document.getElementById(`size-${productId}`);
//         const selectedSize = sizeSelect ? sizeSelect.value : null;

//         // Check if item already exists in cart
//         const existingItemIndex = this.cart.findIndex(item => 
//             item.id === productId && item.size === selectedSize
//         );

//         if (existingItemIndex > -1) {
//             this.cart[existingItemIndex].quantity++;
//         } else {
//             this.cart.push({
//                 ...product,
//                 quantity: 1,
//                 size: selectedSize
//             });
//         }

//         this.saveCart();
//         this.updateBasketCount();
//         this.showToast(`${product.name} added to cart!`, 'success');
//     }

//     removeFromCart(productId, size = null) {
//         this.cart = this.cart.filter(item => 
//             !(item.id === productId && item.size === size)
//         );
//         this.saveCart();
//         this.updateBasketCount();
//         this.renderCartItems();
//     }

//     updateQuantity(productId, size, newQuantity) {
//         const item = this.cart.find(item => item.id === productId && item.size === size);
//         if (item) {
//             if (newQuantity <= 0) {
//                 this.removeFromCart(productId, size);
//             } else {
//                 item.quantity = newQuantity;
//                 this.saveCart();
//                 this.updateBasketCount();
//                 this.renderCartItems();
//             }
//         }
//     }

//     saveCart() {
//         localStorage.setItem('sportsseat_cart', JSON.stringify(this.cart));
//     }

//     updateBasketCount() {
//         const basketCount = document.querySelector('.basket-count');
//         if (basketCount) {
//             const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
//             basketCount.textContent = totalItems;
//         }
//     }

//     getCartTotal() {
//         return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
//     }

//     openCartModal() {
//         this.createCartModal();
//         const modal = document.getElementById('cart-modal');
//         if (modal) {
//             modal.classList.add('active');
//             this.renderCartItems();
//         }
//     }

//     createCartModal() {
//         // Remove existing modal if it exists
//         const existingModal = document.getElementById('cart-modal');
//         if (existingModal) {
//             existingModal.remove();
//         }

//         const modal = document.createElement('div');
//         modal.id = 'cart-modal';
//         modal.className = 'cart-modal';
//         modal.innerHTML = `
//             <div class="cart-content">
//                 <div class="cart-header">
//                     <h2>Shopping Cart</h2>
//                     <button class="cart-close" onclick="shopManager.closeModal(document.getElementById('cart-modal'))">
//                         <i class="fas fa-times"></i>
//                     </button>
//                 </div>
//                 <div class="cart-items" id="cart-items">
//                     <!-- Cart items will be rendered here -->
//                 </div>
//                 <div class="cart-total">
//                     <div class="cart-total-amount">Total: $<span id="cart-total-amount">0.00</span></div>
//                 </div>
//                 <div class="cart-actions">
//                     <button class="btn-continue-shopping" onclick="shopManager.closeModal(document.getElementById('cart-modal'))">
//                         Continue Shopping
//                     </button>
//                     <button class="btn-checkout" onclick="shopManager.openCheckoutModal()">
//                         Proceed to Checkout
//                     </button>
//                 </div>
//             </div>
//         `;

//         document.body.appendChild(modal);
//     }

//     renderCartItems() {
//         const cartItemsContainer = document.getElementById('cart-items');
//         const cartTotalElement = document.getElementById('cart-total-amount');
        
//         if (!cartItemsContainer || !cartTotalElement) return;

//         cartItemsContainer.innerHTML = '';

//         if (this.cart.length === 0) {
//             cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--neutral-medium);">Your cart is empty</p>';
//             cartTotalElement.textContent = '0.00';
//             return;
//         }

//         this.cart.forEach(item => {
//             const cartItem = document.createElement('div');
//             cartItem.className = 'cart-item';
//             cartItem.innerHTML = `
//                 <img src="${item.image}" alt="${item.name}">
//                 <div class="cart-item-info">
//                     <div class="cart-item-name">${item.name}</div>
//                     <div class="cart-item-details">
//                         ${item.size ? `Size: ${item.size} | ` : ''}
//                         Quantity: 
//                         <button onclick="shopManager.updateQuantity(${item.id}, '${item.size}', ${item.quantity - 1})" style="background: none; border: 1px solid var(--neutral-light); padding: 0.25rem 0.5rem; margin: 0 0.25rem;">-</button>
//                         ${item.quantity}
//                         <button onclick="shopManager.updateQuantity(${item.id}, '${item.size}', ${item.quantity + 1})" style="background: none; border: 1px solid var(--neutral-light); padding: 0.25rem 0.5rem; margin: 0 0.25rem;">+</button>
//                         <button onclick="shopManager.removeFromCart(${item.id}, '${item.size}')" style="background: var(--accent-color); color: white; border: none; padding: 0.25rem 0.5rem; margin-left: 1rem; border-radius: 4px;">Remove</button>
//                     </div>
//                 </div>
//                 <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
//             `;
//             cartItemsContainer.appendChild(cartItem);
//         });

//         cartTotalElement.textContent = this.getCartTotal().toFixed(2);
//     }

//     openCheckoutModal() {
//         this.closeModal(document.getElementById('cart-modal'));
//         this.createCheckoutModal();
//         const modal = document.getElementById('checkout-modal');
//         if (modal) {
//             modal.classList.add('active');
//         }
//     }

//     createCheckoutModal() {
//         // Remove existing modal if it exists
//         const existingModal = document.getElementById('checkout-modal');
//         if (existingModal) {
//             existingModal.remove();
//         }

//         const modal = document.createElement('div');
//         modal.id = 'checkout-modal';
//         modal.className = 'checkout-modal';
//         modal.innerHTML = `
//             <div class="checkout-content">
//                 <div class="checkout-header">
//                     <h2>Checkout</h2>
//                     <p>Complete your purchase</p>
//                 </div>
//                 <form class="checkout-form" id="checkout-form">
//                     <div class="form-group">
//                         <label for="checkout-email">Email Address</label>
//                         <input type="email" id="checkout-email" required>
//                     </div>
//                     <div class="form-row">
//                         <div class="form-group">
//                             <label for="checkout-firstname">First Name</label>
//                             <input type="text" id="checkout-firstname" required>
//                         </div>
//                         <div class="form-group">
//                             <label for="checkout-lastname">Last Name</label>
//                             <input type="text" id="checkout-lastname" required>
//                         </div>
//                     </div>
//                     <div class="form-group">
//                         <label for="checkout-address">Address</label>
//                         <input type="text" id="checkout-address" required>
//                     </div>
//                     <div class="form-row">
//                         <div class="form-group">
//                             <label for="checkout-city">City</label>
//                             <input type="text" id="checkout-city" required>
//                         </div>
//                         <div class="form-group">
//                             <label for="checkout-zip">ZIP Code</label>
//                             <input type="text" id="checkout-zip" required>
//                         </div>
//                     </div>
//                     <div class="form-group">
//                         <label for="checkout-card">Card Number</label>
//                         <input type="text" id="checkout-card" placeholder="1234 5678 9012 3456" required>
//                     </div>
//                     <div class="form-row">
//                         <div class="form-group">
//                             <label for="checkout-expiry">Expiry Date</label>
//                             <input type="text" id="checkout-expiry" placeholder="MM/YY" required>
//                         </div>
//                         <div class="form-group">
//                             <label for="checkout-cvv">CVV</label>
//                             <input type="text" id="checkout-cvv" placeholder="123" required>
//                         </div>
//                     </div>
//                     <div class="checkout-summary">
//                         <h3>Order Summary</h3>
//                         <div id="checkout-items"></div>
//                         <div class="checkout-total">
//                             <span>Total: $${this.getCartTotal().toFixed(2)}</span>
//                         </div>
//                     </div>
//                     <div class="checkout-actions">
//                         <button type="button" class="btn-back" onclick="shopManager.openCartModal(); shopManager.closeModal(document.getElementById('checkout-modal'))">
//                             Back to Cart
//                         </button>
//                         <button type="submit" class="btn-pay">
//                             Pay $${this.getCartTotal().toFixed(2)}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         `;

//         document.body.appendChild(modal);

//         // Add form submit listener
//         const form = document.getElementById('checkout-form');
//         form.addEventListener('submit', (e) => this.handleCheckout(e));

//         // Render checkout items
//         this.renderCheckoutItems();
//     }

//     renderCheckoutItems() {
//         const checkoutItems = document.getElementById('checkout-items');
//         if (!checkoutItems) return;

//         checkoutItems.innerHTML = this.cart.map(item => `
//             <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
//                 <span>${item.name} ${item.size ? `(${item.size})` : ''} x ${item.quantity}</span>
//                 <span>$${(item.price * item.quantity).toFixed(2)}</span>
//             </div>
//         `).join('');
//     }

//     handleCheckout(e) {
//         e.preventDefault();
        
//         // Simulate payment processing
//         this.showToast('Processing payment...', 'info');
        
//         setTimeout(() => {
//             // Clear cart
//             this.cart = [];
//             this.saveCart();
//             this.updateBasketCount();
            
//             // Close modal
//             this.closeModal(document.getElementById('checkout-modal'));
            
//             // Show success message
//             this.showToast('Payment successful! Thank you for your purchase.', 'success');
//         }, 2000);
//     }

//     closeModal(modal) {
//         if (modal) {
//             modal.classList.remove('active');
//             setTimeout(() => {
//                 if (modal.parentNode) {
//                     modal.remove();
//                 }
//             }, 300);
//         }
//     }

//     closeAllModals() {
//         document.querySelectorAll('.cart-modal.active, .checkout-modal.active').forEach(modal => {
//             this.closeModal(modal);
//         });
//     }

//     showToast(message, type = 'success') {
//         const toastWrapper = document.getElementById('toast-wrapper');
//         if (!toastWrapper) return;

//         const toast = document.createElement('div');
//         toast.className = `toast ${type}`;
//         toast.innerHTML = `
//             <div class="toast-icon">
//                 <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle'}"></i>
//             </div>
//             <div class="toast-message">${message}</div>
//             <button class="toast-close" onclick="this.parentElement.remove()">
//                 <i class="fas fa-times"></i>
//             </button>
//         `;

//         toastWrapper.appendChild(toast);

//         setTimeout(() => toast.classList.add('show'), 100);

//         setTimeout(() => {
//             if (toast.parentNode) {
//                 toast.remove();
//             }
//         }, 5000);
//     }
// }

// // Initialize shop manager when DOM is loaded
// let shopManager;
// document.addEventListener('DOMContentLoaded', () => {
//     shopManager = new ShopManager();
// });

