const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const reportsController = require('../controllers/reports.controller');

// Only allow elevated roles to view reports
router.use(authenticateToken);
router.use(authorizeRoles('admin', 'asset_manager', 'department_head'));

router.get('/utilization', reportsController.getUtilization);
router.get('/maintenance', reportsController.getMaintenance);
router.get('/export', reportsController.exportCSV);

module.exports = router;
