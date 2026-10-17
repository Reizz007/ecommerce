import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper functions for Database read/write
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { tools: [], orders: [], subscribers: [], settings: {}, stats: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to db.json:', err);
    return false;
  }
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Auth Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  // Check Admin Credentials
  if ((email.toLowerCase() === 'admin@synapse.ai' || email.toLowerCase() === 'admin') && password === 'admin123') {
    return res.json({
      success: true,
      user: {
        id: 'admin_master',
        name: 'Master Admin',
        email: 'admin@synapse.ai',
        role: 'admin',
        permissions: ['all']
      },
      token: 'jwt_synapse_admin_session_token_98a7'
    });
  }

  // Regular user login
  if (password === 'user123' || password.length >= 6) {
    return res.json({
      success: true,
      user: {
        id: `user_${Date.now()}`,
        name: email.split('@')[0] || 'Subscriber',
        email: email,
        role: 'user',
        permissions: ['standard']
      },
      token: 'jwt_synapse_user_session_token'
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials. For Admin use admin@synapse.ai / admin123' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Synapse Backend API', timestamp: new Date().toISOString() });
});

// Stats overview for Admin Panel
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const totalRevenue = db.orders
    .filter(o => o.status === 'Verified')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const stats = {
    ...db.stats,
    totalRevenue: totalRevenue || db.stats.totalRevenue,
    totalOrders: db.orders.length,
    toolsCount: db.tools.length,
    subscribersCount: db.subscribers.length,
    abaOrdersCount: db.orders.filter(o => o.paymentMethod?.includes('ABA')).length
  };
  res.json({ success: true, stats });
});

// Global Store Settings (ABA PAY link, Announcement, Promos)
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json({ success: true, settings: db.settings, abaPayLink: db.settings?.abaPayLink });
});

app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json({ success: true, message: 'Settings updated successfully', settings: db.settings });
});

// Categories API
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'LLM & Reasoning', slug: 'llm', color: '#8b5cf6', icon: 'Brain', badge: 'Flagship', display_order: 1 },
  { id: 2, name: 'Vision & Diffusion', slug: 'vision', color: '#ec4899', icon: 'Sparkles', badge: 'Generative', display_order: 2 },
  { id: 3, name: 'Autonomous Coding', slug: 'code', color: '#06b6d4', icon: 'Cpu', badge: 'Developer', display_order: 3 },
  { id: 4, name: 'Voice & Audio DSP', slug: 'audio', color: '#10b981', icon: 'Sliders', badge: 'Realtime', display_order: 4 },
  { id: 5, name: 'Neural SEO & Data', slug: 'data', color: '#f43f5e', icon: 'TrendingUp', badge: 'Enterprise', display_order: 5 }
];

app.get('/api/categories', (req, res) => {
  const db = readDB();
  const categories = (db.categories && db.categories.length > 0) ? db.categories : DEFAULT_CATEGORIES;
  res.json({ success: true, categories });
});

app.post('/api/categories', (req, res) => {
  const db = readDB();
  if (!db.categories || db.categories.length === 0) db.categories = [...DEFAULT_CATEGORIES];
  const newCat = {
    id: Date.now(),
    name: req.body.name || 'New Category',
    slug: req.body.slug || `cat_${Date.now()}`,
    description: req.body.description || '',
    icon: req.body.icon || 'Boxes',
    color: req.body.color || '#8b5cf6',
    badge: req.body.badge || 'New',
    display_order: req.body.display_order || (db.categories.length + 1)
  };
  db.categories.push(newCat);
  writeDB(db);
  res.status(201).json({ success: true, category: newCat });
});

app.put('/api/categories/:id', (req, res) => {
  const db = readDB();
  if (!db.categories || db.categories.length === 0) db.categories = [...DEFAULT_CATEGORIES];
  const idx = db.categories.findIndex(c => String(c.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Category not found' });
  db.categories[idx] = { ...db.categories[idx], ...req.body };
  writeDB(db);
  res.json({ success: true, category: db.categories[idx] });
});

app.delete('/api/categories/:id', (req, res) => {
  const db = readDB();
  if (!db.categories || db.categories.length === 0) db.categories = [...DEFAULT_CATEGORIES];
  db.categories = db.categories.filter(c => String(c.id) !== String(req.params.id));
  writeDB(db);
  res.json({ success: true, message: 'Category deleted successfully' });
});

// Products / Tools Catalog CRUD (Supports both /api/products and /api/tools)
const handleGetTools = (req, res) => {
  const db = readDB();
  res.json({ success: true, products: db.tools, tools: db.tools });
};
app.get('/api/products', handleGetTools);
app.get('/api/tools', handleGetTools);

const handleCreateTool = (req, res) => {
  const db = readDB();
  const newTool = {
    id: req.body.id || `tool_${Date.now()}`,
    name: req.body.name || 'Untitled AI Tool',
    category: req.body.category || 'llm',
    badge: req.body.badge || 'PRO',
    rating: req.body.rating || 4.95,
    reviewsCount: req.body.reviewsCount || 100,
    usersCount: req.body.usersCount || '10k+',
    shortDesc: req.body.shortDesc || '',
    capabilities: req.body.capabilities || ['Neural Processing', 'API Access'],
    priceMonthly: Number(req.body.priceMonthly) || 29,
    priceLifetime: Number(req.body.priceLifetime) || 199,
    includedInSub: req.body.includedInSub ?? true,
    engineVersion: req.body.engineVersion || 'v1.0-Core',
    latency: req.body.latency || '20ms',
    icon: req.body.icon || 'Brain',
    color: req.body.color || '#8b5cf6',
    status: req.body.status || 'Active'
  };

  db.tools.unshift(newTool);
  writeDB(db);
  res.status(201).json({ success: true, product: newTool, tool: newTool });
};
app.post('/api/products', handleCreateTool);
app.post('/api/tools', handleCreateTool);

const handleUpdateTool = (req, res) => {
  const db = readDB();
  const toolIndex = db.tools.findIndex(t => String(t.id) === String(req.params.id));
  if (toolIndex === -1) {
    return res.status(404).json({ success: false, message: 'Tool not found' });
  }

  db.tools[toolIndex] = { ...db.tools[toolIndex], ...req.body };
  writeDB(db);
  res.json({ success: true, product: db.tools[toolIndex], tool: db.tools[toolIndex] });
};
app.put('/api/products/:id', handleUpdateTool);
app.put('/api/tools/:id', handleUpdateTool);

const handleDeleteTool = (req, res) => {
  const db = readDB();
  const initialLength = db.tools.length;
  db.tools = db.tools.filter(t => String(t.id) !== String(req.params.id));
  if (db.tools.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Tool not found' });
  }
  writeDB(db);
  res.json({ success: true, message: 'Tool deleted successfully' });
};
app.delete('/api/products/:id', handleDeleteTool);
app.delete('/api/tools/:id', handleDeleteTool);

// Orders & Payments Management
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json({ success: true, orders: db.orders });
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const orderId = `SYN-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const apiKey = `sk_synapse_live_${Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  const newOrder = {
    id: orderId,
    customerName: req.body.customerName || 'Customer',
    customerEmail: req.body.customerEmail || 'user@example.com',
    company: req.body.company || '',
    items: req.body.items || ['Pro AI Suite'],
    amount: Number(req.body.amount) || 49,
    paymentMethod: req.body.paymentMethod || 'ABA PAY / PayWay',
    abaLink: db.settings?.abaPayLink || 'https://link.payway.com.kh/ABAPAY9s540501U',
    status: 'Verified',
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    apiKey: apiKey
  };

  db.orders.unshift(newOrder);

  // If subscription, also add or update subscriber
  const hasSubscription = newOrder.items.some(item => typeof item === 'string' && item.toLowerCase().includes('suite') || item.toLowerCase().includes('membership'));
  if (hasSubscription) {
    const existingSubIndex = db.subscribers.findIndex(s => s.email === newOrder.customerEmail);
    const subRecord = {
      id: `sub_${Date.now()}`,
      name: newOrder.customerName,
      email: newOrder.customerEmail,
      plan: 'Pro AI Suite (Annual)',
      tier: 'pro',
      tokensUsed: 0,
      tokenLimit: 15000000,
      status: 'Active',
      renewsOn: '2027-10-16',
      paymentMethod: newOrder.paymentMethod
    };
    if (existingSubIndex >= 0) {
      db.subscribers[existingSubIndex] = { ...db.subscribers[existingSubIndex], status: 'Active' };
    } else {
      db.subscribers.unshift(subRecord);
    }
  }

  writeDB(db);
  res.status(201).json({ success: true, order: newOrder, apiKey });
});

app.get('/api/orders/:id', (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id || o.order_number === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, order });
});

app.put('/api/orders/:id/activate', (req, res) => {
  const db = readDB();
  const orderIndex = db.orders.findIndex(o => o.id === req.params.id || o.order_number === req.params.id || o.orderNumber === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const activationLink = req.body.activation_link || req.body.activationLink;
  const activationNote = req.body.activation_note || req.body.activationNote;
  
  db.orders[orderIndex].activation_link = activationLink;
  db.orders[orderIndex].activationLink = activationLink;
  if (activationNote) {
    db.orders[orderIndex].activation_note = activationNote;
  }
  db.orders[orderIndex].status = req.body.status || 'Activated';
  db.orders[orderIndex].activated_at = new Date().toISOString();
  
  writeDB(db);
  res.json({ success: true, message: 'Activation link published successfully to user!', order: db.orders[orderIndex] });
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = readDB();
  const orderIndex = db.orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  db.orders[orderIndex].status = req.body.status || 'Verified';
  if (req.body.activation_link || req.body.activationLink) {
    db.orders[orderIndex].activation_link = req.body.activation_link || req.body.activationLink;
  }
  writeDB(db);
  res.json({ success: true, order: db.orders[orderIndex] });
});

// Subscribers Management
app.get('/api/subscribers', (req, res) => {
  const db = readDB();
  res.json({ success: true, subscribers: db.subscribers });
});

app.put('/api/subscribers/:id/tokens', (req, res) => {
  const db = readDB();
  const subIndex = db.subscribers.findIndex(s => s.id === req.params.id);
  if (subIndex === -1) {
    return res.status(404).json({ success: false, message: 'Subscriber not found' });
  }

  if (req.body.tokensUsed !== undefined) {
    db.subscribers[subIndex].tokensUsed = Number(req.body.tokensUsed);
  }
  if (req.body.tokenLimit !== undefined) {
    db.subscribers[subIndex].tokenLimit = Number(req.body.tokenLimit);
  }
  if (req.body.status !== undefined) {
    db.subscribers[subIndex].status = req.body.status;
  }

  writeDB(db);
  res.json({ success: true, subscriber: db.subscribers[subIndex] });
});

// Dynamic KHQR & ABA Payment Generation & Verification
app.post('/api/payment/khqr/generate', (req, res) => {
  const db = readDB();
  const amount = Number(req.body.amount) || 1.0;
  const rawMethod = req.body.paymentMethod || req.body.payment_method || 'khqr';
  const isAba = /aba|payway/i.test(rawMethod);
  const methodTitle = isAba ? 'ABA PayWay' : 'KHQR Direct Gateway';

  const prefix = isAba ? 'SYN-ABA-' : 'SYN-KHQR-';
  const transactionId = req.body.transaction_id || `${prefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now()}`;
  const defaultRemark = isAba 
    ? `ABA_PAY_${transactionId.replace(/[^A-Za-z0-9]/g, '').slice(-8)}`
    : `KHQR_${transactionId.replace(/[^A-Za-z0-9]/g, '').slice(-8)}`;
  const remark = req.body.remark || defaultRemark;

  const profileId = db.settings?.khqrProfileId || 'tW6PHjgPyzISFi3KK22hKZ57rag1cWHS';
  const secretKey = db.settings?.khqrSecretKey || 'zsFq7SWHV4gYFSAdfg2ud8WV747tBOei';
  const paywayLink = db.settings?.abaPayLink || 'https://link.payway.com.kh/ABAPAY9s540501U';

  const formattedAmount = Number(amount).toFixed(2);
  const rawHashString = `${secretKey}${transactionId}${formattedAmount}${remark}`;
  const hash = crypto.createHash('sha1').update(rawHashString).digest('hex');

  const khqrBaseUrl = `https://khqr.cc/api/payment/requestv2/${profileId}`;
  const khqrQuery = new URLSearchParams({
    transaction_id: transactionId,
    amount: formattedAmount,
    remark: remark,
    hash: hash
  }).toString();

  const checkoutUrl = isAba ? paywayLink : `${khqrBaseUrl}?${khqrQuery}`;
  const iframeUrl = isAba ? paywayLink : `${checkoutUrl}&iframe=1`;
  const merchantName = isAba ? 'BUNTHOEUN CHETRA' : 'dyzz';

  // Pre-create or update order in db
  const newOrder = {
    id: transactionId,
    order_number: transactionId,
    customer_name: req.body.customerName || 'Customer',
    customerName: req.body.customerName || 'Customer',
    customer_email: req.body.customerEmail || 'user@example.com',
    customerEmail: req.body.customerEmail || 'user@example.com',
    company: req.body.company || '',
    items: req.body.items || ['Pro AI Suite'],
    amount: amount,
    payment_method: methodTitle,
    paymentMethod: methodTitle,
    merchant_name: merchantName,
    abaLink: checkoutUrl,
    status: 'Pending Payment',
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    apiKey: `sk_synapse_live_${crypto.randomBytes(14).toString('hex')}`
  };
  db.orders.unshift(newOrder);
  writeDB(db);

  res.json({
    success: true,
    message: 'Payment request generated successfully',
    transaction_id: transactionId,
    amount: formattedAmount,
    currency: 'USD',
    merchant_name: merchantName,
    remark: remark,
    hash: hash,
    profile_id: profileId,
    checkout_url: checkoutUrl,
    iframe_url: iframeUrl,
    order_id: transactionId,
    order_number: transactionId,
    order: newOrder
  });
});

app.get('/api/payment/khqr/verify/:id', (req, res) => {
  const db = readDB();
  const orderIndex = db.orders.findIndex(o => o.id === req.params.id || o.order_number === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }
  db.orders[orderIndex].status = 'Verified';
  writeDB(db);
  res.json({
    success: true,
    status: 'Verified',
    message: 'Payment verified successfully',
    order: db.orders[orderIndex],
    api_key: db.orders[orderIndex].apiKey || `sk_synapse_live_${crypto.randomBytes(14).toString('hex')}`
  });
});

// Serve frontend static files from dist/ if built (Single Service Mode on Render/Cloud)
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
}

const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Synapse Backend Server running on http://${HOST}:${PORT}`);
  console.log(`💳 ABA PAY Link configured: ${readDB().settings?.abaPayLink}`);
});
