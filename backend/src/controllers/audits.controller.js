/**
 * ============================================================
 * AssetFlow — Audits Controller (Member 4)
 * ============================================================
 */

const db = require('../config/db');
const assetService = require('../services/asset.service');
const { logActivity } = require('../services/activityLog.service');

// ── POST /api/audits ────────────────────────────────────────
async function create(req, res) {
  const client = await db.pool.connect();
  try {
    const { name, departmentId, location, startDate, endDate, auditorIds } = req.body;
    
    if (!name || !startDate) {
      return res.status(400).json({ success: false, data: null, error: 'Name and start date are required' });
    }
    if (!auditorIds || !Array.isArray(auditorIds) || auditorIds.length === 0) {
      return res.status(400).json({ success: false, data: null, error: 'At least one auditor is required' });
    }

    await client.query('BEGIN');

    // 1. Create audit cycle
    const cycleRes = await client.query(
      `INSERT INTO audit_cycles (name, scope_department_id, scope_location, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, 'Active') RETURNING *`,
      [name, departmentId || null, location || null, startDate, endDate || null]
    );
    const cycle = cycleRes.rows[0];

    // 2. Assign auditors
    for (const audId of auditorIds) {
      await client.query(
        `INSERT INTO audit_cycle_auditors (audit_cycle_id, auditor_id) VALUES ($1, $2)`,
        [cycle.id, audId]
      );
    }

    // 3. Find assets in scope and create audit_items
    let assetQuery = `SELECT id FROM assets WHERE status NOT IN ('Lost', 'Retired', 'Disposed')`;
    const assetParams = [];
    if (departmentId && location) {
      assetQuery += ` AND (department_id = $1 OR location = $2)`;
      assetParams.push(departmentId, location);
    } else if (departmentId) {
      assetQuery += ` AND department_id = $1`;
      assetParams.push(departmentId);
    } else if (location) {
      assetQuery += ` AND location = $1`;
      assetParams.push(location);
    }

    const assetsInScope = await client.query(assetQuery, assetParams);
    
    for (const row of assetsInScope.rows) {
      await client.query(
        `INSERT INTO audit_items (audit_cycle_id, asset_id, verification_status) VALUES ($1, $2, 'Pending')`,
        [cycle.id, row.id]
      );
    }

    await client.query('COMMIT');

    await logActivity({
      userId: req.user.id,
      action: `Created audit cycle "${cycle.name}" targeting ${assetsInScope.rows.length} assets`,
      entityType: 'audit_cycle',
      entityId: cycle.id
    });

    res.status(201).json({ success: true, data: { ...cycle, assetCount: assetsInScope.rows.length }, error: null });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[Audits] Create error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  } finally {
    client.release();
  }
}

// ── GET /api/audits ─────────────────────────────────────────
async function getAll(req, res) {
  try {
    const query = `
      SELECT ac.*, d.name AS department_name,
             (SELECT COUNT(*) FROM audit_items ai WHERE ai.audit_cycle_id = ac.id) AS total_items,
             (SELECT COUNT(*) FROM audit_items ai WHERE ai.audit_cycle_id = ac.id AND ai.verification_status != 'Pending') AS verified_items
      FROM audit_cycles ac
      LEFT JOIN departments d ON ac.scope_department_id = d.id
      ORDER BY ac.created_at DESC
    `;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows, error: null });
  } catch (err) {
    console.error('[Audits] getAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── GET /api/audits/:id ──────────────────────────────────────
async function getById(req, res) {
  try {
    const { id } = req.params;
    
    const cycleRes = await db.query(
      `SELECT ac.*, d.name AS department_name FROM audit_cycles ac LEFT JOIN departments d ON ac.scope_department_id = d.id WHERE ac.id = $1`, 
      [id]
    );
    if (cycleRes.rows.length === 0) return res.status(404).json({ success: false, data: null, error: 'Audit cycle not found' });
    const cycle = cycleRes.rows[0];

    // Fetch items with asset details
    const itemsRes = await db.query(
      `SELECT ai.id as audit_item_id, ai.verification_status, ai.notes,
              a.id as asset_id, a.asset_tag, a.name as asset_name, a.location as expected_location, a.status as current_status
       FROM audit_items ai
       JOIN assets a ON ai.asset_id = a.id
       WHERE ai.audit_cycle_id = $1
       ORDER BY a.asset_tag ASC`,
      [id]
    );

    res.json({ success: true, data: { ...cycle, items: itemsRes.rows }, error: null });
  } catch (err) {
    console.error('[Audits] getById error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── PUT /api/audits/:id/items/:itemId ────────────────────────
async function updateItem(req, res) {
  try {
    const { id, itemId } = req.params;
    const { status, notes } = req.body;
    
    if (!['Pending', 'Verified', 'Missing', 'Damaged'].includes(status)) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid verification status' });
    }

    const itemRes = await db.query(
      `UPDATE audit_items SET verification_status = $1, notes = COALESCE($2, notes), updated_at = NOW() 
       WHERE id = $3 AND audit_cycle_id = $4 RETURNING *`,
      [status, notes || null, itemId, id]
    );

    if (itemRes.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Audit item not found' });
    }

    res.json({ success: true, data: itemRes.rows[0], error: null });
  } catch (err) {
    console.error('[Audits] updateItem error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── POST /api/audits/:id/close ──────────────────────────────
async function close(req, res) {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;

    const cycleRes = await client.query(`SELECT * FROM audit_cycles WHERE id = $1`, [id]);
    if (cycleRes.rows.length === 0) return res.status(404).json({ success: false, data: null, error: 'Cycle not found' });
    const cycle = cycleRes.rows[0];

    if (cycle.status === 'Completed') return res.status(400).json({ success: false, data: null, error: 'Cycle already completed' });

    // Check if any items are still pending
    const pendingRes = await client.query(`SELECT COUNT(*) FROM audit_items WHERE audit_cycle_id = $1 AND verification_status = 'Pending'`, [id]);
    if (parseInt(pendingRes.rows[0].count) > 0) {
      return res.status(400).json({ success: false, data: null, error: 'Cannot close cycle with pending items' });
    }

    await client.query('BEGIN');
    
    await client.query(`UPDATE audit_cycles SET status = 'Completed', end_date = CURRENT_DATE, updated_at = NOW() WHERE id = $1`, [id]);

    // Apply status updates to flagged assets via assetService
    const flaggedRes = await client.query(
      `SELECT asset_id, verification_status, notes FROM audit_items WHERE audit_cycle_id = $1 AND verification_status IN ('Missing', 'Damaged')`,
      [id]
    );

    for (const row of flaggedRes.rows) {
      const newStatus = row.verification_status === 'Missing' ? 'Lost' : 'Under Maintenance';
      const reason = `Flagged as ${row.verification_status} during Audit "${cycle.name}"`;
      // Use shared helper
      await assetService.updateStatus(row.asset_id, newStatus, reason, req.user.id, client);
    }

    await client.query('COMMIT');

    await logActivity({
      userId: req.user.id,
      action: `Closed audit cycle "${cycle.name}" and flagged ${flaggedRes.rows.length} discrepancies`,
      entityType: 'audit_cycle',
      entityId: cycle.id
    });

    res.json({ success: true, data: { id, status: 'Completed', flagged: flaggedRes.rows.length }, error: null });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[Audits] close error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  } finally {
    client.release();
  }
}

module.exports = { create, getAll, getById, updateItem, close };
