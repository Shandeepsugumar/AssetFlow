const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const assetsController = require('../controllers/assets.controller');

// Read assets - protected by authentication
router.get('/', authenticateToken, assetsController.getAll);
router.get('/:id', authenticateToken, assetsController.getById);

module.exports = router;
