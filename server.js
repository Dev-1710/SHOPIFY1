// Online Clothing Store - backend (plain Node.js, zero npm dependencies)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');
const auth = require('./auth');
const seed = require('./seed');

try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch {}
seed();

const PORT = process.env.PORT || 3000;
const CORS = process.env.CORS_ORIGIN || '*';
const STATUSES = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
const COUPONS = { SAVE10: 10, WELCOME20: 20 };          // percent off
const FREE_DELIVERY_ABOVE = 999, DELIVERY_CHARGE = 49;

// ---------- helpers ----------
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const bad = (m) => new HttpError(400, m);
const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CORS,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  });
  res.end(JSON.stringify(body));
};
async function readBody(req) {
  let raw = '';
  for await (const c of req) { raw += c; if (raw.length > 1e6) throw bad('Body too large'); }
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw bad('Invalid JSON'); }
}
const created = (body) => ({ __status: 201, body });
const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// crude login rate limit: 10 tries / 5 min per IP
const attempts = new Map();
function limitLogin(ip) {
  const now = Date.now();
  const list = (attempts.get(ip) || []).filter((t) => now - t < 300000);
  if (list.length >= 10) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
  list.push(now); attempts.set(ip, list);
}

function requireUser(ctx) { if (!ctx.user) throw new HttpError(401, 'Please login first'); return ctx.user; }
function requireAdmin(ctx) {
  const u = requireUser(ctx);
  if (u.role !== 'admin') throw new HttpError(403, 'Admin only');
  return u;
}

function cartLines(userId) {
  return db.prepare(`SELECT c.id, c.product_id AS productId, p.name, p.price, c.size, c.qty
    FROM cart c JOIN products p ON p.id = c.product_id WHERE c.user_id = ? ORDER BY c.id`).all(userId);
}
function totals(lines, couponCode) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const code = str(couponCode).toUpperCase();
  if (code && !(code in COUPONS)) throw bad('Invalid coupon');
  const discount = code ? Math.round((subtotal * COUPONS[code]) / 100) : 0;
  const after = subtotal - discount;
  const delivery = lines.length === 0 || after > FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  return { subtotal, discount, delivery, total: after + delivery, coupon: code || null };
}

// ---------- routes: [method, pattern, handler] ----------
const routes = [];
const route = (method, pattern, handler) =>
  routes.push([method, new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler]);

route('GET', '/api/health', () => ({ ok: true }));

// --- auth ---
route('POST', '/api/auth/signup', async (ctx) => {
  const b = ctx.body;
  const username = str(b.username, 30), email = str(b.email, 100).toLowerCase();
  if (username.length < 3) throw bad('Username must be at least 3 characters');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw bad('Enter a valid email');
  if (!auth.isStrong(b.password)) throw bad('Password needs 6+ chars with upper, lower, number and symbol');
  if (db.prepare('SELECT 1 FROM users WHERE username = ? OR email = ?').get(username, email))
    throw new HttpError(409, 'Username or email already registered');
  const r = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?,?,?)')
    .run(username, email, auth.hashPassword(b.password));
  const token = auth.createSession(Number(r.lastInsertRowid));
  return created({ token, user: { id: Number(r.lastInsertRowid), username, email, role: 'customer' } });
});
route('POST', '/api/auth/login', async (ctx) => {
  limitLogin(ctx.ip);
  const username = str(ctx.body.username, 100);
  const row = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username.toLowerCase());
  if (!row || typeof ctx.body.password !== 'string' || !auth.verifyPassword(ctx.body.password, row.password_hash))
    throw new HttpError(401, 'Wrong username or password');
  const token = auth.createSession(row.id);
  return { token, user: { id: row.id, username: row.username, email: row.email, role: row.role } };
});
route('GET', '/api/auth/me', (ctx) => ({ user: requireUser(ctx) }));
route('POST', '/api/auth/logout', (ctx) => { if (ctx.token) auth.destroySession(ctx.token); return { ok: true }; });

// --- products ---
route('GET', '/api/products', (ctx) => {
  const { search = '', category = '', sort = '' } = ctx.query;
  const where = [], args = [];
  if (search) { where.push('(name LIKE ? OR type LIKE ?)'); args.push(`%${search}%`, `%${search}%`); }
  if (category && category !== 'All') { where.push('category = ?'); args.push(category); }
  const order = sort === 'low' ? 'price ASC' : sort === 'high' ? 'price DESC' : 'id ASC';
  return db.prepare(`SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order}`).all(...args);
});
route('POST', '/api/products', (ctx) => {
  requireAdmin(ctx);
  const b = ctx.body, name = str(b.name), category = str(b.category, 50), type = str(b.type, 50);
  const price = Number(b.price);
  if (!name || !category) throw bad('Name and category are required');
  if (!Number.isInteger(price) || price <= 0) throw bad('Price must be a positive whole number');
  const r = db.prepare('INSERT INTO products (name, category, price, type, description) VALUES (?,?,?,?,?)')
    .run(name, category, price, type, str(b.description, 500));
  return created(db.prepare('SELECT * FROM products WHERE id = ?').get(r.lastInsertRowid));
});
route('DELETE', '/api/products/:id', (ctx) => {
  requireAdmin(ctx);
  const r = db.prepare('DELETE FROM products WHERE id = ?').run(ctx.params.id);
  if (!r.changes) throw new HttpError(404, 'Product not found');
  return { ok: true };
});

// --- cart (login required) ---
route('GET', '/api/cart', (ctx) => {
  const lines = cartLines(requireUser(ctx).id);
  return { items: lines, ...totals(lines, ctx.query.coupon) };
});
route('POST', '/api/cart', (ctx) => {
  const u = requireUser(ctx);
  const productId = Number(ctx.body.productId), qty = Number(ctx.body.qty ?? 1);
  const size = str(ctx.body.size, 3).toUpperCase() || 'M';
  if (!['S', 'M', 'L', 'XL'].includes(size)) throw bad('Size must be S, M, L or XL');
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw bad('Quantity must be 1-20');
  if (!db.prepare('SELECT 1 FROM products WHERE id = ?').get(productId)) throw new HttpError(404, 'Product not found');
  db.prepare(`INSERT INTO cart (user_id, product_id, size, qty) VALUES (?,?,?,?)
    ON CONFLICT(user_id, product_id, size) DO UPDATE SET qty = MIN(qty + excluded.qty, 20)`).run(u.id, productId, size, qty);
  return created({ items: cartLines(u.id) });
});
route('PATCH', '/api/cart/:id', (ctx) => {
  const u = requireUser(ctx), qty = Number(ctx.body.qty);
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw bad('Quantity must be 1-20');
  db.prepare('UPDATE cart SET qty = ? WHERE id = ? AND user_id = ?').run(qty, ctx.params.id, u.id);
  return { items: cartLines(u.id) };
});
route('DELETE', '/api/cart/:id', (ctx) => {
  const u = requireUser(ctx);
  db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(ctx.params.id, u.id);
  return { items: cartLines(u.id) };
});

// --- wishlist ---
route('GET', '/api/wishlist', (ctx) =>
  db.prepare('SELECT product_id AS productId FROM wishlist WHERE user_id = ?').all(requireUser(ctx).id).map((r) => r.productId));
route('POST', '/api/wishlist/:productId', (ctx) => {   // toggles heart on/off
  const u = requireUser(ctx), pid = Number(ctx.params.productId);
  if (!db.prepare('SELECT 1 FROM products WHERE id = ?').get(pid)) throw new HttpError(404, 'Product not found');
  const del = db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(u.id, pid);
  if (!del.changes) db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?,?)').run(u.id, pid);
  return { wished: !del.changes };
});

// --- coupons ---
route('POST', '/api/coupons/validate', (ctx) => {
  const code = str(ctx.body.code).toUpperCase();
  if (!(code in COUPONS)) throw bad('Invalid coupon');
  return { code, percent: COUPONS[code] };
});

// --- orders ---
route('POST', '/api/orders', (ctx) => {       // "Pay Now (demo)"
  const u = requireUser(ctx), b = ctx.body;
  const name = str(b.name, 80), phone = str(b.phone, 20), address = str(b.address, 300);
  if (!name || !address) throw bad('Name and address are required');
  if (!/^\d{10}$/.test(phone)) throw bad('Phone must be 10 digits');
  const lines = cartLines(u.id);
  if (!lines.length) throw bad('Cart is empty');
  const t = totals(lines, b.coupon);          // prices are recalculated on the server
  const id = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  db.exec('BEGIN');
  try {
    db.prepare(`INSERT INTO orders (id,user_id,items,subtotal,discount,delivery,total,coupon,name,phone,address)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(id, u.id, JSON.stringify(lines), t.subtotal, t.discount, t.delivery, t.total, t.coupon, name, phone, address);
    db.prepare('DELETE FROM cart WHERE user_id = ?').run(u.id);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return created({ orderId: id, ...t, status: 'Pending' });
});
const parseOrder = (o) => ({ ...o, items: JSON.parse(o.items) });
route('GET', '/api/orders', (ctx) =>
  db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, rowid DESC').all(requireUser(ctx).id).map(parseOrder));

// --- contact form (public) ---
route('POST', '/api/messages', (ctx) => {
  const name = str(ctx.body.name, 80), email = str(ctx.body.email, 100), message = str(ctx.body.message, 1000);
  if (!name || !message) throw bad('Name and message are required');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw bad('Enter a valid email');
  db.prepare('INSERT INTO messages (name,email,message) VALUES (?,?,?)').run(name, email, message);
  return created({ ok: true });
});

// --- admin ---
route('GET', '/api/admin/stats', (ctx) => {
  requireAdmin(ctx);
  const n = (sql) => db.prepare(sql).get().c;
  return {
    products: n('SELECT COUNT(*) c FROM products'),
    orders: n('SELECT COUNT(*) c FROM orders'),
    customers: n("SELECT COUNT(*) c FROM users WHERE role = 'customer'"),
    revenue: n("SELECT COALESCE(SUM(total),0) c FROM orders WHERE status != 'Cancelled'"),
  };
});
route('GET', '/api/admin/orders', (ctx) => {
  requireAdmin(ctx);
  return db.prepare(`SELECT o.*, u.username FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC, o.rowid DESC`).all().map(parseOrder);
});
route('PATCH', '/api/admin/orders/:id', (ctx) => {
  requireAdmin(ctx);
  if (!STATUSES.includes(ctx.body.status)) throw bad(`Status must be one of: ${STATUSES.join(', ')}`);
  const r = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(ctx.body.status, ctx.params.id);
  if (!r.changes) throw new HttpError(404, 'Order not found');
  return { ok: true, status: ctx.body.status };
});
route('GET', '/api/admin/customers', (ctx) => {
  requireAdmin(ctx);
  return db.prepare("SELECT id, username, email, created_at FROM users WHERE role = 'customer' ORDER BY id DESC").all();
});
route('GET', '/api/admin/messages', (ctx) => {
  requireAdmin(ctx);
  return db.prepare('SELECT * FROM messages ORDER BY id DESC').all();
});

// ---------- server ----------
const PUBLIC = path.join(__dirname, '..', 'public');   // optional: drop your frontend here
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (!url.pathname.startsWith('/api/')) {            // static frontend
    const file = path.join(PUBLIC, url.pathname === '/' ? 'index.html' : url.pathname);
    if (file.startsWith(PUBLIC) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      return fs.createReadStream(file).pipe(res);
    }
    return send(res, 404, { error: 'Not found' });
  }
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || null;
    for (const [method, re, handler] of routes) {
      const m = method === req.method && re.exec(url.pathname);
      if (!m) continue;
      const ctx = {
        params: m.groups || {}, query: Object.fromEntries(url.searchParams), token,
        user: auth.userFromToken(token), ip: req.socket.remoteAddress,
        body: ['POST', 'PATCH'].includes(req.method) ? await readBody(req) : {},
      };
      const out = await handler(ctx);
      return out && out.__status ? send(res, out.__status, out.body) : send(res, 200, out);
    }
    send(res, 404, { error: 'Route not found' });
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, { error: e.message });
    console.error(e);
    send(res, 500, { error: 'Server error' });
  }
});
server.listen(PORT, () => console.log(`Store API running at http://localhost:${PORT}`));
module.exports = server;
