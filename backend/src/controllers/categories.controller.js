/**
 * ============================================================
 * AssetFlow — Categories Controller
 * ============================================================
 * GET  /api/categories       — List all (any auth user)
 * POST /api/categories       — Create (Admin only)
 * PUT  /api/categories/:id   — Update (Admin only)
 * ============================================================
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLog.service');

/**
 * GET /api/categories
 * Any authenticated user — used for dropdowns and asset registration.
 */
async function getAll(req, res) {
  try {
    const result = await db.query(
      'SELECT * FROM asset_categories ORDER BY name ASC'
    );

    // Count assets per category (defensive — assets table may not exist yet)
    let countMap = {};
    try {
      const countResult = await db.query(
        `SELECT category_id, COUNT(*)::int AS count
         FROM assets WHERE category_id IS NOT NULL
         GROUP BY category_id`
      );
      countResult.rows.forEach((r) => {
        countMap[r.category_id] = r.count;
      });
    } catch {
      // assets table doesn't exist yet — that's fine
    }

    const categories = result.rows.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      customFields: c.custom_fields,
      assetCount: countMap[c.id] || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    res.json({ success: true, data: categories, error: null });
  } catch (err) {
    console.error('[Categories] GetAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * POST /api/categories
 * Admin only.
 */
async function create(req, res) {
  try {
    const { name, description, customFields } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Category name is required' });
    }

    // Validate customFields is valid JSON if provided
    let fields = customFields || [];
    if (typeof fields === 'string') {
      try {
        fields = JSON.parse(fields);
      } catch {
        return res.status(400).json({ success: false, data: null, error: 'Custom fields must be valid JSON' });
      }
    }

    const result = await db.query(
      `INSERT INTO asset_categories (name, description, custom_fields)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), description || '', JSON.stringify(fields)]
    );

    await logActivity({
      userId: req.user.id,
      action: `Asset category "${name}" created`,
      entityType: 'category',
      entityId: result.rows[0].id,
    });

    const cat = result.rows[0];
    res.status(201).json({
      success: true,
      data: {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        customFields: cat.custom_fields,
        assetCount: 0,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
      },
      error: null,
    });
  } catch (err) {
    console.error('[Categories] Create error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * PUT /api/categories/:id
 * Admin only.
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, description, customFields } = req.body;

    const existing = await db.query('SELECT id FROM asset_categories WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Category not found' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Category name is required' });
    }

    let fields = customFields || [];
    if (typeof fields === 'string') {
      try {
        fields = JSON.parse(fields);
      } catch {
        return res.status(400).json({ success: false, data: null, error: 'Custom fields must be valid JSON' });
      }
    }

    const result = await db.query(
      `UPDATE asset_categories
       SET name = $1, description = $2, custom_fields = $3
       WHERE id = $4
       RETURNING *`,
      [name.trim(), description || '', JSON.stringify(fields), id]
    );

    await logActivity({
      userId: req.user.id,
      action: `Asset category "${name}" updated`,
      entityType: 'category',
      entityId: id,
    });

    const cat = result.rows[0];
    
    // Count assets per category defensively
    let assetCount = 0;
    try {
      const countResult = await db.query(
        `SELECT COUNT(*)::int AS count FROM assets WHERE category_id = $1`,
        [id]
      );
      assetCount = countResult.rows[0].count;
    } catch {
      // assets table doesn't exist yet
    }

    res.json({
      success: true,
      data: {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        customFields: cat.custom_fields,
        assetCount,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
      },
      error: null,
    });
  } catch (err) {
    console.error('[Categories] Update error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { getAll, create, update };
