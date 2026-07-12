/**
 * ============================================================
 * AssetFlow — Database Seed Script
 * ============================================================
 * Creates a default Admin user so the app is usable on first run.
 *
 * Default Admin credentials:
 *   Email:    admin@assetflow.com
 *   Password: admin123
 *
 * Also seeds sample departments, categories, and employees
 * for demonstration purposes.
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
    // ── 1. Default Admin User ─────────────────────────────
    const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    const adminResult = await db.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['Rajesh Kumar', 'admin@assetflow.com', adminPassword, 'admin']
    );
    const adminId = adminResult.rows[0].id;
    console.log('  ✅ Admin user created (admin@assetflow.com / admin123)');

    // ── 2. Sample Departments ─────────────────────────────
    const depts = [
      { name: 'IT', desc: 'Information Technology & Infrastructure' },
      { name: 'Human Resources', desc: 'People Operations & Talent Management' },
      { name: 'Finance', desc: 'Financial Planning & Accounting' },
      { name: 'Marketing', desc: 'Brand Strategy & Digital Marketing' },
      { name: 'Operations', desc: 'Business Operations & Logistics' },
    ];
    const deptIds = {};
    for (const dept of depts) {
      const res = await db.query(
        `INSERT INTO departments (name, description, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [dept.name, dept.desc]
      );
      if (res.rows.length > 0) {
        deptIds[dept.name] = res.rows[0].id;
      }
    }
    console.log('  ✅ Departments seeded');

    // ── 3. Sample Users ───────────────────────────────────
    const userPassword = await bcrypt.hash('password123', SALT_ROUNDS);
    const sampleUsers = [
      { name: 'Anita Sharma', email: 'manager@assetflow.com', role: 'asset_manager', dept: 'Operations' },
      { name: 'Vikram Patel', email: 'head@assetflow.com', role: 'department_head', dept: 'IT' },
      { name: 'Priya Shah', email: 'employee@assetflow.com', role: 'employee', dept: 'Marketing' },
      { name: 'Suresh Reddy', email: 'suresh.reddy@assetflow.com', role: 'employee', dept: 'IT' },
      { name: 'Meera Nair', email: 'meera.nair@assetflow.com', role: 'department_head', dept: 'Human Resources' },
      { name: 'Arjun Desai', email: 'arjun.desai@assetflow.com', role: 'employee', dept: 'Finance' },
      { name: 'Kavita Joshi', email: 'kavita.joshi@assetflow.com', role: 'department_head', dept: 'Finance' },
      { name: 'Rohit Mehta', email: 'rohit.mehta@assetflow.com', role: 'employee', dept: 'IT' },
    ];

    for (const u of sampleUsers) {
      const deptId = deptIds[u.dept] || null;
      await db.query(
        `INSERT INTO users (name, email, password_hash, role, department_id, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (email) DO NOTHING`,
        [u.name, u.email, userPassword, u.role, deptId]
      );
    }
    console.log('  ✅ Sample users seeded (all with password: password123)');

    // Update admin's department
    if (deptIds['IT']) {
      await db.query('UPDATE users SET department_id = $1 WHERE id = $2', [deptIds['IT'], adminId]);
    }

    // ── 4. Assign Department Heads ────────────────────────
    // Vikram → IT, Meera → HR, Kavita → Finance
    const headAssignments = [
      { dept: 'IT', email: 'head@assetflow.com' },
      { dept: 'Human Resources', email: 'meera.nair@assetflow.com' },
      { dept: 'Finance', email: 'kavita.joshi@assetflow.com' },
    ];
    for (const ha of headAssignments) {
      if (deptIds[ha.dept]) {
        const userRes = await db.query('SELECT id FROM users WHERE email = $1', [ha.email]);
        if (userRes.rows.length > 0) {
          await db.query('UPDATE departments SET department_head_id = $1 WHERE id = $2', [
            userRes.rows[0].id,
            deptIds[ha.dept],
          ]);
        }
      }
    }
    console.log('  ✅ Department heads assigned');

    // ── 5. Engineering dept (child of IT) ─────────────────
    if (deptIds['IT']) {
      const engRes = await db.query(
        `INSERT INTO departments (name, description, parent_department_id, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        ['Engineering', 'Product Engineering & Development', deptIds['IT']]
      );
      if (engRes.rows.length > 0) {
        // Assign Vikram as head of Engineering too
        const vikram = await db.query("SELECT id FROM users WHERE email = 'head@assetflow.com'");
        if (vikram.rows.length > 0) {
          await db.query('UPDATE departments SET department_head_id = $1 WHERE id = $2', [
            vikram.rows[0].id,
            engRes.rows[0].id,
          ]);
        }
      }
    }
    console.log('  ✅ Engineering sub-department created');

    // ── 6. Asset Categories ───────────────────────────────
    const categories = [
      {
        name: 'Electronics',
        desc: 'Laptops, monitors, phones, and other electronic devices',
        fields: [
          { key: 'Warranty Period', type: 'text', required: true },
          { key: 'Serial Number Pattern', type: 'text', required: true },
          { key: 'Operating System', type: 'text', required: false },
        ],
      },
      {
        name: 'Furniture',
        desc: 'Desks, chairs, cabinets, and office furniture',
        fields: [
          { key: 'Material', type: 'text', required: false },
          { key: 'Color', type: 'text', required: false },
        ],
      },
      {
        name: 'Vehicles',
        desc: 'Company cars, vans, and transport vehicles',
        fields: [
          { key: 'License Plate', type: 'text', required: true },
          { key: 'Insurance Expiry', type: 'text', required: true },
          { key: 'Fuel Type', type: 'text', required: true },
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
          { key: 'Inspection Date', type: 'text', required: true },
          { key: 'Certification Number', type: 'text', required: true },
          { key: 'Expiry Date', type: 'text', required: true },
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

    // ── 7. Sample Activity Logs ───────────────────────────
    const logs = [
      'Laptop AF-0114 allocated to Priya Shah',
      'Conference Room A booked by Marketing for Jul 15',
      'Printer PR-0023 maintenance request raised by Arjun Desai',
      'Monitor MN-0089 transferred from IT to Engineering',
      'Vehicle VH-003 returned by Suresh Reddy',
      'New category "Safety Equipment" created by Admin',
    ];
    for (const log of logs) {
      await db.query(
        `INSERT INTO activity_logs (user_id, action, entity_type)
         VALUES ($1, $2, $3)`,
        [adminId, log, 'system']
      );
    }
    console.log('  ✅ Activity logs seeded');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin:           admin@assetflow.com / admin123');
    console.log('   Asset Manager:   manager@assetflow.com / password123');
    console.log('   Dept Head:       head@assetflow.com / password123');
    console.log('   Employee:        employee@assetflow.com / password123');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

seed();
