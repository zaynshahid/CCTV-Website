// In-memory catalog cache loaded from database
let products = [];

// Fallback offline catalog (in case database connection fails)
const fallbackCatalog = [
  {
    id: "sv-sentinel-4k",
    name: "SV-Sentinel 4K (Offline)",
    category: "dome",
    price: 189.99,
    rating: 4.9,
    reviewsCount: 142,
    tag: "AI-ENABLED",
    badgeClass: "badge-cyan",
    image: "assets/images/dome.png",
    description: "Next-gen dome surveillance with 360° panoramic view, ultra-HD 4K sensor, and intelligent AI subject tracking.",
    features: ["4K Ultra-HD", "AI Motion Tracking", "360° Rotation", "Color Night Vision"]
  },
  {
    id: "sv-apex-shield",
    name: "SV-Apex Shield (Offline)",
    category: "bullet",
    price: 249.99,
    rating: 4.8,
    reviewsCount: 96,
    tag: "SOLAR READY",
    badgeClass: "badge-green",
    image: "assets/images/bullet.png",
    description: "Weatherproof long-range bullet system with integrated high-efficiency solar panel, active alerts, and threat deterrence.",
    features: ["Solar-Powered", "IP67 Weatherproof", "150ft IR Range", "Active Siren"]
  },
  {
    id: "sv-nano-stealth",
    name: "SV-Nano Stealth (Offline)",
    category: "smart-home",
    price: 129.99,
    rating: 4.7,
    reviewsCount: 215,
    tag: "BESTSELLER",
    badgeClass: "badge-cyan",
    image: "assets/images/stealth.png",
    description: "Minimalist, unobtrusive smart home indoor camera featuring high-fidelity two-way audio and precise human sound alerts.",
    features: ["Human Sound Detection", "2-Way Audio", "Dual-Band WiFi", "Sleek Spherical Design"]
  }
];

/**
 * Fetch product catalog from MongoDB Atlas database API
 */
async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }
    const data = await res.json();
    products = data;
    console.log("DATABASE: Successfully loaded products from MongoDB.");
    return products;
  } catch (err) {
    console.warn("DATABASE FAIL: Could not load products from MongoDB. Initializing fallback offline catalog.", err.message);
    products = fallbackCatalog;
    return products;
  }
}

/**
 * Filter and search the cached product catalog
 * @param {string} category - 'all', 'bullet', 'dome', 'smart-home'
 * @param {string} search - search query string
 * @param {string} sortBy - 'popular', 'price-low', 'price-high', 'rating'
 */
function getFilteredProducts(category = 'all', search = '', sortBy = 'popular') {
  let filtered = [...products];

  // 1. Filter by category
  if (category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  // 2. Filter by search query
  if (search.trim() !== '') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.features.some(f => f.toLowerCase().includes(q))
    );
  }

  // 3. Sorting
  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else {
    // default 'popular' - sorted by review count and rating
    filtered.sort((a, b) => (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount));
  }

  return filtered;
}

// Export for browser scripts
window.SecureCatalog = {
  fetchProducts,
  getFilteredProducts,
  fallbackCatalog
};

// Define products getter so it behaves as an array property and can be read by other scripts
Object.defineProperty(window.SecureCatalog, 'products', {
  get: function() { return products; }
});
