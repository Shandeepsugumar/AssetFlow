/**
 * ============================================================
 * AssetFlow — Shared Asset Service
 * ============================================================
 * Handles asset status transitions.
 * ============================================================
 */

const db = require('../config/db');
const { logActivity } = require('./activityLog.service');

/**
 * Update asset status and log the action.
 * @param {string} assetId - UUID of the asset
 * @param {string} newStatus - New status (e.g. 'Available', 'Under Maintenance')
 * @param {string} reason - Action log reason
 * @param {string|null} userId - User UUID executing the change
 */
async function updateStatus(assetId, newStatus, reason, userId = null) {
  try {
    const res = await db.query(
      `UPDATE assets
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [newStatus, assetId]
    );

    if (res.rows.length === 0) {
      console.warn(`[AssetService] Asset with ID ${assetId} not found.`);
      return null;
    }

    const asset = res.rows[0];

    await logActivity({
      userId,
      action: `Asset "${asset.name}" (${asset.asset_tag}) status updated to "${newStatus}"${reason ? `: ${reason}` : ''}`,
      entityType: 'asset',
      entityId: assetId,
    });

    return asset;
  } catch (err) {
    console.error('[AssetService] Update status failed:', err.message);
    throw err;
  }
}

module.exports = { updateStatus };
