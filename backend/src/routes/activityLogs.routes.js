const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const activityLogsController = require('../controllers/activityLogs.controller');

router.get('/', authenticateToken, activityLogsController.getAllLogs);
router.get('/recent', authenticateToken, activityLogsController.getRecentLogs);

module.exports = router;
