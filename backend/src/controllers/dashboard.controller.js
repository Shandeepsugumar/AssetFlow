/**
 * ============================================================
 * AssetFlow — Dashboard Controller
 * ============================================================
 * GET /api/dashboard             — Role-scoped KPI counts
 * GET /api/activity-logs/recent  — Last 10 activity log entries
 *
 * NOTE: KPI counts query against tables owned by other modules
 * (assets, bookings, maintenance_requests, transfers). Each
 * query is wrapped in try/catch — if a table doesn't exist yet,
 * that metric returns 0 instead of crashing.
 * ============================================================
 */

const db = require('../config/db');

/**
 * GET /api/dashboard
 * Scoping:
 *   - Admin / Asset Manager → org-wide counts
 *   - Department Head → department-scoped counts
 *   - Employee → personal counts only
 */
async function getStats(req, res) {
  try {
    const { role, id: userId, department_id } = req.user;
    const isOrgWide = role === 'admin' || role === 'asset_manager';
    const isDeptHead = role === 'department_head';

    const stats = {
      assetsAvailable: 0,
      assetsAllocated: 0,
      maintenanceToday: 0,
      activeBookings: 0,
      pendingTransfers: 0,
      upcomingReturns: 0,
      overdueReturns: 0,
    };

    // ── Assets Available ────────────────────────────────
    // Counts assets with status = 'available' (assets table owned by Member 2)
    try {
      let q = `SELECT COUNT(*)::int AS count FROM assets WHERE status = 'available'`;
      const params = [];
      if (isDeptHead && department_id) {
        q += ` AND department_id = $1`;
        params.push(department_id);
      } else if (!isOrgWide) {
        q += ` AND assigned_to = $1`;
        params.push(userId);
      }
      const r = await db.query(q, params);
      stats.assetsAvailable = r.rows[0].count;
    } catch { /* table doesn't exist yet */ }

    // ── Assets Allocated ────────────────────────────────
    try {
      let q = `SELECT COUNT(*)::int AS count FROM assets WHERE status = 'allocated'`;
      const params = [];
      if (isDeptHead && department_id) {
        q += ` AND department_id = $1`;
        params.push(department_id);
      } else if (!isOrgWide) {
        q += ` AND assigned_to = $1`;
        params.push(userId);
      }
      const r = await db.query(q, params);
      stats.assetsAllocated = r.rows[0].count;
    } catch { /* table doesn't exist yet */ }

    // ── Maintenance Today ───────────────────────────────
    try {
      let q = `SELECT COUNT(*)::int AS count FROM maintenance_requests
               WHERE DATE(scheduled_date) = CURRENT_DATE`;
      const params = [];
      if (isDeptHead && department_id) {
        q += ` AND department_id = $1`;
        params.push(department_id);
      } else if (!isOrgWide) {
        q += ` AND requested_by = $1`;
        params.push(userId);
      }
      const r = await db.query(q, params);
      stats.maintenanceToday = r.rows[0].count;
    } catch { /* table doesn't exist yet */ }

    // ── Active Bookings ─────────────────────────────────
    try {
      let q = `SELECT COUNT(*)::int AS count FROM bookings
               WHERE status = 'active' AND end_time > NOW()`;
      const params = [];
      if (isDeptHead && department_id) {
        q += ` AND department_id = $1`;
        params.push(department_id);
      } else if (!isOrgWide) {
        q += ` AND booked_by = $1`;
        params.push(userId);
      }
      const r = await db.query(q, params);
      stats.activeBookings = r.rows[0].count;
    } catch { /* table doesn't exist yet */ }

    // ── Pending Transfers ───────────────────────────────
    try {
      let q = `SELECT COUNT(*)::int AS count FROM transfers WHERE status = 'pending'`;
      const params = [];
      if (isDeptHead && department_id) {
        q += ` AND (from_department_id = $1 OR to_department_id = $1)`;
        params.push(department_id);
      } else if (!isOrgWide) {
        q += ` AND (requested_by = $1 OR approved_by = $1)`;
        params.push(userId);
      }
      const r = await db.query(q, params);
      stats.pendingTransfers = r.rows[0].count;
    } catch { /* table doesn't exist yet */ }

    // ── Upcoming Returns (next 7 days) ──────────────────
    try {
      let q = `SELECT COUNT(*)::int AS count FROM allocations
               WHERE return_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
               AND status = 'active'`;
      const params = [];
      if (isDeptHead && department_id) {
        q += ` AND department_id = $1`;
        params.push(department_id);
      } else if (!isOrgWide) {
        q += ` AND allocated_to = $1`;
        params.push(userId);
      }
      const r = await db.query(q, params);
      stats.upcomingReturns = r.rows[0].count;
    } catch { /* table doesn't exist yet */ }

    // ── Overdue Returns ─────────────────────────────────
    try {
      let q = `SELECT COUNT(*)::int AS count FROM allocations
               WHERE return_date < NOW() AND status = 'active'`;
      const params = [];
      if (isDeptHead && department_id) {
        q += ` AND department_id = $1`;
        params.push(department_id);
      } else if (!isOrgWide) {
        q += ` AND allocated_to = $1`;
        params.push(userId);
      }
      const r = await db.query(q, params);
      stats.overdueReturns = r.rows[0].count;
    } catch { /* table doesn't exist yet */ }

    res.json({ success: true, data: stats, error: null });
  } catch (err) {
    console.error('[Dashboard] GetStats error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

/**
 * GET /api/activity-logs/recent
 * Returns the last 10 activity log entries, most recent first.
 * Returns an empty array (not an error) if the table is empty.
 */
async function getRecentActivity(req, res) {
  try {
    const result = await db.query(
      `SELECT al.id, al.action AS message, al.entity_type AS type,
              al.created_at AS timestamp, u.name AS user_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 10`
    );

    res.json({ success: true, data: result.rows, error: null });
  } catch (err) {
    console.error('[Dashboard] GetRecentActivity error:', err.message);
    // Return empty array instead of error — defensive
    res.json({ success: true, data: [], error: null });
  }
}

module.exports = { getStats, getRecentActivity };
