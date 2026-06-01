// Shopping Cart State
let cart = [];

// DOM Elements cache for Cart
let cartBackdropEl = null;
let cartItemsContainerEl = null;
let cartSubtotalEl = null;
let cartTotalEl = null;
let cartTaxEl = null;
let cartCountBadgeEl = null;

/**
 * Initialize Cart System
 */
function initCart() {
  // Select Elements
  cartBackdropEl = document.getElementById('cart-backdrop');
  cartItemsContainerEl = document.getElementById('cart-items-container');
  cartSubtotalEl = document.getElementById('cart-subtotal');
  cartTaxEl = document.getElementById('cart-tax');
  cartTotalEl = document.getElementById('cart-total');
  cartCountBadgeEl = document.getElementById('cart-count-badge');

  // Load from local storage
  loadCartFromStorage();
  
  // Initial Render
  updateCartUI();

  // Bind close buttons and backdrop
  const closeBtn = document.getElementById('cart-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleCart(false));
  }
  
  if (cartBackdropEl) {
    cartBackdropEl.addEventListener('click', (e) => {
      if (e.target === cartBackdropEl) {
        toggleCart(false);
      }
    });
  }

  // Bind checkout button
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        if (window.showToast) window.showToast("Your cart is empty!", "error");
        return;
      }
      // Trigger glowing mock checkout
      if (window.showToast) {
        window.showToast("SECURE GATEWAY: Initiating Encrypted Checkout...", "success");
        setTimeout(() => {
          window.showToast("Mock Order Placed! Thank you for choosing SecureVision.", "success");
          clearCart();
          toggleCart(false);
        }, 1500);
      }
    });
  }
}

/**
 * Load cart items from localStorage
 */
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('securevision_cart');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Could not load cart from storage", e);
    cart = [];
  }
}

/**
 * Save cart items to localStorage
 */
function saveCartToStorage() {
  try {
    localStorage.setItem('securevision_cart', JSON.stringify(cart));
  } catch (e) {
    console.error("Could not save cart to storage", e);
  }
}

/**
 * Toggle cart sidebar drawer open/close
 * @param {boolean} open 
 */
function toggleCart(open) {
  if (!cartBackdropEl) return;
  if (open) {
    cartBackdropEl.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent main page scrolling
  } else {
    cartBackdropEl.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Add a product to the cart
 * @param {string} productId 
 */
function addToCart(productId) {
  // Find product in catalog
  const product = window.SecureCatalog.products.find(p => p.id === productId);
  if (!product) return;

  // Check if already in cart
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCartToStorage();
  updateCartUI();
  
  // Show drawer and trigger feedback Toast
  toggleCart(true);
  if (window.showToast) {
    window.showToast(`Added ${product.name} to security cart.`, "success");
  }

  // Trigger brief bounce animation on cart trigger widget
  const trigger = document.querySelector('.cart-trigger');
  if (trigger) {
    trigger.style.animation = 'none';
    setTimeout(() => {
      trigger.style.animation = 'bounce 0.4s ease-out';
    }, 10);
  }
}

/**
 * Remove product from cart
 * @param {string} productId 
 */
function removeFromCart(productId) {
  const item = cart.find(item => item.id === productId);
  cart = cart.filter(item => item.id !== productId);
  
  saveCartToStorage();
  updateCartUI();

  if (window.showToast && item) {
    window.showToast(`Removed ${item.name} from cart.`, "error");
  }
}

/**
 * Update the quantity of a cart item
 * @param {string} productId 
 * @param {number} change - +1 or -1
 */
function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCartToStorage();
    updateCartUI();
  }
}

/**
 * Clear all cart items
 */
function clearCart() {
  cart = [];
  saveCartToStorage();
  updateCartUI();
}

/**
 * Update the cart counts and redraw items
 */
function updateCartUI() {
  // 1. Update Navigation Badge
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountBadgeEl) {
    cartCountBadgeEl.textContent = totalCount;
    cartCountBadgeEl.style.display = totalCount > 0 ? 'flex' : 'none';
  }

  // 2. Render Drawer Items
  if (!cartItemsContainerEl) return;

  if (cart.length === 0) {
    cartItemsContainerEl.innerHTML = `
      <div class="cart-empty">
        <i data-lucide="shopping-bag"></i>
        <div class="cart-empty-text">Your security cart is empty</div>
        <button class="btn btn-secondary" onclick="toggleCart(false)" style="font-size: 0.85rem; padding: 8px 18px;">
          Explore Products
        </button>
      </div>
    `;
    // Recreate icons inside empty state
    if (window.lucide) {
      window.lucide.createIcons();
    }
  } else {
    cartItemsContainerEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <button class="cart-item-remove-btn" onclick="removeFromCart('${item.id}')" title="Remove Item">
          <i data-lucide="trash-2"></i>
        </button>
        <div class="cart-item-img-box">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        </div>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-meta">
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            <div class="cart-item-qty">
              <button class="cart-qty-btn" onclick="updateQuantity('${item.id}', -1)" title="Decrease Quantity">
                <i data-lucide="minus"></i>
              </button>
              <div class="cart-qty-val">${item.quantity}</div>
              <button class="cart-qty-btn" onclick="updateQuantity('${item.id}', 1)" title="Increase Quantity">
                <i data-lucide="plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Recreate icons in drawer items
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // 3. Compute and render Financial Summaries
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% mock VAT/sales tax
  const total = subtotal + tax;

  if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (cartTaxEl) cartTaxEl.textContent = `$${tax.toFixed(2)}`;
  if (cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;
}

// Export for browser access
window.SecureCart = {
  cart,
  initCart,
  toggleCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
};
