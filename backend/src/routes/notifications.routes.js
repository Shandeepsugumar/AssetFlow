/**
 * ============================================================
 * AssetFlow — Notifications Routes
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/notifications
 * Returns list of notifications or alerts for the user.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const mockNotifications = [
      {
        id: 1,
        category: 'Alerts',
        message: 'Asset AF-0012 marked as Damaged',
        time: '10m ago',
        severity: 'high',
      },
      {
        id: 2,
        category: 'Approvals',
        message: 'Laptop checkout request by Sarah Jenkins pending approval',
        time: '45m ago',
        severity: 'medium',
      },
      {
        id: 3,
        category: 'Bookings',
        message: 'Conference Room Alpha booked by Product Design team for 2:00 PM',
        time: '1h ago',
        severity: 'low',
      },
      {
        id: 4,
        category: 'Alerts',
        message: 'Temperature warning in Server Room C',
        time: '2h ago',
        severity: 'high',
      },
      {
        id: 5,
        category: 'Bookings',
        message: 'Testing Kit B reserved by Yukesh for July 15',
        time: '3h ago',
        severity: 'low',
      },
      {
        id: 6,
        category: 'Approvals',
        message: 'Disposal request for 5 obsolete monitors approved',
        time: '1d ago',
        severity: 'low',
      },
    ];

    res.json({
      success: true,
      data: mockNotifications,
      error: null,
    });
  } catch (err) {
    console.error('[Notifications] Error fetching notifications:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

module.exports = router;
