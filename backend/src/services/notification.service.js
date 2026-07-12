/**
 * ============================================================
 * AssetFlow — Shared Notification Service
 * ============================================================
 * Handles creating user notifications.
 * ============================================================
 */

const db = require('../config/db');

/**
 * Create a notification for a user.
 * @param {Object} params
 * @param {string} params.userId - UUID of target user
 * @param {string} params.type - Notification category (e.g. 'booking', 'maintenance')
 * @param {string} params.message - Notification description text
 * @param {string|null} params.relatedEntityType - Related table type
 * @param {string|null} params.relatedEntityId - Related entity UUID
 */
async function create({ userId, type, message, relatedEntityType = null, relatedEntityId = null }) {
  try {
    const res = await db.query(
      `INSERT INTO notifications (user_id, type, message, is_read, related_entity_type, related_entity_id)
       VALUES ($1, $2, $3, false, $4, $5)
       RETURNING *`,
      [userId, type, message, relatedEntityType, relatedEntityId]
    );

    return res.rows[0];
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err.message);
    return null;
  }
}

module.exports = { create };
