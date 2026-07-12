/**
 * ============================================================
 * AssetFlow — Shared Asset Service (GAP 1)
 * ============================================================
 * Member 3 (maintenance) and Member 4 (notifications/audit)
 * should import and call updateStatus() rather than writing
 * their own inline UPDATE assets SET status = ... queries.
 *
 * Signature:
 *   updateStatus(assetId, newStatus, reason, userId, client?)
 *
 * @param {string}  assetId   - UUID of the asset to update
 * @param {string}  newStatus - Target status (e.g. 'Available', 'Allocated', 'Under Maintenance')
 * @param {string}  reason    - Human-readable reason for the change (written to activity_logs)
 * @param {string}  userId    - UUID of the user performing the action (for activity log)
 * @param {object} [dbClient] - Optional pg client from an existing transaction (pool.connect()).
 *                              If omitted, the shared pool is used directly.
 *                              Pass the client when calling inside BEGIN/COMMIT blocks.
 * @returns {object|null} The updated assets row, or null if not found.
 * ============================================================
 */

const db = require('../config/db');
const { logActivity } = require('./activityLog.service');

/**
 * Update asset status (and optionally current_holder_id) and log the action.
 * Works both inside and outside an existing transaction.
 */
async function updateStatus(assetId, newStatus, reason, userId = null, dbClient = null) {
  const executor = dbClient || db;

  // Fetch old status for the activity log detail
  const prevRes = await executor.query('SELECT name, asset_tag, status FROM assets WHERE id = $1', [assetId]);
  if (prevRes.rows.length === 0) {
    console.warn(`[AssetService] Asset with ID ${assetId} not found.`);
    return null;
  }
  const oldStatus = prevRes.rows[0].status;
  const assetName = prevRes.rows[0].name;
  const assetTag = prevRes.rows[0].asset_tag;

  const res = await executor.query(
    `UPDATE assets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [newStatus, assetId]
  );

  if (res.rows.length === 0) return null;

  const logMsg = `Asset "${assetName}" (${assetTag}) status changed from "${oldStatus}" to "${newStatus}"${reason ? ` — ${reason}` : ''}`;

  // Activity log uses the pool directly (it's a non-transactional side-effect log)
  await logActivity({
    userId,
    action: logMsg,
    entityType: 'asset',
    entityId: assetId,
  });

  return res.rows[0];
}

/**
 * Update current_holder_id on an asset (call after updateStatus to keep in sync).
 */
async function setHolder(assetId, holderId, dbClient = null) {
  const executor = dbClient || db;
  await executor.query(
    `UPDATE assets SET current_holder_id = $1, updated_at = NOW() WHERE id = $2`,
    [holderId, assetId]
  );
}

module.exports = { updateStatus, setHolder };
