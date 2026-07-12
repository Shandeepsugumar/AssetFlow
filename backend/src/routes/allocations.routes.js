const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const allocationsController = require('../controllers/allocations.controller');

router.get('/overdue', authenticateToken, allocationsController.getOverdue);
router.get('/', authenticateToken, allocationsController.getAll);
router.post('/', authenticateToken, authorizeRoles('admin', 'asset_manager', 'department_head'), allocationsController.allocate);
router.post('/:id/return', authenticateToken, authorizeRoles('admin', 'asset_manager', 'department_head'), allocationsController.returnAsset);

module.exports = router;
