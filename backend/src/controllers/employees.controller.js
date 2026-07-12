/**
 * ============================================================
 * AssetFlow — Employees Controller
 * ============================================================
 * GET   /api/employees                — List/search/filter (any auth)
 * PATCH /api/employees/:id/role       — Change role (Admin ONLY)
 *       ⚠️  THIS IS THE ONLY ENDPOINT IN THE ENTIRE SYSTEM
 *           THAT CHANGES A USER'S ROLE.
 * PATCH /api/employees/:id/deactivate — Toggle active (Admin only)
 * ============================================================
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLog.service');

const VALID_ROLES = ['admin', 'asset_manager', 'department_head', 'employee'];

/**
 * GET /api/employees
 * Supports: ?search=, ?department=, ?role=, ?status=, ?page=, ?limit=
 */
async function getAll(req, res) {
  try {
    const { search, department, role, status, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.is_active,
             u.department_id, d.name AS department,
             u.created_at, u.updated_at
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (search) {
      query += ` AND (u.name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (department) {
      query += ` AND d.name = $${paramIdx}`;
      params.push(department);
      paramIdx++;
    }

    if (role) {
      query += ` AND u.role = $${paramIdx}`;
      params.push(role.toLowerCase().replace(/ /g, '_'));
      paramIdx++;
    }

    if (status) {
      const isActive = status.toLowerCase() === 'active';
      query += ` AND u.is_active = $${paramIdx}`;
      params.push(isActive);
      paramIdx++;
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*)::int AS total FROM (${query}) AS filtered`;
    const countResult = await db.query(countQuery, params);
    const total = countResult.rows[0].total;

    // Add pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    query += ` ORDER BY u.name ASC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    params.push(limitNum, offset);

    const result = await db.query(query, params);

    // Map to frontend-friendly shape
    const employees = result.rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: formatRole(u.role),
      department: u.department,
      departmentId: u.department_id,
      status: u.is_active ? 'Active' : 'Inactive',
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));

    res.json({
      success: true,
      data: employees,
      error: null,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    console.error('[Employees] GetAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * Helper to fetch employee details with department names
 */
async function getEmployeeWithDetails(id) {
  const result = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.is_active,
            u.department_id, d.name AS department,
            u.created_at, u.updated_at
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     WHERE u.id = $1`,
    [id]
  );
  if (result.rows.length === 0) return null;
  const u = result.rows[0];
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: formatRole(u.role),
    department: u.department,
    departmentId: u.department_id,
    status: u.is_active ? 'Active' : 'Inactive',
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

/**
 * PATCH /api/employees/:id/role
 * ⚠️  ADMIN ONLY — This is the ONLY place in the entire system
 *     where a user's role can be changed.
 */
async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { role, departmentId } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, data: null, error: 'Role is required' });
    }

    const normalizedRole = role.toLowerCase().replace(/ /g, '_');
    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
      });
    }

    // Check user exists
    const existing = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'User not found' });
    }

    const user = existing.rows[0];

    // Prevent demoting yourself
    if (id === req.user.id) {
      return res.status(400).json({ success: false, data: null, error: 'You cannot change your own role' });
    }

    let targetDeptId = user.department_id;
    if (departmentId !== undefined) {
      targetDeptId = departmentId || null;
    }

    if ((normalizedRole === 'department_head' || normalizedRole === 'asset_manager') && targetDeptId) {
      const existingCheck = await db.query(
        `SELECT u.name, u.role, d.name as dept_name
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE u.role = $1 AND u.department_id = $2 AND u.is_active = true AND u.id != $3`,
        [normalizedRole, targetDeptId, id]
      );
      if (existingCheck.rows.length > 0) {
        const roleLabel = normalizedRole === 'department_head' ? 'Department Head' : 'Asset Manager';
        const deptName = existingCheck.rows[0].dept_name || 'this department';
        return res.status(400).json({
          success: false,
          data: null,
          error: `${deptName} already has an active ${roleLabel} (${existingCheck.rows[0].name}). Deactivate or reassign them before assigning another.`
        });
      }
    } else if (normalizedRole === 'asset_manager' && !targetDeptId) {
      const existingCheck = await db.query(
        `SELECT u.name
         FROM users u
         WHERE u.role = 'asset_manager' AND u.department_id IS NULL AND u.is_active = true AND u.id != $1`,
        [id]
      );
      if (existingCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          data: null,
          error: `There is already an active organization-wide Asset Manager (${existingCheck.rows[0].name}). Deactivate or reassign them before assigning another.`
        });
      }
    }

    const result = await db.query(
      `UPDATE users SET role = $1, department_id = $2 WHERE id = $3
       RETURNING id, name, email, role, department_id, is_active, created_at, updated_at`,
      [normalizedRole, targetDeptId, id]
    );

    if (normalizedRole === 'department_head' && targetDeptId) {
      await db.query('UPDATE departments SET department_head_id = $1 WHERE id = $2', [id, targetDeptId]);
    } else if (user.role === 'department_head') {
      await db.query('UPDATE departments SET department_head_id = NULL WHERE department_head_id = $1 AND id != COALESCE($2, id)', [id, targetDeptId]);
    }

    await logActivity({
      userId: req.user.id,
      action: `${user.name}'s role changed from ${formatRole(user.role)} to ${formatRole(normalizedRole)}`,
      entityType: 'user',
      entityId: id,
    });

    const updated = await getEmployeeWithDetails(id);
    res.json({
      success: true,
      data: updated,
      error: null,
    });
  } catch (err) {
    console.error('[Employees] UpdateRole error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * PATCH /api/employees/:id/deactivate
 * Admin only. Toggles user active status.
 */
async function deactivate(req, res) {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'User not found' });
    }

    // Prevent deactivating yourself
    if (id === req.user.id) {
      return res.status(400).json({ success: false, data: null, error: 'You cannot deactivate your own account' });
    }

    const newStatus = !existing.rows[0].is_active;
    await db.query(
      'UPDATE users SET is_active = $1 WHERE id = $2',
      [newStatus, id]
    );

    if (existing.rows[0].role === 'department_head') {
      if (!newStatus) {
        await db.query('UPDATE departments SET department_head_id = NULL WHERE department_head_id = $1', [id]);
      } else if (existing.rows[0].department_id) {
        const checkCurrentHead = await db.query('SELECT department_head_id FROM departments WHERE id = $1', [existing.rows[0].department_id]);
        if (checkCurrentHead.rows.length > 0 && !checkCurrentHead.rows[0].department_head_id) {
          await db.query('UPDATE departments SET department_head_id = $1 WHERE id = $2', [id, existing.rows[0].department_id]);
        }
      }
    }

    const statusText = newStatus ? 'activated' : 'deactivated';
    await logActivity({
      userId: req.user.id,
      action: `${existing.rows[0].name}'s account ${statusText}`,
      entityType: 'user',
      entityId: id,
    });

    const updated = await getEmployeeWithDetails(id);
    res.json({ success: true, data: updated, error: null });
  } catch (err) {
    console.error('[Employees] Deactivate error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * Format DB role enum to display-friendly string.
 * 'asset_manager' → 'Asset Manager'
 */
function formatRole(role) {
  const map = {
    admin: 'Admin',
    asset_manager: 'Asset Manager',
    department_head: 'Department Head',
    employee: 'Employee',
  };
  return map[role] || role;
}

module.exports = { getAll, updateRole, deactivate };
