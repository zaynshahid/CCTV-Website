const products = [
  {
    id: "sv-sentinel-4k",
    name: "SV-Sentinel 4K",
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
    name: "SV-Apex Shield",
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
    name: "SV-Nano Stealth",
    category: "smart-home",
    price: 129.99,
    rating: 4.7,
    reviewsCount: 215,
    tag: "BESTSELLER",
    badgeClass: "badge-cyan",
    image: "assets/images/stealth.png",
    description: "Minimalist, unobtrusive smart home indoor camera featuring high-fidelity two-way audio and precise human sound alerts.",
    features: ["Human Sound Detection", "2-Way Audio", "Dual-Band WiFi", "Sleek Spherical Design"]
  },
  {
    id: "sv-thermal-aegis",
    name: "SV-Thermal Aegis",
    category: "bullet",
    price: 459.99,
    rating: 4.9,
    reviewsCount: 34,
    tag: "PRO SERIES",
    badgeClass: "badge-cyan",
    image: "assets/images/bullet.png",
    description: "Military-grade thermal imaging bullet camera with heat signature mapping, perfect for long-distance perimeter guards.",
    features: ["Thermal Signature Mapping", "Perimeter Guard AI", "PoE Supported", "Rugged Steel Casing"]
  },
  {
    id: "sv-panoptic-dome",
    name: "SV-Panoptic Dome",
    category: "dome",
    price: 299.99,
    rating: 4.9,
    reviewsCount: 88,
    tag: "NEW ARRIVAL",
    badgeClass: "badge-green",
    image: "assets/images/dome.png",
    description: "Multi-lens professional dome security camera providing complete 180° horizontal coverage without lens distortion.",
    features: ["180° Horizon Field", "Triple Lens Matrix", "AI Face Recognition", "Vandal-Proof IK10"]
  },
  {
    id: "sv-solar-sentinel",
    name: "SV-Solar Sentinel",
    category: "smart-home",
    price: 159.99,
    rating: 4.6,
    reviewsCount: 112,
    tag: "WIRE-FREE",
    badgeClass: "badge-green",
    image: "assets/images/stealth.png",
    description: "A completely wire-free smart home outdoor security hub, featuring high-speed 5G WiFi and micro-solar integration.",
    features: ["5G WiFi Connection", "Rechargeable Battery", "Micro-Solar Shield", "Smart Sirens"]
  }
];

/**
 * Filter and search the product catalog
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
  products,
  getFilteredProducts
};
