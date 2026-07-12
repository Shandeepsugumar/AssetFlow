const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const empController = require('../controllers/employees.controller');

// GET — any authenticated user (with search/filter/pagination)
router.get('/', authenticateToken, empController.getAll);

// ⚠️ ROLE CHANGE — Admin ONLY
// This is the ONLY endpoint in the entire system that changes a user's role.
router.patch('/:id/role', authenticateToken, authorizeRoles('admin'), empController.updateRole);

// Deactivate — Admin only
router.patch('/:id/deactivate', authenticateToken, authorizeRoles('admin'), empController.deactivate);

module.exports = router;
