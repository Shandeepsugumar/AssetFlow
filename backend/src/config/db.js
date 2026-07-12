/**
 * ============================================================
 * AssetFlow — Database Connection (PostgreSQL via pg)
 * ============================================================
 * Exports a single Pool instance for use across the entire app.
 * All queries should use parameterized SQL ($1, $2...) — never
 * concatenate user input into query strings.
 *
 * Usage:
 *   const db = require('../config/db');
 *   const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 * ============================================================
 */

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const isSsl = connectionString && (connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || process.env.NODE_ENV === 'production');

const pool = new Pool({
  connectionString,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log connection events in development
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
