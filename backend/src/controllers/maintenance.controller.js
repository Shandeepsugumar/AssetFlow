/**
 * ============================================================
 * AssetFlow — Maintenance Controller
 * ============================================================
 * Handles raising requests, workflow transitions, and scoping.
 * ============================================================
 */

const db = require('../config/db');
const assetService = require('../services/asset.service');
const notificationService = require('../services/notification.service');
const { logActivity } = require('../services/activityLog.service');

async function create(req, res) {
  try {
    const { assetId, issueDescription, priority, photoUrl } = req.body;
    const raisedBy = req.user.id;

    if (!assetId || !issueDescription) {
      return res.status(400).json({ success: false, data: null, error: 'Asset and issue description are required' });
    }

    // Check asset exists
    const assetCheck = await db.query('SELECT * FROM assets WHERE id = $1', [assetId]);
    if (assetCheck.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Asset not found' });
    }

    const asset = assetCheck.rows[0];

    const result = await db.query(
      `INSERT INTO maintenance_requests (asset_id, raised_by, issue_description, priority, photo_url, status)
       VALUES ($1, $2, $3, $4, $5, 'Pending')
       RETURNING *`,
      [assetId, raisedBy, issueDescription, priority || 'Medium', photoUrl || null]
    );

    const request = result.rows[0];

    await logActivity({
      userId: raisedBy,
      action: `Maintenance request raised for "${asset.name}" (${asset.asset_tag})`,
      entityType: 'maintenance',
      entityId: request.id,
    });

    res.status(201).json({ success: true, data: request, error: null });
  } catch (err) {
    console.error('[Maintenance] Create error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function getAll(req, res) {
  try {
    const { id: userId, role, department_id: deptId } = req.user;
    const { status, priority, assetId } = req.query;

    let query = `
      SELECT m.*, a.name AS asset_name, a.asset_tag, u.name AS raised_by_name
      FROM maintenance_requests m
      JOIN assets a ON m.asset_id = a.id
      JOIN users u ON m.raised_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (status) {
      query += ` AND m.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (priority) {
      query += ` AND m.priority = $${paramIdx}`;
      params.push(priority);
      paramIdx++;
    }

    if (assetId) {
      query += ` AND m.asset_id = $${paramIdx}`;
      params.push(assetId);
      paramIdx++;
    }

    // Role-based scoping
    if (role === 'employee') {
      query += ` AND m.raised_by = $${paramIdx}`;
      params.push(userId);
      paramIdx++;
    } else if (role === 'department_head') {
      query += ` AND (u.department_id = $${paramIdx} OR a.department_id = $${paramIdx})`;
      params.push(deptId);
      paramIdx++;
    }

    query += ` ORDER BY m.created_at DESC`;

    const result = await db.query(query, params);
    const requests = result.rows.map((row) => ({
      id: row.id,
      assetId: row.asset_id,
      assetName: row.asset_name,
      assetTag: row.asset_tag,
      raisedBy: row.raised_by,
      raisedByName: row.raised_by_name,
      issueDescription: row.issue_description,
      priority: row.priority,
      photoUrl: row.photo_url,
      status: row.status,
      approvedBy: row.approved_by,
      technicianAssigned: row.technician_assigned,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
    }));

    res.json({ success: true, data: requests, error: null });
  } catch (err) {
    console.error('[Maintenance] GetAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function approve(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const requestCheck = await db.query(
      'SELECT m.*, a.name AS asset_name FROM maintenance_requests m JOIN assets a ON m.asset_id = a.id WHERE m.id = $1',
      [id]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Maintenance request not found' });
    }

    const request = requestCheck.rows[0];
    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, data: null, error: `Cannot approve request in status: ${request.status}` });
    }

    // Update status to Approved
    await db.query(
      `UPDATE maintenance_requests
       SET status = 'Approved', approved_by = $1
       WHERE id = $2`,
      [adminId, id]
    );

    // Call asset service to set status to Under Maintenance
    await assetService.updateStatus(request.asset_id, 'Under Maintenance', 'Maintenance request approved', adminId);

    await logActivity({
      userId: adminId,
      action: `Approved maintenance request for "${request.asset_name}"`,
      entityType: 'maintenance',
      entityId: id,
    });

    // Notify user who raised request
    await notificationService.create({
      userId: request.raised_by,
      type: 'maintenance',
      message: `Your maintenance request for "${request.asset_name}" has been approved.`,
      relatedEntityType: 'maintenance',
      relatedEntityId: id,
    });

    res.json({ success: true, data: { id, status: 'Approved' }, error: null });
  } catch (err) {
    console.error('[Maintenance] Approve error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function reject(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const requestCheck = await db.query(
      'SELECT m.*, a.name AS asset_name FROM maintenance_requests m JOIN assets a ON m.asset_id = a.id WHERE m.id = $1',
      [id]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Maintenance request not found' });
    }

    const request = requestCheck.rows[0];
    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, data: null, error: `Cannot reject request in status: ${request.status}` });
    }

    // Update status to Rejected
    await db.query(
      `UPDATE maintenance_requests
       SET status = 'Rejected', approved_by = $1
       WHERE id = $2`,
      [adminId, id]
    );

    await logActivity({
      userId: adminId,
      action: `Rejected maintenance request for "${request.asset_name}"`,
      entityType: 'maintenance',
      entityId: id,
    });

    // Notify user who raised request
    await notificationService.create({
      userId: request.raised_by,
      type: 'maintenance',
      message: `Your maintenance request for "${request.asset_name}" has been rejected.`,
      relatedEntityType: 'maintenance',
      relatedEntityId: id,
    });

    res.json({ success: true, data: { id, status: 'Rejected' }, error: null });
  } catch (err) {
    console.error('[Maintenance] Reject error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function assign(req, res) {
  try {
    const { id } = req.params;
    const { technicianName } = req.body;
    const adminId = req.user.id;

    if (!technicianName) {
      return res.status(400).json({ success: false, data: null, error: 'Technician name is required' });
    }

    const requestCheck = await db.query(
      'SELECT m.*, a.name AS asset_name FROM maintenance_requests m JOIN assets a ON m.asset_id = a.id WHERE m.id = $1',
      [id]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Maintenance request not found' });
    }

    const request = requestCheck.rows[0];
    if (request.status !== 'Approved' && request.status !== 'Pending') {
      // Allow assigning straight from Pending or Approved
    }

    // Update status to In Progress
    await db.query(
      `UPDATE maintenance_requests
       SET status = 'In Progress', technician_assigned = $1
       WHERE id = $2`,
      [technicianName, id]
    );

    // Call asset service defensively to ensure it is in Under Maintenance
    await assetService.updateStatus(request.asset_id, 'Under Maintenance', `Technician ${technicianName} assigned`, adminId);

    await logActivity({
      userId: adminId,
      action: `Assigned technician "${technicianName}" to maintenance request for "${request.asset_name}"`,
      entityType: 'maintenance',
      entityId: id,
    });

    res.json({ success: true, data: { id, status: 'In Progress', technicianAssigned: technicianName }, error: null });
  } catch (err) {
    console.error('[Maintenance] Assign error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function resolve(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const requestCheck = await db.query(
      'SELECT m.*, a.name AS asset_name FROM maintenance_requests m JOIN assets a ON m.asset_id = a.id WHERE m.id = $1',
      [id]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Maintenance request not found' });
    }

    const request = requestCheck.rows[0];
    if (request.status === 'Resolved' || request.status === 'Rejected') {
      return res.status(400).json({ success: false, data: null, error: `Request is already ${request.status}` });
    }

    // Update status to Resolved
    await db.query(
      `UPDATE maintenance_requests
       SET status = 'Resolved', resolved_at = NOW()
       WHERE id = $1`,
      [id]
    );

    // Call asset service to revert to Available
    await assetService.updateStatus(request.asset_id, 'Available', 'Maintenance resolved', adminId);

    await logActivity({
      userId: adminId,
      action: `Resolved maintenance request for "${request.asset_name}"`,
      entityType: 'maintenance',
      entityId: id,
    });

    // Notify user who raised request
    await notificationService.create({
      userId: request.raised_by,
      type: 'maintenance',
      message: `Your maintenance request for "${request.asset_name}" has been resolved.`,
      relatedEntityType: 'maintenance',
      relatedEntityId: id,
    });

    res.json({ success: true, data: { id, status: 'Resolved' }, error: null });
  } catch (err) {
    console.error('[Maintenance] Resolve error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function getTodayCount(req, res) {
  try {
    const { id: userId, role, department_id: deptId } = req.user;

    let query = `
      SELECT COUNT(*)::int AS count
      FROM maintenance_requests m
      JOIN assets a ON m.asset_id = a.id
      JOIN users u ON m.raised_by = u.id
      WHERE m.created_at::date = CURRENT_DATE
    `;
    const params = [];
    let paramIdx = 1;

    if (role === 'employee') {
      query += ` AND m.raised_by = $${paramIdx}`;
      params.push(userId);
      paramIdx++;
    } else if (role === 'department_head') {
      query += ` AND (u.department_id = $${paramIdx} OR a.department_id = $${paramIdx})`;
      params.push(deptId);
      paramIdx++;
    }

    const result = await db.query(query, params);
    res.json({ success: true, data: { count: result.rows[0].count }, error: null });
  } catch (err) {
    console.error('[Maintenance] GetTodayCount error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { create, getAll, approve, reject, assign, resolve, getTodayCount };
