/**
 * ============================================================
 * AssetFlow — Activity Log Service
 * ============================================================
 * EXPORTED FOR REUSE by all module routes/controllers:
 *   const { logActivity } = require('../services/activityLog.service');
 *
 * Usage:
 *   await logActivity({
 *     userId: req.user.id,             // nullable
 *     action: 'Laptop AF-0114 allocated to Priya Shah',
 *     entityType: 'asset',             // e.g. 'asset', 'booking', 'department'
 *     entityId: assetId,               // UUID of the related entity (nullable)
 *   });
 *
 * This writes a single row to the activity_logs table.
 * Errors are caught and logged — they never bubble up to crash
 * the calling endpoint.
 * ============================================================
 */

const db = require('../config/db');

/**
 * Log an activity to the activity_logs table.
 * @param {Object} params
 * @param {string|null} params.userId    - UUID of the user performing the action
 * @param {string}      params.action    - Human-readable description of what happened
 * @param {string|null} params.entityType - Type of entity (e.g. 'asset', 'booking')
 * @param {string|null} params.entityId  - UUID of the related entity
 */
async function logActivity({ userId = null, action, entityType = null, entityId = null }) {
  try {
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, action, entityType, entityId]
    );
  } catch (err) {
    // Never let logging failures crash the main operation
    console.error('[ActivityLog] Failed to log activity:', err.message);
  }
}

module.exports = { logActivity };
