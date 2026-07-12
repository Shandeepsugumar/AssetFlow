/**
 * ============================================================
 * AssetFlow — Database Seed Script
 * ============================================================
 * REAL WORKFLOW:
 *   1. Admin is the ONLY pre-created user.
 *   2. All other users sign up via /api/auth/signup → they
 *      become 'employee' automatically.
 *   3. Admin logs in → goes to Employee Directory →
 *      promotes any employee to Asset Manager or Dept Head.
 *
 * What this script seeds:
 *   ✅ 1 Admin account
 *   ✅ Sample departments (no heads assigned — Admin does that)
 *   ✅ Asset categories
 *   ✅ One welcome activity log entry
 *
 * Usage: npm run db:seed
 * ============================================================
 */

const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('../config/db');

const SALT_ROUNDS = 10;

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // ── 1. Admin Account ──────────────────────────────────
    // This is the ONLY pre-created user. Everyone else signs
    // up themselves and starts as an Employee.
    const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    const adminResult = await db.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'admin', true)
       ON CONFLICT (email) DO UPDATE
         SET name = EXCLUDED.name,
             password_hash = EXCLUDED.password_hash,
             role = 'admin',
             is_active = true
       RETURNING id`,
      ['Admin', 'admin@assetflow.com', adminPassword]
    );
    const adminId = adminResult.rows[0].id;
    console.log('  ✅ Admin created: admin@assetflow.com / admin123');

    // ── 2. Departments ────────────────────────────────────
    // Department heads are NOT assigned here.
    // Admin promotes an employee to Dept Head and then assigns
    // them via the Org Setup page.
    const departments = [
      { name: 'IT',              desc: 'Information Technology & Infrastructure' },
      { name: 'Human Resources', desc: 'People Operations & Talent Management' },
      { name: 'Finance',         desc: 'Financial Planning & Accounting' },
      { name: 'Marketing',       desc: 'Brand Strategy & Digital Marketing' },
      { name: 'Operations',      desc: 'Business Operations & Logistics' },
    ];

    for (const dept of departments) {
      await db.query(
        `INSERT INTO departments (name, description, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT DO NOTHING`,
        [dept.name, dept.desc]
      );
    }
    console.log('  ✅ Departments seeded (no heads assigned — Admin decides)');

    // ── 3. Asset Categories ───────────────────────────────
    const categories = [
      {
        name: 'Electronics',
        desc: 'Laptops, monitors, phones, and other electronic devices',
        fields: [
          { key: 'Warranty Period', type: 'text', required: true },
          { key: 'Serial Number',   type: 'text', required: true },
          { key: 'Operating System', type: 'text', required: false },
        ],
      },
      {
        name: 'Furniture',
        desc: 'Desks, chairs, cabinets, and office furniture',
        fields: [
          { key: 'Material', type: 'text', required: false },
          { key: 'Color',    type: 'text', required: false },
        ],
      },
      {
        name: 'Vehicles',
        desc: 'Company cars, vans, and transport vehicles',
        fields: [
          { key: 'License Plate',    type: 'text', required: true },
          { key: 'Insurance Expiry', type: 'text', required: true },
          { key: 'Fuel Type',        type: 'text', required: true },
        ],
      },
      {
        name: 'Office Equipment',
        desc: 'Printers, projectors, scanners, and shared equipment',
        fields: [
          { key: 'Model Number', type: 'text', required: true },
        ],
      },
      {
        name: 'Safety Equipment',
        desc: 'Fire extinguishers, first aid kits, safety gear',
        fields: [
          { key: 'Inspection Date',     type: 'text', required: true },
          { key: 'Certification Number', type: 'text', required: true },
          { key: 'Expiry Date',         type: 'text', required: true },
        ],
      },
    ];

    for (const cat of categories) {
      await db.query(
        `INSERT INTO asset_categories (name, description, custom_fields)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [cat.name, cat.desc, JSON.stringify(cat.fields)]
      );
    }
    console.log('  ✅ Asset categories seeded');

    // ── 4. Welcome Activity Log ───────────────────────────
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type)
       VALUES ($1, $2, 'system')`,
      [adminId, 'AssetFlow system initialized by Admin']
    );
    console.log('  ✅ Welcome activity log created');

    // ── Summary ───────────────────────────────────────────
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ ADMIN LOGIN:');
    console.log('     Email:    admin@assetflow.com');
    console.log('     Password: admin123');
    console.log('\n  ℹ️  HOW IT WORKS:');
    console.log('     1. Other users sign up at /signup → role = Employee');
    console.log('     2. Admin logs in → Employee Directory');
    console.log('     3. Admin promotes users to Asset Manager / Dept Head');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

seed();
