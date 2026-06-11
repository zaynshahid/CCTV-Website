const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Programmatic DNS resolution fix: forces Node.js to use Google DNS (8.8.8.8)
// to resolve MongoDB Atlas SRV records, bypassing faulty local ISP/router DNS.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('DNS: Configured process resolver to Google DNS (8.8.8.8).');
} catch (err) {
  console.warn('DNS WARNING: Failed to override default resolver.', err.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('.')); // Serve static frontend files (index.html, css/, js/)

// ==========================================
// 1. MONGODB ATLAS CONNECTION
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('DATABASE: Connected securely to MongoDB Atlas.');
    seedProductsIfEmpty();
  })
  .catch(err => {
    console.error('DATABASE ERROR: Connection failed!', err.message);
  });

// ==========================================
// 2. SCHEMAS & MODELS
// ==========================================

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  reviewsCount: { type: Number, required: true },
  tag: { type: String, required: true },
  badgeClass: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  features: [{ type: String }]
});

const Product = mongoose.model('Product', productSchema);

// User Schema (with secure bcrypt passwords)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// ==========================================
// 3. AUTO-DATABASE SEEDER
// ==========================================
const defaultCatalog = [
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

async function seedProductsIfEmpty() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('SEEDER: Database is empty. Seeding default CCTV product catalog...');
      await Product.insertMany(defaultCatalog);
      console.log('SEEDER: Product catalog successfully injected into MongoDB Atlas.');
    } else {
      console.log(`DATABASE: Found ${count} products. Seeding skipped.`);
    }
  } catch (err) {
    console.error('SEEDER ERROR: Failed to seed products.', err.message);
  }
}

// ==========================================
// 4. API ENDPOINTS (PRODUCTS & AUTH)
// ==========================================

// Get Catalog Products (with query filtering)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { features: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Product.find(filter);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products from MongoDB.' });
  }
});

// Secure User Registration (Bcrypt Hashing)
const bcrypt = require('bcryptjs');

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all details.' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Investigator email is already registered.' });
    }

    // Hash the password key
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();
    console.log(`AUTH: Provisioned user successfully: ${newUser.email}`);

    res.json({
      message: 'Account successfully registered.',
      user: { name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error registering credentials.' });
  }
});

// Secure User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid security credentials (email).' });
    }

    // Compare Password hashes
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid security credentials (password).' });
    }

    console.log(`AUTH: Active agent authenticated: ${user.email}`);
    res.json({
      message: 'Credentials verified.',
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database auth server failure.' });
  }
});

// Start listening on host 0.0.0.0 (all network interfaces)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER: Run command active. SecureVision serving at http://0.0.0.0:${PORT}`);
});
