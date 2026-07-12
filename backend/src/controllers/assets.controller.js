/**
 * ============================================================
 * AssetFlow — Fallback Assets Controller
 * ============================================================
 * Allows fetching and filtering assets for booking and maintenance.
 * ============================================================
 */

const db = require('../config/db');

async function getAll(req, res) {
  try {
    const { is_bookable, status, search } = req.query;

    let query = `
      SELECT a.*, c.name AS category_name, d.name AS department_name
      FROM assets a
      LEFT JOIN asset_categories c ON a.category_id = c.id
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (is_bookable !== undefined) {
      query += ` AND a.is_bookable = $${paramIdx}`;
      params.push(is_bookable === 'true');
      paramIdx++;
    }

    if (status) {
      query += ` AND a.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (search) {
      query += ` AND (a.name ILIKE $${paramIdx} OR a.asset_tag ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ` ORDER BY a.name ASC`;

    const result = await db.query(query, params);

    // Format response to camelCase
    const assets = result.rows.map((row) => ({
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
      photoUrl: row.photo_url,
      createdAt: row.created_at,
    }));

    res.json({ success: true, data: assets, error: null });
  } catch (err) {
    console.error('[Assets fallback] GetAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT a.*, c.name AS category_name, d.name AS department_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       LEFT JOIN departments d ON a.department_id = d.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Asset not found' });
    }

    const row = result.rows[0];
    const asset = {
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
      photoUrl: row.photo_url,
      createdAt: row.created_at,
    };

    res.json({ success: true, data: asset, error: null });
  } catch (err) {
    console.error('[Assets fallback] GetById error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { getAll, getById };
