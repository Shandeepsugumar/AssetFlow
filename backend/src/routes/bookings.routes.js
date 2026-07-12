const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const bookingsController = require('../controllers/bookings.controller');

// All booking routes are protected by authentication
router.post('/', authenticateToken, bookingsController.create);
router.get('/', authenticateToken, bookingsController.getAll);
router.get('/active-count', authenticateToken, bookingsController.getActiveCount);
router.patch('/:id/cancel', authenticateToken, bookingsController.cancel);
router.patch('/:id/reschedule', authenticateToken, bookingsController.reschedule);

module.exports = router;
