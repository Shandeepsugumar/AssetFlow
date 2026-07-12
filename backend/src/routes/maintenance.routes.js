const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const maintenanceController = require('../controllers/maintenance.controller');

// Create and Read available to any authenticated user
router.post('/', authenticateToken, maintenanceController.create);
router.get('/', authenticateToken, maintenanceController.getAll);
router.get('/today-count', authenticateToken, maintenanceController.getTodayCount);

// Workflow transitions restricted to Admin and Asset Managers
router.patch('/:id/approve', authenticateToken, authorizeRoles('admin', 'asset_manager'), maintenanceController.approve);
router.patch('/:id/reject', authenticateToken, authorizeRoles('admin', 'asset_manager'), maintenanceController.reject);
router.patch('/:id/assign', authenticateToken, authorizeRoles('admin', 'asset_manager'), maintenanceController.assign);
router.patch('/:id/resolve', authenticateToken, authorizeRoles('admin', 'asset_manager'), maintenanceController.resolve);

module.exports = router;
