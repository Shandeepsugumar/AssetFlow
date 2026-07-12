const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const auditsController = require('../controllers/audits.controller');

// Only allow elevated roles to view and perform audits
router.use(authenticateToken);
router.use(authorizeRoles('admin', 'asset_manager', 'department_head'));

router.get('/', auditsController.getAll);

module.exports = router;
