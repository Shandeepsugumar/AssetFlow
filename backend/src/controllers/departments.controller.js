/**
 * ============================================================
 * AssetFlow — Departments Controller
 * ============================================================
 * GET    /api/departments              — List all (any auth user)
 * POST   /api/departments              — Create (Admin only)
 * PUT    /api/departments/:id          — Update (Admin only)
 * PATCH  /api/departments/:id/deactivate — Toggle active (Admin only)
 * ============================================================
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLog.service');

/**
 * GET /api/departments
 * Any authenticated user — used for dropdowns across the app.
 */
async function getAll(req, res) {
  try {
    const result = await db.query(
      `SELECT d.*,
              pd.name AS parent_name,
              COALESCE(u.name, u_role.name) AS head_name,
              COALESCE(d.department_head_id, u_role.id) AS computed_head_id
       FROM departments d
       LEFT JOIN departments pd ON d.parent_department_id = pd.id
       LEFT JOIN users u ON d.department_head_id = u.id
       LEFT JOIN (
         SELECT DISTINCT ON (department_id) id, name, department_id
         FROM users
         WHERE role = 'department_head' AND is_active = true AND department_id IS NOT NULL
         ORDER BY department_id, created_at ASC
       ) u_role ON u_role.department_id = d.id
       ORDER BY d.name ASC`
    );

    // Add employee count per department
    const countResult = await db.query(
      `SELECT department_id, COUNT(*)::int AS count
       FROM users WHERE department_id IS NOT NULL
       GROUP BY department_id`
    );
    const countMap = {};
    countResult.rows.forEach((r) => {
      countMap[r.department_id] = r.count;
    });

    const departments = result.rows.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      headId: d.computed_head_id || d.department_head_id,
      headName: d.head_name,
      parentId: d.parent_department_id,
      parentName: d.parent_name,
      status: d.is_active ? 'Active' : 'Inactive',
      employeeCount: countMap[d.id] || 0,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));

    res.json({ success: true, data: departments, error: null });
  } catch (err) {
    console.error('[Departments] GetAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * POST /api/departments
 * Admin only. Creates a new department.
 */
async function create(req, res) {
  try {
    const { name, description, headId, parentId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Department name is required' });
    }

    const dupCheck = await db.query('SELECT id FROM departments WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    if (dupCheck.rows.length > 0) {
      return res.status(400).json({ success: false, data: null, error: 'A department with this name already exists' });
    }

    // Validate head exists if provided
    if (headId) {
      const headCheck = await db.query('SELECT id FROM users WHERE id = $1', [headId]);
      if (headCheck.rows.length === 0) {
        return res.status(400).json({ success: false, data: null, error: 'Selected department head not found' });
      }
    }

    // Validate parent exists if provided
    if (parentId) {
      const parentCheck = await db.query('SELECT id FROM departments WHERE id = $1', [parentId]);
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ success: false, data: null, error: 'Parent department not found' });
      }
    }

    const result = await db.query(
      `INSERT INTO departments (name, description, department_head_id, parent_department_id, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [name.trim(), description || '', headId || null, parentId || null]
    );

    const dept = result.rows[0];

    await logActivity({
      userId: req.user.id,
      action: `Department "${dept.name}" created`,
      entityType: 'department',
      entityId: dept.id,
    });

    res.status(201).json({ success: true, data: dept, error: null });
  } catch (err) {
    console.error('[Departments] Create error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * PUT /api/departments/:id
 * Admin only. Updates a department.
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, description, headId, parentId } = req.body;

    // Check department exists
    const existing = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Department not found' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Department name is required' });
    }

    const dupCheck = await db.query('SELECT id FROM departments WHERE LOWER(name) = LOWER($1) AND id != $2', [name.trim(), id]);
    if (dupCheck.rows.length > 0) {
      return res.status(400).json({ success: false, data: null, error: 'A department with this name already exists' });
    }

    // Prevent self-referencing parent
    if (parentId && parentId === id) {
      return res.status(400).json({ success: false, data: null, error: 'A department cannot be its own parent' });
    }

    const targetHeadId = headId !== undefined && headId !== '' ? headId : existing.rows[0].department_head_id;

    const result = await db.query(
      `UPDATE departments
       SET name = $1, description = $2, department_head_id = $3, parent_department_id = $4
       WHERE id = $5
       RETURNING *`,
      [name.trim(), description || '', targetHeadId || null, parentId || null, id]
    );

    await logActivity({
      userId: req.user.id,
      action: `Department "${name}" updated`,
      entityType: 'department',
      entityId: id,
    });

    res.json({ success: true, data: result.rows[0], error: null });
  } catch (err) {
    console.error('[Departments] Update error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * PATCH /api/departments/:id/deactivate
 * Admin only. Toggles department active status.
 */
async function deactivate(req, res) {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Department not found' });
    }

    const newStatus = !existing.rows[0].is_active;
    const result = await db.query(
      'UPDATE departments SET is_active = $1 WHERE id = $2 RETURNING *',
      [newStatus, id]
    );

    const statusText = newStatus ? 'activated' : 'deactivated';
    await logActivity({
      userId: req.user.id,
      action: `Department "${result.rows[0].name}" ${statusText}`,
      entityType: 'department',
      entityId: id,
    });

    res.json({ success: true, data: result.rows[0], error: null });
  } catch (err) {
    console.error('[Departments] Deactivate error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { getAll, create, update, deactivate };
