// Global Active State
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'popular';

// DOM Cache
let productGridEl = null;
let searchInputEl = null;
let sortSelectEl = null;
let categoryBtns = [];

/**
 * Main Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Cache Core DOM Elements
  productGridEl = document.getElementById('products-grid');
  searchInputEl = document.getElementById('nav-search-input');
  sortSelectEl = document.getElementById('catalog-select');
  categoryBtns = document.querySelectorAll('.catalog-tab-btn, .nav-link');

  // Initialize Modules
  if (window.SecureCart) window.SecureCart.initCart();
  if (window.SecureAuth) window.SecureAuth.initAuth();

  // Initialize UI Bindings
  initScrollNavbar();
  initCatalogFilters();
  initLiveFeedSim();
  initNewsletterForm();

  // Initial Product Catalog Render
  renderProducts();

  // Welcome secure notification
  setTimeout(() => {
    showToast("SECUREVISION: Intruder Defense Systems Active & Verified.", "success");
  }, 1000);
});

/**
 * Sticky Glassmorphism Navbar Scroll Effect
 */
function initScrollNavbar() {
  const navbarWrapper = document.getElementById('navbar-wrapper');
  if (!navbarWrapper) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbarWrapper.classList.add('navbar-scrolled');
    } else {
      navbarWrapper.classList.remove('navbar-scrolled');
    }
  });
}

/**
 * Toast Notifications System
 * @param {string} message 
 * @param {string} type - 'success', 'error', 'info'
 */
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} glass`;

  let icon = 'info';
  if (type === 'success') icon = 'shield-check';
  if (type === 'error') icon = 'alert-triangle';

  toast.innerHTML = `
    <i class="toast-icon" data-lucide="${icon}"></i>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);
  
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Remove toast after duration
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3500);
}

// Bind to window for other scripts to call
window.showToast = showToast;

/**
 * Dynamic Product Grid Renderer
 */
function renderProducts() {
  if (!productGridEl) return;

  const filtered = window.SecureCatalog.getFilteredProducts(currentCategory, currentSearch, currentSort);

  if (filtered.length === 0) {
    productGridEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0; color: var(--text-secondary);">
        <i data-lucide="search-x" style="width: 48px; height: 48px; stroke-width: 1.5; color: var(--text-muted); margin-bottom: 16px;"></i>
        <p style="font-size: 1.1rem; font-weight: 500;">No cameras matched your security criteria.</p>
        <button class="btn btn-secondary" onclick="resetFilters()" style="margin-top: 16px; font-size: 0.85rem; padding: 8px 18px;">
          Reset Filters
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  productGridEl.innerHTML = filtered.map(product => `
    <div class="product-card glass glass-hover">
      <div class="product-image-box">
        <span class="product-tag badge ${product.badgeClass}">${product.tag}</span>
        <div class="product-laser"></div>
        <img src="${product.image}" alt="${product.name}" class="product-img" />
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="product-category">${product.category} Camera</span>
          <div class="product-rating">
            <i data-lucide="star" style="fill: #ffb800; stroke: none; width: 14px; height: 14px;"></i>
            ${product.rating} <span>(${product.reviewsCount})</span>
          </div>
        </div>
        <h3 class="product-title">${product.name}</h3>
        <p class="feature-desc" style="font-size: 0.85rem; line-height: 1.4; height: 40px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
          ${product.description}
        </p>
        <div class="product-footer">
          <div class="product-price-box">
            <span class="product-price">$${product.price.toFixed(2)}</span>
          </div>
          <button class="product-add-btn" onclick="window.SecureCart.addToCart('${product.id}')" title="Add to Security Cart">
            <i data-lucide="shopping-cart"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Filter catalog on tabs or search changes
 */
function initCatalogFilters() {
  // Bind category tabs and navbar filter links
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const cat = btn.getAttribute('data-category');
      if (!cat) return;

      currentCategory = cat;

      // Update Active Classes for both Catalog Tabs and Navbar Links
      categoryBtns.forEach(b => {
        if (b.getAttribute('data-category') === cat) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // Clear search on tab switch to avoid confusion
      if (searchInputEl) {
        searchInputEl.value = '';
        currentSearch = '';
      }

      // Render updated catalog and scroll down to shop smoothly if clicked from navbar
      renderProducts();
      
      if (btn.classList.contains('nav-link')) {
        const shopSection = document.getElementById('shop-section');
        if (shopSection) {
          shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Bind Search Inputs
  if (searchInputEl) {
    searchInputEl.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderProducts();
    });
  }

  // Bind Sorting Select Dropdown
  if (sortSelectEl) {
    sortSelectEl.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }
}

/**
 * Reset all dynamic catalog filters
 */
function resetFilters() {
  currentCategory = 'all';
  currentSearch = '';
  currentSort = 'popular';

  if (searchInputEl) searchInputEl.value = '';
  if (sortSelectEl) sortSelectEl.value = 'popular';

  categoryBtns.forEach(btn => {
    if (btn.getAttribute('data-category') === 'all') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderProducts();
}

/**
 * Interactive CCTV Camera Simulator Dashboard
 */
function initLiveFeedSim() {
  const toggleAI = document.getElementById('sim-toggle-ai');
  const toggleNight = document.getElementById('sim-toggle-night');
  const btnSnapshot = document.getElementById('sim-btn-snapshot');
  const simFeed = document.getElementById('sim-feed');
  const simDiagLogs = document.getElementById('sim-diag-logs');
  const shutterFlash = document.getElementById('sim-shutter');

  if (!simFeed || !simDiagLogs) return;

  // Add initial telemetry log lines
  addDiagLog("SYSTEM", "SecureVision OS v4.12.0 core initialized.", "success");
  addDiagLog("CAMERA_01", "Live satellite uplink connected. Status: nominal.", "success");
  addDiagLog("TELEMETRY", "Active stream: 4K UHD | 60FPS | H.265 Encrypted.", "info");

  // Toggle AI Bounding Boxes overlay
  if (toggleAI) {
    toggleAI.addEventListener('change', (e) => {
      if (e.target.checked) {
        simFeed.classList.add('ai-on');
        addDiagLog("AI_COGNITIVE", "Intelligent computer vision active. Scanning feed...", "success");
        addDiagLog("DETECTOR", "Identified targets: Person (98%), Secure Vault (100%).", "info");
      } else {
        simFeed.classList.remove('ai-on');
        addDiagLog("AI_COGNITIVE", "AI bounding overlays deactivated.", "info");
      }
    });
  }

  // Toggle Thermal Night Vision green lens filter
  if (toggleNight) {
    toggleNight.addEventListener('change', (e) => {
      if (e.target.checked) {
        simFeed.classList.add('night-mode');
        addDiagLog("LENS_MODIFIER", "Infrared cutoff filters retracted. Night vision mode enabled.", "success");
        addDiagLog("THERMAL", "Thermal heat signature mapping enabled.", "info");
      } else {
        simFeed.classList.remove('night-mode');
        addDiagLog("LENS_MODIFIER", "Daylight optics engaged. Standard filters restored.", "info");
      }
    });
  }

  // Snapshot flash effect
  if (btnSnapshot) {
    btnSnapshot.addEventListener('click', () => {
      if (shutterFlash) {
        // Trigger white flash animation
        shutterFlash.classList.add('flash');
        shutterFlash.addEventListener('animationend', () => {
          shutterFlash.classList.remove('flash');
        }, { once: true });
      }

      // Generate telemetry line
      const id = Math.floor(Math.random() * 9000) + 1000;
      const filename = `SV_CAM01_CAPT_${id}.PNG`;
      
      addDiagLog("SHUTTER", `Captured snapshot: saving telemetry metadata...`, "info");
      
      setTimeout(() => {
        addDiagLog("STORAGE", `Snapshot saved locally as: ${filename}`, "success");
        showToast(`Snapshot Captured: ${filename}`, "success");
      }, 500);
    });
  }

  // Helper: Append formatted logger command line inside mock terminal
  function addDiagLog(tag, message, statusClass = 'info') {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const line = document.createElement('div');
    line.className = `sim-diag-line ${statusClass === 'success' ? 'success' : statusClass === 'error' ? 'alert' : ''}`;
    line.innerHTML = `
      <span class="sim-diag-time">[${time}]</span>
      <span class="sim-diag-tag">${tag}:</span>
      <span class="sim-diag-msg">${message}</span>
    `;
    simDiagLogs.appendChild(line);
    
    // Auto Scroll bottom
    simDiagLogs.scrollTop = simDiagLogs.scrollHeight;
  }
}

/**
 * Footer newsletter capture mock
 */
function initNewsletterForm() {
  const form = document.getElementById('footer-newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('.footer-input').value.trim();
      if (!email) return;

      showToast("Security briefs & firmware alerts subscribed!", "success");
      form.reset();
    });
  }
}
