const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const dashController = require('../controllers/dashboard.controller');

// Both endpoints are protected (any authenticated user)
router.get('/', authenticateToken, dashController.getStats);

module.exports = router;
