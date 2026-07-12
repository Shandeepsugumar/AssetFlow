const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const assetsController = require('../controllers/assets.controller');
const upload = require('../middleware/upload');

// All routes require authentication
router.get('/', authenticateToken, assetsController.getAll);
router.get('/:id/history', authenticateToken, assetsController.getHistory);
router.get('/:id', authenticateToken, assetsController.getById);

// Create asset — Asset Manager or Admin only, accepts multipart/form-data for photo/document
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'asset_manager'),
  upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'document', maxCount: 1 }]),
  assetsController.create
);

// Update asset — Asset Manager or Admin only
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'asset_manager'),
  upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'document', maxCount: 1 }]),
  assetsController.update
);

module.exports = router;
