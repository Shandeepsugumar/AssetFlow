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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log connection events in development
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
