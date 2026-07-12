const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const catController = require('../controllers/categories.controller');

// GET — any authenticated user
router.get('/', authenticateToken, catController.getAll);

// POST, PUT — Admin only
router.post('/', authenticateToken, authorizeRoles('admin'), catController.create);
router.put('/:id', authenticateToken, authorizeRoles('admin'), catController.update);

module.exports = router;
