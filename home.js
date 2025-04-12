// Initialize shopping cart
const cart = new ShoppingCart();

// Check if user is authenticated
function checkAuth() {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (!authToken || !userData) {
        window.location.href = 'index.html';
        return null;
    }
    try {
        return JSON.parse(userData);
    } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
        return null;
    }
}

// Initialize page
function initializePage() {
    const userData = checkAuth();
    if (userData) {
        updateProfileInfo(userData);
        loadProducts();
    }
}

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Update profile information
function updateProfileInfo(userData) {
    const userFullName = document.getElementById('userFullName');
    const userEmail = document.getElementById('userEmail');
    if (userFullName) userFullName.textContent = userData.fullName;
    if (userEmail) userEmail.textContent = userData.email;
    
    // Update navigation menu to show user is logged in
    const loginBtn = document.getElementById('loginBtn');
    const profileBtn = document.getElementById('profileBtn');
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileBtn) {
        profileBtn.style.display = 'block';
        profileBtn.textContent = `Welcome, ${userData.fullName}`;
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}

// Function to load products
function loadProducts() {
    for (const category in products) {
        const container = document.getElementById(`${category}-products`);
        if (container) {
            container.innerHTML = '';
            products[category].forEach(product => {
                const card = createProductCard(product);
                container.appendChild(card);
            });
        }
    }
}

// Function to create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    // Add random availability and delivery time for demo
    const inStock = Math.random() > 0.2;
    const deliveryDays = Math.floor(Math.random() * 3) + 1;
    const description = `Fresh ${product.name.toLowerCase()} sourced directly from local farms. Perfect for your healthy lifestyle.`;
    
    card.innerHTML = `
        <div class="card h-100">
            <div class="position-relative">
                <img src="${product.image}" class="card-img-top p-3" alt="${product.name}">
                ${inStock ? '<span class="badge bg-success position-absolute top-0 end-0 m-2">In Stock</span>' : 
                          '<span class="badge bg-danger position-absolute top-0 end-0 m-2">Out of Stock</span>'}
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text text-muted small mb-2">${description}</p>
                <p class="card-text mb-2">
                    <strong class="fs-4">₹${product.price}</strong> per ${product.unit}
                </p>
                <p class="card-text small text-success mb-3">
                    <i class="bi bi-truck"></i> Estimated delivery: ${deliveryDays} day${deliveryDays > 1 ? 's' : ''}
                </p>
                <div class="mt-auto">
                    <div class="input-group mb-2">
                        <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity('${product.id}', -1)">-</button>
                        <input type="number" class="form-control text-center" value="1" min="1" id="quantity-${product.id}" onchange="updateTotalPrice('${product.id}')">
                        <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity('${product.id}', 1)">+</button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-muted">Total:</span>
                        <span class="fw-bold" id="total-price-${product.id}">₹${product.price}</span>
                    </div>
                    <button class="btn btn-primary w-100" onclick="addToCart('${product.id}')" ${!inStock ? 'disabled' : ''}>
                        ${inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `;
    return card;
}

// Function to update quantity input
function updateQuantity(productId, change) {
    const input = document.getElementById(`quantity-${productId}`);
    const newValue = parseInt(input.value) + change;
    if (newValue >= 1) {
        input.value = newValue;
        updateTotalPrice(productId);
    }
}

function updateTotalPrice(productId) {
    const quantity = parseInt(document.getElementById(`quantity-${productId}`).value);
    let product;
    for (const category in products) {
        const found = products[category].find(p => p.id === productId);
        if (found) {
            product = found;
            break;
        }
    }    if (product) {
        const totalPrice = product.price * quantity
        document.getElementById(`total-price-${productId}`).textContent = `₹${totalPrice.toFixed(2)}`;
    }
}

// Function to add item to cart
function addToCart(productId) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityInput.value);
    
    let product;
    for (const category in products) {
        const found = products[category].find(p => p.id === productId);
        if (found) {
            product = found;
            break;
        }
    }
    
    if (product) {
        cart.addItem(product, quantity);
        updateCartDisplay();
        quantityInput.value = 1;
    }
}

// Function to update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const checkoutBtn = document.getElementById('checkout-btn');
    const items = cart.getItems();

    // Update cart items display
    cartItemsContainer.innerHTML = items.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <div class="d-flex align-items-center">
                <div class="cart-item-image-container">
                    <img src="${item.image}" alt="${item.name}" class="rounded cart-item-image" 
                         style="width: 60px; height: 60px; object-fit: cover;"
                         onerror="this.src='logo.svg'; this.onerror=null;">
                </div>
                <div class="ms-3">
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">${item.quantity} × ₹${item.price.toFixed(2)} per ${item.unit}</small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <span class="me-3 fw-bold">₹${(item.price * item.quantity).toFixed(2)}</span>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')">×</button>
            </div>
        </div>
    `).join('');
    
    // Calculate totals using cart's getTotal method
    const subtotal = cart.getTotal();
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    // Update display of totals
    cartSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    cartTax.textContent = `₹${tax.toFixed(2)}`;
    cartTotal.textContent = `₹${total.toFixed(2)}`;
    
    // Update buy button state and text
    checkoutBtn.disabled = items.length === 0;
    checkoutBtn.textContent = items.length === 0 ? 'Cart Empty' : 'Buy';
    checkoutBtn.className = `btn ${items.length === 0 ? 'btn-secondary' : 'btn-success'} w-100`;

    // Update cart badge
    const cartBadge = document.getElementById('cart-badge');
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = itemCount;
    cartBadge.style.display = itemCount > 0 ? 'block' : 'none';
}

// Function to remove item from cart
function removeFromCart(productId) {
    cart.removeItem(productId);
    updateCartDisplay();
}

// Handle checkout process
function initializeCheckout() {
    const orderProcessor = new OrderProcessor(cart);
    const checkoutBtn = document.getElementById('checkout-btn');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const cardDetails = document.getElementById('card-details');
    const checkoutForm = document.getElementById('checkout-form');

    // Initialize checkout modal
    const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));

    // Show checkout modal and pre-fill user data
    checkoutBtn.addEventListener('click', () => {
        // Check if cart is empty
        if (cart.getItems().length === 0) {
            alert('Your cart is empty. Please add items before proceeding to checkout.');
            return;
        }

        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            document.getElementById('name').value = userData.fullName || '';
            document.getElementById('phone').focus();
        }

        // Reset form validation state
        checkoutForm.classList.remove('was-validated');
        // Reset payment method to default
        document.querySelector('input[name="payment"][value="cod"]').checked = true;
        cardDetails.style.display = 'none';

        // Update total in checkout modal
        const totals = orderProcessor.calculateTotals();
        document.getElementById('checkout-subtotal').textContent = `₹${totals.subtotal}`;
        document.getElementById('checkout-tax').textContent = `₹${totals.tax}`;
        document.getElementById('checkout-total').textContent = `₹${totals.total}`;

        checkoutModal.show();
    });

    // Handle payment method change
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isCardPayment = radio.value === 'card';
            cardDetails.style.display = isCardPayment ? 'block' : 'none';
            
            // Reset and disable/enable card fields
            const cardFields = cardDetails.querySelectorAll('input');
            cardFields.forEach(field => {
                field.value = '';
                field.disabled = !isCardPayment;
                field.required = isCardPayment;
            });

            // Update place order button text based on payment method
            const placeOrderBtn = document.getElementById('place-order-btn');
            placeOrderBtn.textContent = radio.value === 'cod' ? 'Place Order (Cash on Delivery)' : 'Place Order';
        });
    });

    // Format card inputs
    const formatCardNumber = (input) => {
        let value = input.value.replace(/\D/g, '');
        value = value.replace(/(.{4})/g, '$1 ').trim();
        input.value = value.substring(0, 19);
    };

    const formatCardExpiry = (input) => {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        input.value = value.substring(0, 5);
    };

    // Add input formatters
    document.getElementById('card-number').addEventListener('input', (e) => formatCardNumber(e.target));
    document.getElementById('card-expiry').addEventListener('input', (e) => formatCardExpiry(e.target));
    document.getElementById('card-cvv').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
    });

    // Validate card details
    const validateCardDetails = () => {
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;

        if (!/^\d{16}$/.test(cardNumber)) {
            throw new Error('Please enter a valid 16-digit card number');
        }

        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardExpiry)) {
            throw new Error('Please enter a valid expiry date (MM/YY)');
        }

        const [month, year] = cardExpiry.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expiry < new Date()) {
            throw new Error('Card has expired');
        }

        if (!/^\d{3}$/.test(cardCvv)) {
            throw new Error('Please enter a valid 3-digit CVV');
        }
    };

    // Handle order placement
    document.getElementById('place-order-btn').addEventListener('click', async () => {
        try {
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                throw new Error('Please select a payment method');
            }

            // Validate address details first
            const addressFields = [
                { id: 'name', label: 'Full Name' },
                { id: 'phone', label: 'Phone Number' },
                { id: 'address-line1', label: 'Address' },
                { id: 'city', label: 'City' },
                { id: 'state', label: 'State' },
                { id: 'zipcode', label: 'ZIP Code' }
            ];
            
            const emptyFields = addressFields.filter(field => !document.getElementById(field.id).value.trim());
            
            if (emptyFields.length > 0) {
                const missingField = emptyFields[0];
                checkoutForm.classList.add('was-validated');
                document.getElementById(missingField.id).focus();
                throw new Error(`Please enter your ${missingField.label}`);
            }

            if (!checkoutForm.checkValidity()) {
                checkoutForm.classList.add('was-validated');
                return;
            }

            if (selectedPayment.value === 'card') {
                validateCardDetails();
            }

            const formData = {
                name: document.getElementById('name').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address-line1').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                zipcode: document.getElementById('zipcode').value.trim(),
                paymentMethod: selectedPayment.value
            };

            // Process order and generate slip
            await orderProcessor.processOrder(formData);
            
            // Clear cart and update display
            cart.clear();
            updateCartDisplay();
            
            // Close checkout modal and show confirmation
            checkoutModal.hide();
            const confirmationModal = new bootstrap.Modal(document.getElementById('orderConfirmationModal'));
            confirmationModal.show();
            
            // Reset form
            checkoutForm.reset();
            cardDetails.style.display = 'none';
            checkoutForm.classList.remove('was-validated');
            
        } catch (error) {
            alert(error.message || 'There was an error processing your order. Please try again.');
        }
    });

    // Handle zipcode validation and city/state autofill
    document.getElementById('zipcode').addEventListener('input', (e) => {
        const zipcode = e.target.value.trim();
        if (zipcode.length === 6 && /^\d+$/.test(zipcode)) {
            // Simulate ZIP code validation with a delay
            setTimeout(() => {
                if (document.getElementById('zipcode').value === zipcode) {
                    document.getElementById('city').value = 'Sample City';
                    document.getElementById('state').value = 'Sample State';
                }
            }, 500);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and get user data
    const userData = checkAuth();
    if (userData) {
        updateProfileInfo(userData);
        loadProducts();
        updateCartDisplay();
        initializeCheckout();
    }

    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
    });
});