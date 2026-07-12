/**
 * ============================================================
 * AssetFlow — Notifications Controller
 * ============================================================
 */

const db = require('../config/db');

// ── GET /api/notifications ───────────────────────────────────
async function getMyNotifications(req, res) {
  try {
    const userId = req.user.id;

    // Fetch user's notifications
    const query = `
      SELECT id, type, message, is_read, created_at 
      FROM notifications 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const result = await db.query(query, [userId]);

    // Format for the frontend
    const notifications = result.rows.map(n => {
      // Calculate a rough "time ago" string
      const diffMs = Date.now() - new Date(n.created_at).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo = 'Just now';
      if (diffDays > 0) timeAgo = `${diffDays}d ago`;
      else if (diffHours > 0) timeAgo = `${diffHours}h ago`;
      else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

      // Map type to category and severity
      let category = 'Alerts';
      let severity = 'medium';

      if (n.type.toLowerCase().includes('allocation') || n.type.toLowerCase().includes('booking')) {
        category = 'Bookings';
        severity = 'low';
      } else if (n.type.toLowerCase().includes('maintenance') || n.type.toLowerCase().includes('damaged')) {
        category = 'Alerts';
        severity = 'high';
      } else if (n.type.toLowerCase().includes('approve') || n.type.toLowerCase().includes('request')) {
        category = 'Approvals';
        severity = 'medium';
      }

      return {
        id: n.id,
        category,
        message: n.message,
        time: timeAgo,
        severity,
        isRead: n.is_read
      };
    });

    res.json({ success: true, data: notifications, error: null });
  } catch (err) {
    console.error('[Notifications] getMyNotifications error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { getMyNotifications };
