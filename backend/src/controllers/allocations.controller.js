/**
 * ============================================================
 * AssetFlow — Allocations Controller (GAP 1 / Member 2)
 * ============================================================
 * POST   /api/allocations              — allocate asset to user/dept
 * GET    /api/allocations              — list all allocations (with filters)
 * GET    /api/allocations/overdue      — list overdue allocations
 * POST   /api/allocations/:id/return   — return an allocated asset
 * ============================================================
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLog.service');
const assetService = require('../services/asset.service');
const notificationService = require('../services/notification.service');

// ── POST /api/allocations ────────────────────────────────────
async function allocate(req, res) {
  const client = await db.pool.connect();
  try {
    const { assetId, expectedReturnDate, purpose, notes } = req.body;
    let { employeeId, departmentId } = req.body;
    const allocatedBy = req.user.id;

    // Convert empty strings to null
    if (employeeId === '') employeeId = null;
    if (departmentId === '') departmentId = null;

    if (!assetId) {
      console.warn('[Allocations] 400 Bad Request: Asset ID is required');
      return res.status(400).json({ success: false, data: null, error: 'Asset ID is required' });
    }
    if (!employeeId && !departmentId) {
      console.warn('[Allocations] 400 Bad Request: Employee or department is required', req.body);
      return res.status(400).json({ success: false, data: null, error: 'Employee or department is required' });
    }

    // Check asset exists and is Available
    const assetRes = await client.query(
      `SELECT a.*, u.name AS holder_name 
       FROM assets a
       LEFT JOIN users u ON a.current_holder_id = u.id
       WHERE a.id = $1`,
      [assetId]
    );
    if (assetRes.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Asset not found' });
    }

    const asset = assetRes.rows[0];

    // 409 conflict — asset is already allocated
    if (asset.status === 'Allocated' && asset.current_holder_id) {
      return res.status(409).json({
        success: false,
        data: {
          currentHolder: asset.holder_name,
          currentHolderId: asset.current_holder_id,
          assetId: asset.id,
          assetName: asset.name,
        },
        error: `This asset is currently held by ${asset.holder_name}. You can request a transfer instead.`,
        transfer_suggested: true,
      });
    }

    if (!['Available', 'Reserved'].includes(asset.status)) {
      console.warn(`[Allocations] 400 Bad Request: Asset is currently "${asset.status}"`);
      return res.status(400).json({
        success: false,
        data: null,
        error: `Asset is currently "${asset.status}" and cannot be allocated`,
      });
    }

    await client.query('BEGIN');

    // Insert allocation row
    const allocRes = await client.query(
      `INSERT INTO allocations
         (asset_id, allocated_to_user, allocated_to_dept, allocated_by, expected_return_date, purpose, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active')
       RETURNING *`,
      [assetId, employeeId || null, departmentId || null, allocatedBy, expectedReturnDate || null, purpose || null, notes || null]
    );

    // Update asset status + holder
    await client.query(
      `UPDATE assets SET status = 'Allocated', current_holder_id = $1, updated_at = NOW() WHERE id = $2`,
      [employeeId || null, assetId]
    );

    await client.query('COMMIT');

    await logActivity({
      userId: allocatedBy,
      action: `Asset "${asset.name}" (${asset.asset_tag}) allocated to ${employeeId ? 'user' : 'department'}`,
      entityType: 'allocation',
      entityId: allocRes.rows[0].id,
    });

    if (employeeId) {
      await notificationService.create({
        userId: employeeId,
        type: 'allocation',
        message: `Asset "${asset.name}" has been allocated to you.`,
        relatedEntityType: 'asset',
        relatedEntityId: assetId,
      });
    }

    res.status(201).json({ success: true, data: allocRes.rows[0], error: null });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[Allocations] Allocate error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  } finally {
    client.release();
  }
}

// ── GET /api/allocations ─────────────────────────────────────
async function getAll(req, res) {
  try {
    const { status, asset_id, user_id } = req.query;

    let query = `
      SELECT al.*,
             a.name AS asset_name, a.asset_tag,
             u1.name AS allocated_to_name,
             u2.name AS allocated_by_name,
             d.name AS department_name
      FROM allocations al
      JOIN assets a ON al.asset_id = a.id
      LEFT JOIN users u1 ON al.allocated_to_user = u1.id
      LEFT JOIN users u2 ON al.allocated_by = u2.id
      LEFT JOIN departments d ON al.allocated_to_dept = d.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status && status !== 'undefined' && status !== 'null') {
      query += ` AND al.status = $${idx++}`;
      params.push(status);
    }
    if (asset_id && asset_id !== 'undefined' && asset_id !== 'null') {
      query += ` AND al.asset_id = $${idx++}`;
      params.push(asset_id);
    }
    if (user_id && user_id !== 'undefined' && user_id !== 'null') {
      query += ` AND al.allocated_to_user = $${idx++}`;
      params.push(user_id);
    }

    // Role scoping
    const { role, id: userId, department_id: deptId } = req.user;
    if (role === 'employee') {
      query += ` AND al.allocated_to_user = $${idx++}`;
      params.push(userId);
    } else if (role === 'department_head') {
      query += ` AND (al.allocated_to_dept = $${idx} OR u1.department_id = $${idx})`;
      params.push(deptId);
      idx++;
    }

    query += ` ORDER BY al.created_at DESC`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows, error: null });
  } catch (err) {
    console.error('[Allocations] GetAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── GET /api/allocations/overdue ─────────────────────────────
async function getOverdue(req, res) {
  try {
    const query = `
      SELECT al.*,
             a.name AS asset_name, a.asset_tag,
             u1.name AS allocated_to_name,
             u2.name AS allocated_by_name
      FROM allocations al
      JOIN assets a ON al.asset_id = a.id
      LEFT JOIN users u1 ON al.allocated_to_user = u1.id
      LEFT JOIN users u2 ON al.allocated_by = u2.id
      WHERE al.status = 'Active'
        AND al.expected_return_date IS NOT NULL
        AND al.expected_return_date < CURRENT_DATE
      ORDER BY al.expected_return_date ASC
    `;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows, error: null });
  } catch (err) {
    console.error('[Allocations] Overdue error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── POST /api/allocations/:id/return ─────────────────────────
async function returnAsset(req, res) {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const allocRes = await client.query(
      `SELECT al.*, a.name AS asset_name, a.asset_tag
       FROM allocations al
       JOIN assets a ON al.asset_id = a.id
       WHERE al.id = $1`,
      [id]
    );

    if (allocRes.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Allocation not found' });
    }

    const allocation = allocRes.rows[0];

    if (allocation.status === 'Returned') {
      return res.status(400).json({ success: false, data: null, error: 'This allocation has already been returned' });
    }

    await client.query('BEGIN');

    // Close allocation
    await client.query(
      `UPDATE allocations SET status = 'Returned', actual_return_date = CURRENT_DATE, notes = COALESCE($1, notes), updated_at = NOW() WHERE id = $2`,
      [notes || null, id]
    );

    // Free asset — use service (with client for transaction)
    await assetService.updateStatus(allocation.asset_id, 'Available', 'Returned by user', req.user.id, client);
    await client.query(
      `UPDATE assets SET current_holder_id = NULL, updated_at = NOW() WHERE id = $1`,
      [allocation.asset_id]
    );

    await client.query('COMMIT');

    res.json({ success: true, data: { id, status: 'Returned' }, error: null });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[Allocations] Return error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  } finally {
    client.release();
  }
}

module.exports = { allocate, getAll, getOverdue, returnAsset };
