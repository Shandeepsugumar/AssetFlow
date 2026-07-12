const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const transfersController = require('../controllers/transfers.controller');

// Any authenticated user can request a transfer (triggered from conflict flow)
router.post('/', authenticateToken, transfersController.create);
router.get('/', authenticateToken, transfersController.getAll);

// Approve / reject require elevated role
router.patch('/:id/approve', authenticateToken, authorizeRoles('admin', 'asset_manager', 'department_head'), transfersController.approve);
router.patch('/:id/reject', authenticateToken, authorizeRoles('admin', 'asset_manager', 'department_head'), transfersController.reject);

module.exports = router;
