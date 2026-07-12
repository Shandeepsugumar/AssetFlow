/**
 * ============================================================
 * AssetFlow — Express Server Entry Point
 * ============================================================
 * Starts the API server with all routes mounted.
 *
 * Default: http://localhost:5000/api
 *
 * Setup:
 *   1. Create PostgreSQL database: CREATE DATABASE assetflow;
 *   2. Copy .env.example to .env and configure
 *   3. npm run db:migrate   (creates tables)
 *   4. npm run db:seed      (seeds default admin + sample data)
 *   5. npm run dev           (starts server with --watch)
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const departmentRoutes = require('./src/routes/departments.routes');
const categoryRoutes = require('./src/routes/categories.routes');
const employeeRoutes = require('./src/routes/employees.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const activityLogRoutes = require('./src/routes/activityLogs.routes');
const bookingRoutes = require('./src/routes/bookings.routes');
const maintenanceRoutes = require('./src/routes/maintenance.routes');
const assetRoutes = require('./src/routes/assets.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() }, error: null });
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/assets', assetRoutes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: 'Endpoint not found',
  });
});

// ── Global Error Handler (must be last) ─────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   AssetFlow API Server                       ║
  ║   Running on http://localhost:${PORT}/api       ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
  ╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
