// Simple Express + SQLite backend for contact submissions and analytics
// Run: npm run start

const path = require('path');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const chalk = require('chalk');

const PORT = process.env.PORT || 3001;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-admin-token';
const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-auth-secret-change-me';
const ALLOW_ADMIN_BACKDOOR = (process.env.ALLOW_ADMIN_BACKDOOR || 'false') === 'true';

const app = express();
// honor X-Forwarded-For when behind proxies (Vercel/Render/NGINX)
app.set('trust proxy', true);
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

// Database setup
const dbFile = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL;');
  console.log(chalk.blue('🔧 Initializing database...'));
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    page_path TEXT,
    page_title TEXT,
    meta TEXT,
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    accept_language TEXT,
    forwarded_for TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add new columns to existing installations (ignore errors if they already exist)
  const addCols = [
    'ALTER TABLE events ADD COLUMN ip_address TEXT',
    'ALTER TABLE events ADD COLUMN referrer TEXT',
    'ALTER TABLE events ADD COLUMN accept_language TEXT',
    'ALTER TABLE events ADD COLUMN forwarded_for TEXT'
  ];
  addCols.forEach(sql => db.run(sql, () => {}));
  console.log(chalk.green('✅ Database initialized successfully!'));
});

// Auth utils (no external deps)
function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify(payload));
  const data = `${h}.${p}`;
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sig}`;
}
function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (expected !== s) return null;
  try { return JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); } catch { return null; }
}
function hashPassword(password, salt = crypto.randomBytes(16)) {
  const N = 16384, r = 8, p = 1, keylen = 64;
  const derived = crypto.scryptSync(password, salt, keylen, { N, r, p });
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}
function verifyPassword(password, stored) {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'hex');
  const hash = parts[2];
  const verify = hashPassword(password, salt);
  return verify === stored;
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.post('/api/contacts', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  const stmt = db.prepare('INSERT INTO contacts(name, email, message) VALUES (?, ?, ?)');
  stmt.run(name.toString().slice(0, 200), email.toString().slice(0, 200), message.toString().slice(0, 2000), function(err) {
    if (err) return res.status(500).json({ ok: false, error: 'DB insert failed' });
    res.json({ ok: true, id: this.lastID });
  });
});

app.get('/api/contacts', (req, res) => {
  const token = req.get('x-admin-token') || req.query.token;
  if (token !== ADMIN_TOKEN) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  db.all(`SELECT * FROM contacts ORDER BY id DESC LIMIT ?`, [limit], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: 'DB read failed' });
    res.json({ ok: true, rows });
  });
});

app.post('/api/events', (req, res) => {
  const { eventName, pagePath, pageTitle, meta } = req.body || {};
  if (!eventName) return res.status(400).json({ ok: false, error: 'eventName required' });
  const ua = req.get('user-agent') || '';
  const ref = req.get('referer') || '';
  const al = req.get('accept-language') || '';
  const fwd = req.get('x-forwarded-for') || '';
  const ip = (req.ip || '').toString();
  const metaStr = meta ? JSON.stringify(meta).slice(0, 4000) : null;
  const stmt = db.prepare('INSERT INTO events(event_name, page_path, page_title, meta, user_agent, ip_address, referrer, accept_language, forwarded_for) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(
    eventName.toString().slice(0, 100),
    (pagePath || '').toString().slice(0, 300),
    (pageTitle || '').toString().slice(0, 300),
    metaStr,
    ua.slice(0, 500),
    ip.slice(0, 100),
    ref.slice(0, 500),
    al.slice(0, 200),
    fwd.slice(0, 300),
    function(err) {
    if (err) return res.status(500).json({ ok: false, error: 'DB insert failed' });
    res.json({ ok: true, id: this.lastID });
  });
});

app.get('/api/events', (req, res) => {
  const token = req.get('x-admin-token') || req.query.token;
  if (token !== ADMIN_TOKEN) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
  db.all(`SELECT * FROM events ORDER BY id DESC LIMIT ?`, [limit], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: 'DB read failed' });
    res.json({ ok: true, rows });
  });
});

// Auth: Register
app.post('/api/register', (req, res) => {
  const { email, password, fullName, phone } = req.body || {};
  if (!email || !password || !fullName) return res.status(400).json({ ok: false, error: 'email, fullName, password required' });
  if (typeof email !== 'string' || !email.includes('@')) return res.status(400).json({ ok: false, error: 'invalid email' });
  if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ ok: false, error: 'password too short' });
  const stmt = db.prepare('INSERT INTO users(email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)');
  const passHash = hashPassword(password);
  stmt.run(email.trim().toLowerCase().slice(0, 200), passHash, fullName.toString().slice(0, 200), phone ? phone.toString().slice(0, 50) : null, function(err) {
    if (err) {
      const msg = (err && err.message && err.message.includes('UNIQUE')) ? 'email exists' : 'DB insert failed';
      return res.status(400).json({ ok: false, error: msg });
    }
    res.json({ ok: true, id: this.lastID });
  });
});

// Auth: Login (with optional admin/admin dev override)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: 'email and password required' });

  if (ALLOW_ADMIN_BACKDOOR && email === 'admin' && password === 'admin') {
    const token = signToken({ sub: 'admin', role: 'admin', iat: Math.floor(Date.now() / 1000) });
    return res.json({ ok: true, token, user: { id: 0, email: 'admin', fullName: 'Administrator', role: 'admin' } });
  }

  const q = db.prepare('SELECT id, email, password_hash, full_name FROM users WHERE email = ?');
  q.get(email.trim().toLowerCase(), (err, row) => {
    if (err || !row) return res.status(401).json({ ok: false, error: 'invalid credentials' });
    if (!verifyPassword(password, row.password_hash)) return res.status(401).json({ ok: false, error: 'invalid credentials' });
    const token = signToken({ sub: row.id, role: 'user', iat: Math.floor(Date.now() / 1000) });
    res.json({ ok: true, token, user: { id: row.id, email: row.email, fullName: row.full_name, role: 'user' } });
  });
});

// Auth: Me
app.get('/api/me', (req, res) => {
  const auth = req.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ ok: false, error: 'unauthorized' });
  if (payload.sub === 'admin') return res.json({ ok: true, user: { id: 0, email: 'admin', fullName: 'Administrator', role: 'admin' } });
  const q = db.prepare('SELECT id, email, full_name FROM users WHERE id = ?');
  q.get(payload.sub, (err, row) => {
    if (err || !row) return res.status(401).json({ ok: false, error: 'unauthorized' });
    res.json({ ok: true, user: { id: row.id, email: row.email, fullName: row.full_name, role: 'user' } });
  });
});

app.listen(PORT, () => {
  console.log(chalk.green.bold('🚀 API Server Started!'));
  console.log(chalk.cyan(`📡 Listening on: ${chalk.yellow.bold(`http://localhost:${PORT}`)}`));
  console.log(chalk.magenta('📊 Available endpoints:'));
  console.log(chalk.gray('  GET  /api/health'));
  console.log(chalk.gray('  POST /api/contacts'));
  console.log(chalk.gray('  GET  /api/contacts (admin)'));
  console.log(chalk.gray('  POST /api/events'));
  console.log(chalk.gray('  GET  /api/events (admin)'));
  console.log(chalk.gray('  POST /api/register'));
  console.log(chalk.gray('  POST /api/login'));
  console.log(chalk.gray('  GET  /api/me'));
});





