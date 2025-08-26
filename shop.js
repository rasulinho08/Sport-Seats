// Enhanced SportsSeat Shop with Dynamic Hero Section
class EnhancedShopManager {
    constructor() {
        this.products = [];
        this.cart = JSON.parse(localStorage.getItem('sportsseat_cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('sportsseat_wishlist')) || [];
        this.reviews = JSON.parse(localStorage.getItem('sportsseat_reviews')) || {};
        this.currentSlide = 0;
        this.slideInterval = null;
        this.currentProduct = null;
        this.userRating = 0;
        
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.updateCartCount();
        this.updateWishlistCount();
        this.renderFeaturedProducts();
        this.initHeroSlider();
        this.loadSampleReviews();
    }
loadProducts() {
     this.products = [
         {
             id: 1,
             name: 'Basketball Jersey',
             category: 'sportswear',
             price: 50,
             images: [
                  'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/cc36ee33-4480-435e-aa3a-0038c1e8d7de/FRA+M+NK+LMTD+JSY+RD+NN+O+24.png',
                 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/bea76b9c-6285-4323-bf81-cf6b803c92dd/FRA+M+NK+LMTD+JSY+RD+NN+O+24.png',
                 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/cf74d10a-8fa7-4af5-af43-301bf1ea2945/FRA+M+NK+LMTD+JSY+RD+NN+O+24.png',
                 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/59957a8d-7f76-4efd-86e2-d6c98bd79ee3/FRA+M+NK+LMTD+JSY+RD+NN+O+24.png'
             ],
             description: 'Breathable and comfortable jersey perfect for the court. Made with moisture-wicking fabric.',
             sizes: ['S', 'M', 'L', 'XL'],
             colors: ['Red', 'Blue', 'Black', 'White'],
             rating: 4.8,
             reviewCount: 124
         },
         {
             id: 2,
             name: 'Running Shoes',
             category: 'footwear',
             price: 120,
             images: [
                 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/92985e4d-3d5c-49c4-a25c-5f103b790f9e/W+NIKE+VOMERO+PLUS.png',
                 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/c46c2a01-3400-4c86-8c98-43d416560a8c/W+NIKE+VOMERO+PLUS.png',
                 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/493e05e0-d4fa-4f33-ba25-74021799084d/W+NIKE+VOMERO+PLUS.png',
                 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/04f071ee-86f6-4e91-9e94-8a78b1dc480c/W+NIKE+VOMERO+PLUS.png',
             ],
             description: 'High-performance running shoes designed for all terrains with superior cushioning.',
             sizes: ['38', '39', '40', '41', '42', '43'],
             colors: ['Black', 'White', 'Gray', 'Blue','Purple','Pink'],
             rating: 4.6,
             reviewCount: 89
         },
         {
             id: 3,
             name: 'Football',
             category: 'equipment',
             price: 30,
             images: [
                 
                 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/8762902f-a1f6-4876-aa84-bc80e1a97964/NK+CLUB+ELITE+-+FA24.png',
                 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/48973c20-1c6f-4974-a49f-bc0c35f53faf/NK+CLUB+ELITE+-+FA24.png'
             ],
             description: 'Professional-grade football perfect for training and matches. Official size and weight.',
             rating: 4.7,
             reviewCount: 156
         },
         {
             id: 4,
             name: 'Smartwatch',
             category: 'tech',
             price: 200,
             images: [
                 'https://m.media-amazon.com/images/I/71JdOCeH4VL._AC_SX679_.jpg',
                 'https://m.media-amazon.com/images/I/81dpx6zBt7L._AC_SX679_.jpg',
                 'https://m.media-amazon.com/images/I/71fWUsw7H0L.__AC_SX300_SY300_QL70_FMwebp_.jpg',
                 'https://m.media-amazon.com/images/I/81DtG7RJb9L._AC_SX466_.jpg'
             ],
             description: 'Advanced fitness tracking smartwatch with heart rate monitoring and GPS.',
             colors: ['Black', 'Silver', 'Gold'],
             rating: 4.5,
             reviewCount: 203
         },
         {
             id: 5,
             name: 'Protein Powder',
             category: 'nutrition',
             price: 45,
             images: [
                 'https://m.media-amazon.com/images/I/41g+XxD1TQL._AC_.jpg',
                 'https://m.media-amazon.com/images/I/61LNZKRB24L._AC_.jpg',
                 'https://m.media-amazon.com/images/I/61KJIeVVteL._AC_SX679_.jpg'
             ],
             description: 'High-quality whey protein powder for muscle recovery and growth.',
             colors: ['Vanilla', 'Chocolate', 'Strawberry'],
             rating: 4.9,
             reviewCount: 78
         },
         {
             id: 6,
             name: 'Yoga Mat',
             category: 'equipment',
             price: 40,
             images: [
                 'https://m.media-amazon.com/images/I/715di42jxvL._AC_SX522_.jpg',
                 'https://m.media-amazon.com/images/I/91wm0OodxiL._AC_SX522_.jpg',
                 'https://m.media-amazon.com/images/I/81YvN58sncL._AC_SX679_.jpg'
             ],
             description: 'Non-slip yoga mat with excellent grip and cushioning for all poses.',
             colors: ['Purple', 'Blue', 'Green', 'Pink'],
             rating: 4.4,
             reviewCount: 92
         },
     ];
 }
    setupEventListeners() {
        // Hero slider controls
        document.getElementById('next-btn').addEventListener('click', () => this.nextSlide());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevSlide());
        
        // Dots navigation
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Hero CTA button
        document.getElementById('hero-cta').addEventListener('click', () => {
            const currentProductId = this.getCurrentProductId();
            if (currentProductId) {
                this.openProductModal(currentProductId);
            }
        });

        // Product preview card click
        document.addEventListener('click', (e) => {
            const previewCard = e.target.closest('.product-preview-card');
            if (previewCard) {
                const productId = parseInt(previewCard.dataset.productId);
                this.openProductModal(productId);
            }
        });

        // Modal controls
        document.getElementById('close-product-modal').addEventListener('click', () => this.closeModal('product-modal'));
        document.getElementById('close-wishlist-modal').addEventListener('click', () => this.closeModal('wishlist-modal'));
        document.getElementById('close-cart-modal').addEventListener('click', () => this.closeModal('cart-modal'));

        // Navigation buttons
        document.getElementById('wishlist-btn').addEventListener('click', () => this.openWishlistModal());
        document.getElementById('cart-btn').addEventListener('click', () => this.openCartModal());

        // Product actions
        document.getElementById('add-to-cart-btn').addEventListener('click', () => this.addToCart());
        document.getElementById('modal-wishlist-btn').addEventListener('click', () => this.toggleWishlist());

        // Quantity controls
        document.getElementById('qty-plus').addEventListener('click', () => this.changeQuantity(1));
        document.getElementById('qty-minus').addEventListener('click', () => this.changeQuantity(-1));

        // Review system
        document.getElementById('submit-review').addEventListener('click', () => this.submitReview());
        document.querySelectorAll('#user-rating i').forEach((star, index) => {
            star.addEventListener('click', () => this.setUserRating(index + 1));
            star.addEventListener('mouseenter', () => this.highlightStars(index + 1));
        });
        document.getElementById('user-rating').addEventListener('mouseleave', () => this.highlightStars(this.userRating));

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target.id);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            }
            if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Pause slider on hover
        const heroSection = document.getElementById('hero-section');
        heroSection.addEventListener('mouseenter', () => this.pauseSlider());
        heroSection.addEventListener('mouseleave', () => this.resumeSlider());
    }

    initHeroSlider() {
        this.updateHeroContent();
        this.startSlider();
    }

    startSlider() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    pauseSlider() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
    }

    resumeSlider() {
        this.startSlider();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.products.length;
        this.updateSlider();
    }

    prevSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.products.length - 1 : this.currentSlide - 1;
        this.updateSlider();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlider();
    }

    updateSlider() {
        // Update slide visibility
        document.querySelectorAll('.hero-slide').forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });

        // Update hero content
        this.updateHeroContent();
    }

    updateHeroContent() {
        const currentProduct = this.products[this.currentSlide];
        if (!currentProduct) return;

        // Update description
        const description = document.getElementById('hero-description');
        description.textContent = currentProduct.description;

        // Update product preview card
        const previewCard = document.querySelector('.product-preview-card');
        previewCard.dataset.productId = currentProduct.id;
        previewCard.querySelector('img').src = currentProduct.images[0];
        previewCard.querySelector('h3').textContent = currentProduct.name;
        previewCard.querySelector('.price').textContent = `$${currentProduct.price.toFixed(2)}`;
        
        // Update rating
        const ratingStars = previewCard.querySelector('.rating');
        const starsHtml = '★'.repeat(Math.floor(currentProduct.rating)) + 
                         (currentProduct.rating % 1 >= 0.5 ? '☆' : '') +
                         '☆'.repeat(5 - Math.ceil(currentProduct.rating));
        ratingStars.innerHTML = `${starsHtml} <span>(${currentProduct.rating})</span>`;
    }

    getCurrentProductId() {
        return this.products[this.currentSlide]?.id;
    }

    renderFeaturedProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        this.products.forEach(product => {
            const card = this.createProductCard(product);
            grid.appendChild(card);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product.id;

        const isInWishlist = this.wishlist.some(item => item.id === product.id);
        const ratingStars = '★'.repeat(Math.floor(product.rating)) + 
                           (product.rating % 1 >= 0.5 ? '☆' : '') +
                           '☆'.repeat(5 - Math.ceil(product.rating));

        card.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}">
            <button class="wishlist-toggle ${isInWishlist ? 'active' : ''}" data-product-id="${product.id}">
                <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p class="description">${product.description}</p>
                <div class="rating">
                    ${ratingStars} <span>(${product.rating})</span>
                </div>
                <div class="product-card-actions">
                    <button class="btn-primary" onclick="shopManager.openProductModal(${product.id})">View Details</button>
                </div>
            </div>
        `;

        // Add wishlist toggle event
        const wishlistBtn = card.querySelector('.wishlist-toggle');
        wishlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleWishlistItem(product.id);
        });

        return card;
    }

    openProductModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.currentProduct = product;
        
        // Update modal content
        document.getElementById('main-product-image').src = product.images[0];
        document.getElementById('product-title').textContent = product.name;
        document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('product-description').textContent = product.description;

        // Update rating
        const ratingContainer = document.getElementById('product-rating');
        const starsHtml = '★'.repeat(Math.floor(product.rating)) + 
                         (product.rating % 1 >= 0.5 ? '☆' : '') +
                         '☆'.repeat(5 - Math.ceil(product.rating));
        ratingContainer.querySelector('.stars').innerHTML = starsHtml;
        ratingContainer.querySelector('.rating-text').textContent = `(${product.rating} out of 5)`;
        ratingContainer.querySelector('.review-count').textContent = `${product.reviewCount} reviews`;

        // Update thumbnails
        const thumbnailGallery = document.getElementById('thumbnail-gallery');
        thumbnailGallery.innerHTML = '';
        product.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = image;
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.addEventListener('click', () => {
                document.getElementById('main-product-image').src = image;
                thumbnailGallery.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
            });
            thumbnailGallery.appendChild(thumbnail);
        });

        // Update options
        this.updateProductOptions(product);

        // Update wishlist button
        const isInWishlist = this.wishlist.some(item => item.id === product.id);
        const wishlistBtn = document.getElementById('modal-wishlist-btn');
        wishlistBtn.innerHTML = `<i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>`;
        wishlistBtn.classList.toggle('active', isInWishlist);

        // Load reviews
        this.loadProductReviews(productId);

        this.openModal('product-modal');
    }

    updateProductOptions(product) {
        // Size selector
        const sizeSelector = document.getElementById('size-selector');
        if (product.sizes) {
            sizeSelector.style.display = 'block';
            const sizeOptions = sizeSelector.querySelector('.size-options');
            sizeOptions.innerHTML = '';
            product.sizes.forEach(size => {
                const option = document.createElement('button');
                option.className = 'size-option';
                option.textContent = size;
                option.addEventListener('click', () => {
                    sizeOptions.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
                    option.classList.add('active');
                });
                sizeOptions.appendChild(option);
            });
            // Select first size by default
            sizeOptions.firstChild?.classList.add('active');
        } else {
            sizeSelector.style.display = 'none';
        }

        // Color selector
        const colorSelector = document.getElementById('color-selector');
        if (product.colors) {
            colorSelector.style.display = 'block';
            const colorOptions = colorSelector.querySelector('.color-options');
            colorOptions.innerHTML = '';
            product.colors.forEach(color => {
                const option = document.createElement('button');
                option.className = 'color-option';
                option.textContent = color;
                option.addEventListener('click', () => {
                    colorOptions.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                    option.classList.add('active');
                });
                colorOptions.appendChild(option);
            });
            // Select first color by default
            colorOptions.firstChild?.classList.add('active');
        } else {
            colorSelector.style.display = 'none';
        }

        // Reset quantity
        document.getElementById('quantity-input').value = 1;
    }

    addToCart() {
        if (!this.currentProduct) return;

        const quantity = parseInt(document.getElementById('quantity-input').value);
        const selectedSize = document.querySelector('.size-option.active')?.textContent;
        const selectedColor = document.querySelector('.color-option.active')?.textContent;

        const cartItem = {
            id: this.currentProduct.id,
            name: this.currentProduct.name,
            price: this.currentProduct.price,
            image: this.currentProduct.images[0],
            quantity: quantity,
            size: selectedSize,
            color: selectedColor
        };

        // Check if item already exists in cart
        const existingItemIndex = this.cart.findIndex(item => 
            item.id === cartItem.id && 
            item.size === cartItem.size && 
            item.color === cartItem.color
        );

        if (existingItemIndex > -1) {
            this.cart[existingItemIndex].quantity += quantity;
        } else {
            this.cart.push(cartItem);
        }

        this.saveCart();
        this.updateCartCount();
        this.showToast('Product added to cart!', 'success');
    }

    toggleWishlist() {
        if (!this.currentProduct) return;
        this.toggleWishlistItem(this.currentProduct.id);
    }

    toggleWishlistItem(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingIndex = this.wishlist.findIndex(item => item.id === productId);
        
        if (existingIndex > -1) {
            this.wishlist.splice(existingIndex, 1);
            this.showToast('Removed from wishlist', 'warning');
        } else {
            this.wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0]
            });
            this.showToast('Added to wishlist!', 'success');
        }

        this.saveWishlist();
        this.updateWishlistCount();
        this.updateWishlistButtons(productId);
    }

    updateWishlistButtons(productId) {
        const isInWishlist = this.wishlist.some(item => item.id === productId);
        
        // Update all wishlist buttons for this product
        document.querySelectorAll(`[data-product-id="${productId}"]`).forEach(btn => {
            if (btn.classList.contains('wishlist-toggle')) {
                btn.classList.toggle('active', isInWishlist);
                btn.querySelector('i').className = isInWishlist ? 'fas fa-heart' : 'far fa-heart';
            }
        });

        // Update modal wishlist button if current product
        if (this.currentProduct && this.currentProduct.id === productId) {
            const modalBtn = document.getElementById('modal-wishlist-btn');
            modalBtn.classList.toggle('active', isInWishlist);
            modalBtn.innerHTML = `<i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>`;
        }
    }

    openWishlistModal() {
        const wishlistContent = document.getElementById('wishlist-content');
        const emptyWishlist = document.getElementById('empty-wishlist');
        const wishlistItems = document.getElementById('wishlist-items');

        if (this.wishlist.length === 0) {
            emptyWishlist.style.display = 'block';
            wishlistItems.style.display = 'none';
        } else {
            emptyWishlist.style.display = 'none';
            wishlistItems.style.display = 'block';
            this.renderWishlistItems();
        }

        this.openModal('wishlist-modal');
    }

    renderWishlistItems() {
        const container = document.getElementById('wishlist-items');
        container.innerHTML = '';

        this.wishlist.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'wishlist-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-primary" onclick="shopManager.openProductModal(${item.id})">View</button>
                    <button class="remove-btn" onclick="shopManager.removeFromWishlist(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(itemElement);
        });
    }

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(item => item.id !== productId);
        this.saveWishlist();
        this.updateWishlistCount();
        this.updateWishlistButtons(productId);
        this.renderWishlistItems();
        
        if (this.wishlist.length === 0) {
            document.getElementById('empty-wishlist').style.display = 'block';
            document.getElementById('wishlist-items').style.display = 'none';
        }
    }

    openCartModal() {
        const cartContent = document.getElementById('cart-content');
        const emptyCart = document.getElementById('empty-cart');
        const cartItems = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');

        if (this.cart.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.style.display = 'none';
            cartSummary.style.display = 'none';
        } else {
            emptyCart.style.display = 'none';
            cartItems.style.display = 'block';
            cartSummary.style.display = 'block';
            this.renderCartItems();
            this.updateCartSummary();
        }

        this.openModal('cart-modal');
    }

    renderCartItems() {
        const container = document.getElementById('cart-items');
        container.innerHTML = '';

        this.cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                    ${item.color ? `<p>Color: ${item.color}</p>` : ''}
                    <p class="price">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="item-actions">
                    <div class="quantity-controls">
                        <button class="qty-btn minus" onclick="shopManager.updateCartQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn plus" onclick="shopManager.updateCartQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="shopManager.removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(itemElement);
        });
    }

    updateCartQuantity(index, change) {
        if (this.cart[index]) {
            this.cart[index].quantity += change;
            if (this.cart[index].quantity <= 0) {
                this.cart.splice(index, 1);
            }
            this.saveCart();
            this.updateCartCount();
            this.renderCartItems();
            this.updateCartSummary();
            
            if (this.cart.length === 0) {
                document.getElementById('empty-cart').style.display = 'block';
                document.getElementById('cart-items').style.display = 'none';
                document.getElementById('cart-summary').style.display = 'none';
            }
        }
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        this.updateCartSummary();
        
        if (this.cart.length === 0) {
            document.getElementById('empty-cart').style.display = 'block';
            document.getElementById('cart-items').style.display = 'none';
            document.getElementById('cart-summary').style.display = 'none';
        }
    }

    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `$${subtotal.toFixed(2)}`;
    }

    changeQuantity(change) {
        const input = document.getElementById('quantity-input');
        const currentValue = parseInt(input.value);
        const newValue = Math.max(1, currentValue + change);
        input.value = newValue;
    }

    // Review System
    setUserRating(rating) {
        this.userRating = rating;
        this.highlightStars(rating);
    }

    highlightStars(rating) {
        document.querySelectorAll('#user-rating i').forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
    }

    submitReview() {
        if (!this.currentProduct || this.userRating === 0) {
            this.showToast('Please select a rating', 'warning');
            return;
        }

        const reviewText = document.getElementById('review-text').value.trim();
        if (!reviewText) {
            this.showToast('Please write a review', 'warning');
            return;
        }

        const review = {
            id: Date.now(),
            productId: this.currentProduct.id,
            rating: this.userRating,
            text: reviewText,
            author: 'Anonymous User',
            date: new Date().toLocaleDateString()
        };

        if (!this.reviews[this.currentProduct.id]) {
            this.reviews[this.currentProduct.id] = [];
        }
        this.reviews[this.currentProduct.id].unshift(review);

        this.saveReviews();
        this.loadProductReviews(this.currentProduct.id);
        
        // Reset form
        this.userRating = 0;
        this.highlightStars(0);
        document.getElementById('review-text').value = '';
        
        this.showToast('Review submitted successfully!', 'success');
    }

    loadProductReviews(productId) {
        const reviewsList = document.getElementById('reviews-list');
        const productReviews = this.reviews[productId] || [];

        reviewsList.innerHTML = '';

        if (productReviews.length === 0) {
            reviewsList.innerHTML = '<p style="text-align: center; color: var(--neutral-medium); padding: 2rem;">No reviews yet. Be the first to review this product!</p>';
            return;
        }

        productReviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review-item';
            
            const starsHtml = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            
            reviewElement.innerHTML = `
                <div class="review-header">
                    <span class="reviewer-name">${review.author}</span>
                    <span class="review-date">${review.date}</span>
                </div>
                <div class="review-rating">${starsHtml}</div>
                <div class="review-text">${review.text}</div>
            `;
            reviewsList.appendChild(reviewElement);
        });
    }

    loadSampleReviews() {
        // Add some sample reviews for demonstration
        this.reviews = {
            1: [
                {
                    id: 1,
                    productId: 1,
                    rating: 5,
                    text: "Excellent quality jersey! Very comfortable and breathable.",
                    author: "Mike Johnson",
                    date: "2025-01-15"
                },
                {
                    id: 2,
                    productId: 1,
                    rating: 4,
                    text: "Good fit and material, though sizing runs a bit large.",
                    author: "Sarah Wilson",
                    date: "2025-01-10"
                }
            ],
            2: [
                {
                    id: 3,
                    productId: 2,
                    rating: 5,
                    text: "Amazing running shoes! Great cushioning and support.",
                    author: "David Chen",
                    date: "2025-01-12"
                }
            ]
        };
        this.saveReviews();
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        document.getElementById('toast-container').appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Storage Management
    saveCart() {
        localStorage.setItem('sportsseat_cart', JSON.stringify(this.cart));
    }

    saveWishlist() {
        localStorage.setItem('sportsseat_wishlist', JSON.stringify(this.wishlist));
    }

    saveReviews() {
        localStorage.setItem('sportsseat_reviews', JSON.stringify(this.reviews));
    }

    updateCartCount() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    }

    updateWishlistCount() {
        document.querySelector('.wishlist-count').textContent = this.wishlist.length;
    }
}

// Initialize the shop manager when the page loads
let shopManager;
document.addEventListener('DOMContentLoaded', () => {
    shopManager = new EnhancedShopManager();
});

// Make functions globally accessible for onclick handlers
window.shopManager = shopManager;

  document.getElementById("checkout-btn").addEventListener("click", function () {
    alert("✅ Payment Successful!");
    window.open("index.html"); // closes the current window/tab
    // OR redirect to home page instead of closing:
    // window.location.href = "index.html";
  });