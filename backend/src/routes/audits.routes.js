const express = require('express');
const router = express.Router();
const auditsController = require('../controllers/audits.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// List all audit cycles
router.get('/', auditsController.getAll);

// Create a new audit cycle (Admin only for creation)
router.post('/', authorizeRoles('admin'), auditsController.create);

// Get specific cycle + items
router.get('/:id', auditsController.getById);

// Update item status
router.put('/:id/items/:itemId', auditsController.updateItem);

// Close cycle
router.post('/:id/close', authorizeRoles('admin', 'asset_manager'), auditsController.close);

module.exports = router;
