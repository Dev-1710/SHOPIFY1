const crypto = require('node:crypto');
const db = require('./db');

// Same rule as the frontend: 6+ chars, upper, lower, digit, symbol
const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
const isStrong = (p) => typeof p === 'string' && STRONG.test(p);

// scrypt = salted, slow hash (safer than plain SHA-256 used in the frontend)
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64);
  return crypto.timingSafeEqual(expected, actual);
}

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const WEEK = 7 * 24 * 3600 * 1000;

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?,?,?)')
    .run(sha(token), userId, Date.now() + WEEK);
  return token;
}
function destroySession(token) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token));
}
function userFromToken(token) {
  if (!token) return null;
  const row = db.prepare(`SELECT u.id, u.username, u.email, u.role, s.expires_at
    FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`).get(sha(token));
  if (!row) return null;
  if (row.expires_at < Date.now()) { destroySession(token); return null; }
  return { id: row.id, username: row.username, email: row.email, role: row.role };
}

module.exports = { isStrong, hashPassword, verifyPassword, createSession, destroySession, userFromToken };
