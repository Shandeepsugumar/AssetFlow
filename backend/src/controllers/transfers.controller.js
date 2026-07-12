/**
 * ============================================================
 * AssetFlow — Transfers Controller (GAP 2)
 * ============================================================
 * POST   /api/transfers              — request a transfer
 * GET    /api/transfers              — list transfers (with ?status=)
 * PATCH  /api/transfers/:id/approve  — approve (Asset Manager / Dept Head / Admin)
 * PATCH  /api/transfers/:id/reject   — reject  (Asset Manager / Dept Head / Admin)
 * ============================================================
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLog.service');
const assetService = require('../services/asset.service');
const notificationService = require('../services/notification.service');

// ── POST /api/transfers ──────────────────────────────────────
async function create(req, res) {
  try {
    const { assetId, toEmployeeId, toDepartmentId, notes } = req.body;
    const requestedBy = req.user.id;

    if (!assetId) {
      return res.status(400).json({ success: false, data: null, error: 'Asset ID is required' });
    }
    if (!toEmployeeId && !toDepartmentId) {
      return res.status(400).json({ success: false, data: null, error: 'Transfer destination (employee or department) is required' });
    }

    const assetRes = await db.query('SELECT * FROM assets WHERE id = $1', [assetId]);
    if (assetRes.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Asset not found' });
    }

    const asset = assetRes.rows[0];
    const fromEmployeeId = asset.current_holder_id;

    // Prevent duplicate pending requests for the same asset
    const existing = await db.query(
      `SELECT id FROM transfer_requests WHERE asset_id = $1 AND status = 'Requested'`,
      [assetId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: 'There is already a pending transfer request for this asset',
      });
    }

    const result = await db.query(
      `INSERT INTO transfer_requests
         (asset_id, from_employee_id, to_employee_id, to_department_id, requested_by, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Requested')
       RETURNING *`,
      [assetId, fromEmployeeId || null, toEmployeeId || null, toDepartmentId || null, requestedBy, notes || null]
    );

    await logActivity({
      userId: requestedBy,
      action: `Transfer requested for asset "${asset.name}" (${asset.asset_tag})`,
      entityType: 'transfer',
      entityId: result.rows[0].id,
    });

    res.status(201).json({ success: true, data: result.rows[0], error: null });
  } catch (err) {
    console.error('[Transfers] Create error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── GET /api/transfers ───────────────────────────────────────
async function getAll(req, res) {
  try {
    const { status } = req.query;

    let query = `
      SELECT tr.*,
             a.name AS asset_name, a.asset_tag,
             u_from.name AS from_employee_name,
             u_to.name AS to_employee_name,
             d.name AS to_department_name,
             u_req.name AS requested_by_name,
             u_appr.name AS approved_by_name
      FROM transfer_requests tr
      JOIN assets a ON tr.asset_id = a.id
      LEFT JOIN users u_from ON tr.from_employee_id = u_from.id
      LEFT JOIN users u_to ON tr.to_employee_id = u_to.id
      LEFT JOIN departments d ON tr.to_department_id = d.id
      LEFT JOIN users u_req ON tr.requested_by = u_req.id
      LEFT JOIN users u_appr ON tr.approved_by = u_appr.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) {
      query += ` AND tr.status = $${idx++}`;
      params.push(status);
    }

    // Role scoping
    const { role, id: userId } = req.user;
    if (role === 'employee') {
      query += ` AND (tr.requested_by = $${idx} OR tr.to_employee_id = $${idx} OR tr.from_employee_id = $${idx})`;
      params.push(userId);
      idx++;
    }

    query += ` ORDER BY tr.created_at DESC`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows, error: null });
  } catch (err) {
    console.error('[Transfers] GetAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── PATCH /api/transfers/:id/approve ────────────────────────
async function approve(req, res) {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const approvedBy = req.user.id;

    const trRes = await client.query(
      `SELECT tr.*, a.name AS asset_name, a.asset_tag
       FROM transfer_requests tr
       JOIN assets a ON tr.asset_id = a.id
       WHERE tr.id = $1`,
      [id]
    );

    if (trRes.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Transfer request not found' });
    }

    const transfer = trRes.rows[0];

    if (transfer.status !== 'Requested') {
      return res.status(400).json({ success: false, data: null, error: `Transfer is already ${transfer.status}` });
    }

    await client.query('BEGIN');

    // 1. Mark transfer as Approved
    await client.query(
      `UPDATE transfer_requests SET status = 'Approved', approved_by = $1, updated_at = NOW() WHERE id = $2`,
      [approvedBy, id]
    );

    // 2. Close the existing active allocation for this asset
    await client.query(
      `UPDATE allocations SET status = 'Returned', actual_return_date = CURRENT_DATE, updated_at = NOW()
       WHERE asset_id = $1 AND status = 'Active'`,
      [transfer.asset_id]
    );

    // 3. Create new allocation row for the new holder
    const newAllocRes = await client.query(
      `INSERT INTO allocations
         (asset_id, allocated_to_user, allocated_to_dept, allocated_by, purpose, notes, status)
       VALUES ($1, $2, $3, $4, 'Transfer', $5, 'Active')
       RETURNING *`,
      [
        transfer.asset_id,
        transfer.to_employee_id || null,
        transfer.to_department_id || null,
        approvedBy,
        `Transferred from previous holder`,
      ]
    );

    // 4. Update asset status and holder using the service (pass client for transaction)
    await assetService.updateStatus(
      transfer.asset_id,
      'Allocated',
      `Transfer approved by ${req.user.role}`,
      approvedBy,
      client
    );

    // Update current_holder_id
    await client.query(
      `UPDATE assets SET current_holder_id = $1, updated_at = NOW() WHERE id = $2`,
      [transfer.to_employee_id || null, transfer.asset_id]
    );

    await client.query('COMMIT');

    await logActivity({
      userId: approvedBy,
      action: `Transfer approved for asset "${transfer.asset_name}" (${transfer.asset_tag})`,
      entityType: 'transfer',
      entityId: id,
    });

    // Notify the recipient
    if (transfer.to_employee_id) {
      await notificationService.create({
        userId: transfer.to_employee_id,
        type: 'transfer',
        message: `Asset "${transfer.asset_name}" has been transferred to you.`,
        relatedEntityType: 'asset',
        relatedEntityId: transfer.asset_id,
      });
    }

    res.json({ success: true, data: { id, status: 'Approved' }, error: null });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[Transfers] Approve error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  } finally {
    client.release();
  }
}

// ── PATCH /api/transfers/:id/reject ─────────────────────────
async function reject(req, res) {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const rejectedBy = req.user.id;

    const trRes = await db.query(
      `SELECT tr.*, a.name AS asset_name, a.asset_tag
       FROM transfer_requests tr
       JOIN assets a ON tr.asset_id = a.id
       WHERE tr.id = $1`,
      [id]
    );

    if (trRes.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Transfer request not found' });
    }

    const transfer = trRes.rows[0];

    if (transfer.status !== 'Requested') {
      return res.status(400).json({ success: false, data: null, error: `Transfer is already ${transfer.status}` });
    }

    await db.query(
      `UPDATE transfer_requests SET status = 'Rejected', approved_by = $1, notes = COALESCE($2, notes), updated_at = NOW() WHERE id = $3`,
      [rejectedBy, notes || null, id]
    );

    await logActivity({
      userId: rejectedBy,
      action: `Transfer rejected for asset "${transfer.asset_name}" (${transfer.asset_tag})`,
      entityType: 'transfer',
      entityId: id,
    });

    // Notify requester
    await notificationService.create({
      userId: transfer.requested_by,
      type: 'transfer',
      message: `Your transfer request for "${transfer.asset_name}" has been rejected.`,
      relatedEntityType: 'transfer',
      relatedEntityId: id,
    });

    res.json({ success: true, data: { id, status: 'Rejected' }, error: null });
  } catch (err) {
    console.error('[Transfers] Reject error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { create, getAll, approve, reject };
