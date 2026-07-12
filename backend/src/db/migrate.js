/**
 * ============================================================
 * AssetFlow — Database Migration Runner
 * ============================================================
 * Reads and executes schema.sql against the configured database.
 * Usage: npm run db:migrate
 * ============================================================
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('../config/db');

async function migrate() {
  console.log('🔄 Running database migration...');

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await db.query(sql);

    console.log('✅ Database migration completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

migrate();
