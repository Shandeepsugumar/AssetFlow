/**
 * ============================================================
 * AssetFlow — Activity Logs Controller
 * ============================================================
 */

const db = require('../config/db');

// ── GET /api/activity-logs ──────────────────────────────────
async function getAllLogs(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT al.*, al.action as message, u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    
    // Get total count for pagination
    const countRes = await db.query('SELECT COUNT(*) FROM activity_logs');
    const total = parseInt(countRes.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      },
      error: null
    });
  } catch (err) {
    console.error('[ActivityLogs] getAllLogs error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── GET /api/activity-logs/recent ────────────────────────────
async function getRecentLogs(req, res) {
  try {
    const query = `
      SELECT al.*, al.action as message, u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows, error: null });
  } catch (err) {
    console.error('[ActivityLogs] getRecentLogs error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { getAllLogs, getRecentLogs };
