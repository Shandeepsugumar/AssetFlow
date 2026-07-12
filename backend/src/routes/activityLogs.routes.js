const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const dashController = require('../controllers/dashboard.controller');

// Recent activity logs — any authenticated user
router.get('/recent', authenticateToken, dashController.getRecentActivity);

module.exports = router;
