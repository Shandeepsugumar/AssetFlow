/**
 * ============================================================
 * AssetFlow — Database Connection (PostgreSQL via pg)
 * ============================================================
 * Exports a single Pool instance for use across the entire app.
 * All queries should use parameterized SQL ($1, $2...) — never
 * concatenate user input into query strings.
 *
 * Note: The `pg` npm package does NOT support the
 * `channel_binding` query parameter used by some Neon URLs.
 * We strip it automatically so you can paste the raw Neon URL
 * into Render's environment variables without modification.
 *
 * Usage:
 *   const db = require('../config/db');
 *   const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 * ============================================================
 */

const { Pool } = require('pg');
require('dotenv').config();

// Strip unsupported query params (channel_binding) that Neon adds
// but that the pg driver does not understand, causing silent crashes.
function sanitizeDatabaseUrl(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('channel_binding');
    return parsed.toString();
  } catch {
    // Not a valid URL — return as-is and let pg report the real error
    return url;
  }
}

const rawUrl = process.env.DATABASE_URL;
const connectionString = sanitizeDatabaseUrl(rawUrl);

const isProduction = process.env.NODE_ENV === 'production';
const isSsl =
  connectionString &&
  (connectionString.includes('sslmode=require') ||
    connectionString.includes('neon.tech') ||
    isProduction);

const pool = new Pool({
  connectionString,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log connection events for diagnostics
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DB] New client connected to pool.');
  }
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected database pool error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
