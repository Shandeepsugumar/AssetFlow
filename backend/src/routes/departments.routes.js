const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const deptController = require('../controllers/departments.controller');

// GET — any authenticated user (used for dropdowns across the app)
router.get('/', authenticateToken, deptController.getAll);

// POST, PUT, PATCH — Admin only
router.post('/', authenticateToken, authorizeRoles('admin'), deptController.create);
router.put('/:id', authenticateToken, authorizeRoles('admin'), deptController.update);
router.patch('/:id/deactivate', authenticateToken, authorizeRoles('admin'), deptController.deactivate);

module.exports = router;
