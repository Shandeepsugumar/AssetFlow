/**
 * ============================================================
 * AssetFlow — Assets Controller (Full CRUD)
 * ============================================================
 * GET    /api/assets             — list/filter all assets
 * POST   /api/assets             — register new asset (with multer upload)
 * GET    /api/assets/:id         — get single asset with allocation history
 * PUT    /api/assets/:id         — update asset details
 * GET    /api/assets/:id/history — allocation + maintenance history
 * ============================================================
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLog.service');

// ── Helpers ──────────────────────────────────────────────────
function formatAsset(row) {
  return {
    id: row.id,
    assetTag: row.asset_tag,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    serialNumber: row.serial_number,
    acquisitionDate: row.acquisition_date,
    acquisitionCost: row.acquisition_cost,
    condition: row.condition,
    location: row.location,
    status: row.status,
    isBookable: row.is_bookable,
    departmentId: row.department_id,
    departmentName: row.department_name,
    currentHolderId: row.current_holder_id,
    currentHolderName: row.current_holder_name || null,
    photoUrl: row.photo_url,
    documentUrl: row.document_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── GET /api/assets ──────────────────────────────────────────
async function getAll(req, res) {
  try {
    const { is_bookable, status, search, category_id, department_id } = req.query;

    let query = `
      SELECT a.*, c.name AS category_name, d.name AS department_name,
             u.name AS current_holder_name
      FROM assets a
      LEFT JOIN asset_categories c ON a.category_id = c.id
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN users u ON a.current_holder_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (is_bookable !== undefined) {
      query += ` AND a.is_bookable = $${idx++}`;
      params.push(is_bookable === 'true');
    }
    if (status) {
      query += ` AND a.status = $${idx++}`;
      params.push(status);
    }
    if (category_id) {
      query += ` AND a.category_id = $${idx++}`;
      params.push(category_id);
    }
    if (department_id) {
      query += ` AND a.department_id = $${idx++}`;
      params.push(department_id);
    }
    if (search) {
      query += ` AND (a.name ILIKE $${idx} OR a.asset_tag ILIKE $${idx} OR a.serial_number ILIKE $${idx} OR a.location ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows.map(formatAsset), error: null });
  } catch (err) {
    console.error('[Assets] GetAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── GET /api/assets/:id ──────────────────────────────────────
async function getById(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT a.*, c.name AS category_name, d.name AS department_name,
              u.name AS current_holder_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       LEFT JOIN departments d ON a.department_id = d.id
       LEFT JOIN users u ON a.current_holder_id = u.id
       WHERE a.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Asset not found' });
    }
    res.json({ success: true, data: formatAsset(result.rows[0]), error: null });
  } catch (err) {
    console.error('[Assets] GetById error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── POST /api/assets ─────────────────────────────────────────
async function create(req, res) {
  try {
    const {
      name, categoryId, serialNumber, acquisitionDate, acquisitionCost,
      condition, location, departmentId, isBookable, notes,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, data: null, error: 'Asset name is required' });
    }

    const photoUrl = req.files?.photo?.[0]
      ? `/uploads/${req.files.photo[0].filename}`
      : null;
    const documentUrl = req.files?.document?.[0]
      ? `/uploads/${req.files.document[0].filename}`
      : null;

    const result = await db.query(
      `INSERT INTO assets
         (name, category_id, serial_number, acquisition_date, acquisition_cost,
          condition, location, department_id, is_bookable, photo_url, document_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Available')
       RETURNING *`,
      [
        name,
        categoryId || null,
        serialNumber || null,
        acquisitionDate || null,
        acquisitionCost || null,
        condition || 'Good',
        location || null,
        departmentId || null,
        isBookable === 'true' || isBookable === true || false,
        photoUrl,
        documentUrl,
      ]
    );

    const asset = result.rows[0];

    await logActivity({
      userId: req.user.id,
      action: `Asset "${asset.name}" (${asset.asset_tag}) registered`,
      entityType: 'asset',
      entityId: asset.id,
    });

    res.status(201).json({ success: true, data: formatAsset(asset), error: null });
  } catch (err) {
    console.error('[Assets] Create error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── PUT /api/assets/:id ──────────────────────────────────────
async function update(req, res) {
  try {
    const { id } = req.params;
    const {
      name, categoryId, serialNumber, acquisitionDate, acquisitionCost,
      condition, location, departmentId, isBookable, status,
    } = req.body;

    const existing = await db.query('SELECT * FROM assets WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Asset not found' });
    }

    const photoUrl = req.files?.photo?.[0]
      ? `/uploads/${req.files.photo[0].filename}`
      : existing.rows[0].photo_url;
    const documentUrl = req.files?.document?.[0]
      ? `/uploads/${req.files.document[0].filename}`
      : existing.rows[0].document_url;

    const result = await db.query(
      `UPDATE assets SET
         name = COALESCE($1, name),
         category_id = COALESCE($2, category_id),
         serial_number = COALESCE($3, serial_number),
         acquisition_date = COALESCE($4, acquisition_date),
         acquisition_cost = COALESCE($5, acquisition_cost),
         condition = COALESCE($6, condition),
         location = COALESCE($7, location),
         department_id = COALESCE($8, department_id),
         is_bookable = COALESCE($9, is_bookable),
         status = COALESCE($10, status),
         photo_url = $11,
         document_url = $12,
         updated_at = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        name || null,
        categoryId || null,
        serialNumber || null,
        acquisitionDate || null,
        acquisitionCost || null,
        condition || null,
        location || null,
        departmentId || null,
        isBookable !== undefined ? (isBookable === 'true' || isBookable === true) : null,
        status || null,
        photoUrl,
        documentUrl,
        id,
      ]
    );

    await logActivity({
      userId: req.user.id,
      action: `Asset "${result.rows[0].name}" (${result.rows[0].asset_tag}) updated`,
      entityType: 'asset',
      entityId: id,
    });

    res.json({ success: true, data: formatAsset(result.rows[0]), error: null });
  } catch (err) {
    console.error('[Assets] Update error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── GET /api/assets/:id/history ──────────────────────────────
async function getHistory(req, res) {
  try {
    const { id } = req.params;

    const allocations = await db.query(
      `SELECT al.*, 
              u1.name AS allocated_to_name, u1.email AS allocated_to_email,
              u2.name AS allocated_by_name,
              d.name AS department_name
       FROM allocations al
       LEFT JOIN users u1 ON al.allocated_to_user = u1.id
       LEFT JOIN users u2 ON al.allocated_by = u2.id
       LEFT JOIN departments d ON al.allocated_to_dept = d.id
       WHERE al.asset_id = $1
       ORDER BY al.created_at DESC`,
      [id]
    );

    const maintenance = await db.query(
      `SELECT mr.*, u.name AS raised_by_name
       FROM maintenance_requests mr
       LEFT JOIN users u ON mr.raised_by = u.id
       WHERE mr.asset_id = $1
       ORDER BY mr.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        allocations: allocations.rows,
        maintenance: maintenance.rows,
      },
      error: null,
    });
  } catch (err) {
    console.error('[Assets] GetHistory error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { getAll, getById, create, update, getHistory };
