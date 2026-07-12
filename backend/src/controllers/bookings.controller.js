/**
 * ============================================================
 * AssetFlow — Bookings Controller
 * ============================================================
 * Handles resource bookings, overlap validation, and scoping.
 * ============================================================
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLog.service');
const notificationService = require('../services/notification.service');

function getComputedStatus(booking) {
  if (booking.status === 'Cancelled') return 'Cancelled';
  const now = new Date();
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  if (start > now) return 'Upcoming';
  if (start <= now && end >= now) return 'Ongoing';
  return 'Completed';
}

async function create(req, res) {
  try {
    const { assetId, startTime, endTime, purpose } = req.body;
    const bookedBy = req.user.id;

    if (!assetId || !startTime || !endTime) {
      return res.status(400).json({ success: false, data: null, error: 'Asset, start time, and end time are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ success: false, data: null, error: 'Start time must be before end time' });
    }

    if (start < new Date()) {
      return res.status(400).json({ success: false, data: null, error: 'Booking start time must be in the future' });
    }

    // Verify asset is bookable
    const assetCheck = await db.query('SELECT * FROM assets WHERE id = $1', [assetId]);
    if (assetCheck.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Asset not found' });
    }

    const asset = assetCheck.rows[0];
    if (!asset.is_bookable) {
      return res.status(400).json({ success: false, data: null, error: 'This asset is not marked as bookable' });
    }

    if (asset.status === 'Under Maintenance' || asset.status === 'Lost' || asset.status === 'Retired' || asset.status === 'Disposed') {
      return res.status(400).json({ success: false, data: null, error: `This asset is currently ${asset.status} and cannot be booked` });
    }

    // Overlap validation
    // start_time < requested_end AND end_time > requested_start
    const overlapCheck = await db.query(
      `SELECT * FROM bookings
       WHERE asset_id = $1
         AND status != 'Cancelled'
         AND start_time < $3
         AND end_time > $2`,
      [assetId, start, end]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'The requested slot overlaps with an existing booking for this resource.',
      });
    }

    // Create booking
    const result = await db.query(
      `INSERT INTO bookings (asset_id, booked_by, start_time, end_time, status, purpose)
       VALUES ($1, $2, $3, $4, 'Upcoming', $5)
       RETURNING *`,
      [assetId, bookedBy, start, end, purpose || '']
    );

    const booking = result.rows[0];
    const computedStatus = getComputedStatus(booking);

    await logActivity({
      userId: bookedBy,
      action: `Resource "${asset.name}" booked for ${start.toLocaleString()} - ${end.toLocaleString()}`,
      entityType: 'booking',
      entityId: booking.id,
    });

    // Notify user
    await notificationService.create({
      userId: bookedBy,
      type: 'booking',
      message: `Your booking for "${asset.name}" on ${start.toLocaleDateString()} has been scheduled.`,
      relatedEntityType: 'booking',
      relatedEntityId: booking.id,
    });

    res.status(201).json({
      success: true,
      data: {
        ...booking,
        status: computedStatus,
      },
      error: null,
    });
  } catch (err) {
    console.error('[Bookings] Create error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function getAll(req, res) {
  try {
    const { id: userId, role, department_id: deptId } = req.user;
    const { assetId } = req.query;

    let query = `
      SELECT b.*, a.name AS asset_name, a.asset_tag, u.name AS booked_by_name
      FROM bookings b
      JOIN assets a ON b.asset_id = a.id
      JOIN users u ON b.booked_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (assetId) {
      query += ` AND b.asset_id = $${paramIdx}`;
      params.push(assetId);
      paramIdx++;
    }

    // Role-based scoping
    if (role === 'employee') {
      query += ` AND b.booked_by = $${paramIdx}`;
      params.push(userId);
      paramIdx++;
    } else if (role === 'department_head') {
      // Booked by department members OR for assets of this department
      query += ` AND (u.department_id = $${paramIdx} OR a.department_id = $${paramIdx})`;
      params.push(deptId);
      paramIdx++;
    }

    query += ` ORDER BY b.start_time ASC`;

    const result = await db.query(query, params);
    const bookings = result.rows.map((row) => ({
      id: row.id,
      assetId: row.asset_id,
      assetName: row.asset_name,
      assetTag: row.asset_tag,
      bookedBy: row.booked_by,
      bookedByName: row.booked_by_name,
      startTime: row.start_time,
      endTime: row.end_time,
      status: getComputedStatus(row),
      purpose: row.purpose,
      createdAt: row.created_at,
    }));

    res.json({ success: true, data: bookings, error: null });
  } catch (err) {
    console.error('[Bookings] GetAll error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function cancel(req, res) {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const bookingCheck = await db.query(
      `SELECT b.*, a.name AS asset_name FROM bookings b
       JOIN assets a ON b.asset_id = a.id
       WHERE b.id = $1`,
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Booking not found' });
    }

    const booking = bookingCheck.rows[0];

    // Access check: only owner, manager, or admin can cancel
    if (role === 'employee' && booking.booked_by !== userId) {
      return res.status(403).json({ success: false, data: null, error: 'You do not have permission to cancel this booking' });
    }

    // Cancel in DB
    await db.query(`UPDATE bookings SET status = 'Cancelled' WHERE id = $1`, [id]);

    await logActivity({
      userId,
      action: `Booking for "${booking.asset_name}" was cancelled`,
      entityType: 'booking',
      entityId: id,
    });

    // Notify user
    await notificationService.create({
      userId: booking.booked_by,
      type: 'booking',
      message: `Your booking for "${booking.asset_name}" has been cancelled.`,
      relatedEntityType: 'booking',
      relatedEntityId: id,
    });

    res.json({ success: true, data: { id, status: 'Cancelled' }, error: null });
  } catch (err) {
    console.error('[Bookings] Cancel error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function reschedule(req, res) {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;
    const { id: userId, role } = req.user;

    if (!startTime || !endTime) {
      return res.status(400).json({ success: false, data: null, error: 'Start time and end time are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ success: false, data: null, error: 'Start time must be before end time' });
    }

    if (start < new Date()) {
      return res.status(400).json({ success: false, data: null, error: 'Rescheduled start time must be in the future' });
    }

    const bookingCheck = await db.query(
      `SELECT b.*, a.name AS asset_name FROM bookings b
       JOIN assets a ON b.asset_id = a.id
       WHERE b.id = $1`,
      [id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Booking not found' });
    }

    const booking = bookingCheck.rows[0];

    // Access check: only owner, manager, or admin can reschedule
    if (role === 'employee' && booking.booked_by !== userId) {
      return res.status(403).json({ success: false, data: null, error: 'You do not have permission to reschedule this booking' });
    }

    // Overlap validation (exclude current booking)
    const overlapCheck = await db.query(
      `SELECT * FROM bookings
       WHERE asset_id = $1
         AND id != $2
         AND status != 'Cancelled'
         AND start_time < $4
         AND end_time > $3`,
      [booking.asset_id, id, start, end]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'The requested slot overlaps with an existing booking.',
      });
    }

    // Update times
    const result = await db.query(
      `UPDATE bookings
       SET start_time = $1, end_time = $2
       WHERE id = $3
       RETURNING *`,
      [start, end, id]
    );

    const updatedBooking = result.rows[0];

    await logActivity({
      userId,
      action: `Booking for "${booking.asset_name}" rescheduled to ${start.toLocaleString()} - ${end.toLocaleString()}`,
      entityType: 'booking',
      entityId: id,
    });

    // Notify user
    await notificationService.create({
      userId: booking.booked_by,
      type: 'booking',
      message: `Your booking for "${booking.asset_name}" has been rescheduled to ${start.toLocaleDateString()}.`,
      relatedEntityType: 'booking',
      relatedEntityId: id,
    });

    res.json({
      success: true,
      data: {
        ...updatedBooking,
        status: getComputedStatus(updatedBooking),
      },
      error: null,
    });
  } catch (err) {
    console.error('[Bookings] Reschedule error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

async function getActiveCount(req, res) {
  try {
    const { id: userId, role, department_id: deptId } = req.user;
    const now = new Date();

    let query = `
      SELECT COUNT(*)::int AS count
      FROM bookings b
      JOIN assets a ON b.asset_id = a.id
      JOIN users u ON b.booked_by = u.id
      WHERE b.status != 'Cancelled'
        AND b.start_time <= $1
        AND b.end_time >= $1
    `;
    const params = [now];
    let paramIdx = 2;

    if (role === 'employee') {
      query += ` AND b.booked_by = $${paramIdx}`;
      params.push(userId);
      paramIdx++;
    } else if (role === 'department_head') {
      query += ` AND (u.department_id = $${paramIdx} OR a.department_id = $${paramIdx})`;
      params.push(deptId);
      paramIdx++;
    }

    const result = await db.query(query, params);
    res.json({ success: true, data: { count: result.rows[0].count }, error: null });
  } catch (err) {
    console.error('[Bookings] GetActiveCount error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { create, getAll, cancel, reschedule, getActiveCount };
