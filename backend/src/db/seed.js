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
    // ── 1. Departments ────────────────────────────────────
    const departments = [
      { name: 'IT',              desc: 'Information Technology & Infrastructure' },
      { name: 'Human Resources', desc: 'People Operations & Talent Management' },
      { name: 'Finance',         desc: 'Financial Planning & Accounting' },
      { name: 'Marketing',       desc: 'Brand Strategy & Digital Marketing' },
      { name: 'Operations',      desc: 'Business Operations & Logistics' },
      { name: 'Engineering',     desc: 'Product Engineering & Development' },
    ];

    const deptIds = {};
    for (const dept of departments) {
      let existing = await db.query('SELECT id FROM departments WHERE name = $1', [dept.name]);
      if (existing.rows.length > 0) {
        deptIds[dept.name] = existing.rows[0].id;
      } else {
        const res = await db.query(
          `INSERT INTO departments (name, description, is_active)
           VALUES ($1, $2, true)
           RETURNING id`,
          [dept.name, dept.desc]
        );
        deptIds[dept.name] = res.rows[0].id;
      }
    }

    // Update Engineering parent_department_id to IT
    if (deptIds['Engineering'] && deptIds['IT']) {
      await db.query(
        'UPDATE departments SET parent_department_id = $1 WHERE id = $2',
        [deptIds['IT'], deptIds['Engineering']]
      );
    }
    console.log('  ✅ Departments seeded');

    // ── 2. Users (Default Credentials) ────────────────────
    // Clean up test accounts from previous API test runs
    await db.query("DELETE FROM users WHERE email LIKE 'testuser%' OR email = 'hacker@test.com'");

    const usersToSeed = [
      {
        name: 'Admin',
        email: 'admin@assetflow.com',
        password: 'admin123',
        role: 'admin',
        deptName: 'IT'
      },
      {
        name: 'Asset Manager',
        email: 'manager@assetflow.com',
        password: 'password123',
        role: 'asset_manager',
        deptName: 'Operations'
      },
      {
        name: 'Department Head',
        email: 'head@assetflow.com',
        password: 'password123',
        role: 'department_head',
        deptName: 'Engineering'
      },
      {
        name: 'Employee',
        email: 'employee@assetflow.com',
        password: 'password123',
        role: 'employee',
        deptName: 'Marketing'
      }
    ];

    const userIds = {};
    for (const u of usersToSeed) {
      const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
      const deptId = deptIds[u.deptName] || null;

      const res = await db.query(
        `INSERT INTO users (name, email, password_hash, role, department_id, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (email) DO UPDATE
           SET name = EXCLUDED.name,
               password_hash = EXCLUDED.password_hash,
               role = EXCLUDED.role,
               department_id = EXCLUDED.department_id,
               is_active = true
         RETURNING id`,
        [u.name, u.email.toLowerCase().trim(), hashedPassword, u.role, deptId]
      );
      userIds[u.email] = res.rows[0].id;
      console.log(`  ✅ User created/updated: ${u.email} / ${u.password} (Role: ${u.role})`);
    }

    // Assign department heads
    if (deptIds['IT'] && userIds['admin@assetflow.com']) {
      await db.query('UPDATE departments SET department_head_id = $1 WHERE id = $2', [userIds['admin@assetflow.com'], deptIds['IT']]);
    }
    if (deptIds['Operations'] && userIds['manager@assetflow.com']) {
      await db.query('UPDATE departments SET department_head_id = $1 WHERE id = $2', [userIds['manager@assetflow.com'], deptIds['Operations']]);
    }
    if (deptIds['Engineering'] && userIds['head@assetflow.com']) {
      await db.query('UPDATE departments SET department_head_id = $1 WHERE id = $2', [userIds['head@assetflow.com'], deptIds['Engineering']]);
    }
    console.log('  ✅ Department heads assigned');

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
      let existing = await db.query('SELECT id FROM asset_categories WHERE name = $1', [cat.name]);
      if (existing.rows.length === 0) {
        await db.query(
          `INSERT INTO asset_categories (name, description, custom_fields)
           VALUES ($1, $2, $3)`,
          [cat.name, cat.desc, JSON.stringify(cat.fields)]
        );
      }
    }
    console.log('  ✅ Asset categories seeded');

    // Fetch categories mapping to associate assets
    const categoryResult = await db.query('SELECT id, name FROM asset_categories');
    const catMap = {};
    categoryResult.rows.forEach(r => { catMap[r.name] = r.id; });

    // Seed sample assets
    const assetsToSeed = [
      {
        tag: 'AST-ROOM-A',
        name: 'Conference Room Alpha',
        catName: 'Office Equipment',
        deptName: 'Operations',
        location: 'HQ Floor 3, Room 302',
        isBookable: true,
        status: 'Available'
      },
      {
        tag: 'AST-VEH-01',
        name: 'Tesla Model 3 (Company Car)',
        catName: 'Vehicles',
        deptName: 'IT',
        location: 'Basement Parking Slot 14',
        isBookable: true,
        status: 'Available'
      },
      {
        tag: 'AST-PROJ-05',
        name: 'Epson 4K Laser Projector',
        catName: 'Office Equipment',
        deptName: 'Marketing',
        location: 'Marketing Storage Box 4',
        isBookable: true,
        status: 'Available'
      },
      {
        tag: 'AST-LAP-99',
        name: 'MacBook Pro 16" (M3 Max)',
        catName: 'Electronics',
        deptName: 'Engineering',
        location: 'Assigned to head',
        isBookable: false,
        status: 'Available'
      },
      {
        tag: 'AST-PRN-01',
        name: 'HP LaserJet Enterprise Printer',
        catName: 'Office Equipment',
        deptName: 'Finance',
        location: 'Main Finance Office Hallway',
        isBookable: false,
        status: 'Available'
      }
    ];

    for (const asset of assetsToSeed) {
      const catId = catMap[asset.catName] || null;
      const deptId = deptIds[asset.deptName] || null;
      
      // Check if tag already exists
      const existingAsset = await db.query('SELECT id FROM assets WHERE asset_tag = $1', [asset.tag]);
      if (existingAsset.rows.length === 0) {
        await db.query(
          `INSERT INTO assets (asset_tag, name, category_id, serial_number, acquisition_date, acquisition_cost, condition, location, status, is_bookable, department_id)
           VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '6 months', 1500.00, 'Good', $5, $6, $7, $8)`,
          [asset.tag, asset.name, catId, 'SN-' + asset.tag, asset.location, asset.status, asset.isBookable, deptId]
        );
      }
    }
    console.log('  ✅ Sample assets seeded');

    // ── 4. Welcome Activity Log ───────────────────────────
    const welcomeAdminId = userIds['admin@assetflow.com'] || null;
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type)
       VALUES ($1, $2, 'system')`,
      [welcomeAdminId, 'AssetFlow system initialized by Admin']
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
