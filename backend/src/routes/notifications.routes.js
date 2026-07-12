/**
 * ============================================================
 * AssetFlow — Notifications Routes
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const notificationsController = require('../controllers/notifications.controller');

/**
 * GET /api/notifications
 * Returns list of real-time notifications or alerts for the user.
 */
router.get('/', authenticateToken, notificationsController.getMyNotifications);

module.exports = router;
