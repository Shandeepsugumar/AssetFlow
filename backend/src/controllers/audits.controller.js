/**
 * ============================================================
 * AssetFlow — Audits Controller (Member 4)
 * ============================================================
 */

const db = require('../config/db');

// ── GET /api/audits ─────────────────────────────────────────
async function getAll(req, res) {
  try {
    // For the audit module, we fetch all active assets and map them to the expected frontend structure
    const query = `
      SELECT id, asset_tag, name, location 
      FROM assets 
      WHERE status NOT IN ('Retired', 'Disposed', 'Lost')
      ORDER BY created_at DESC
      LIMIT 100
    `;
    const result = await db.query(query);

    const auditItems = result.rows.map(asset => ({
      // The frontend uses "id" for both the key and the display string. 
      // We'll map the asset_tag to id so it renders nicely like "AF-0012", 
      // but in a real system we'd use the UUID for updates.
      id: asset.asset_tag || asset.id.substring(0, 8), 
      name: asset.name,
      expectedLocation: asset.location || 'Unknown Location',
      status: 'pending' // Default audit state
    }));

    res.json({ success: true, data: auditItems, error: null });
  } catch (err) {
    console.error('[Audits] getAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { getAll };
