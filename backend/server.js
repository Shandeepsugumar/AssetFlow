require('dotenv').config();

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

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
const notificationsRoutes = require('./src/routes/notifications.routes');
const assetRoutes = require('./src/routes/assets.routes');
const allocationRoutes = require('./src/routes/allocations.routes');
const transferRoutes = require('./src/routes/transfers.routes');
const bookingRoutes = require('./src/routes/bookings.routes');
const maintenanceRoutes = require('./src/routes/maintenance.routes');
const reportsRoutes = require('./src/routes/reports.routes');
const auditsRoutes = require('./src/routes/audits.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────────────
// Allowed origins: local dev + production Vercel frontend
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://asset-flow-nu.vercel.app',
];

// Safety-net: inject CORS headers on every response BEFORE any other middleware.
// This ensures headers are present even if a later middleware throws and the
// cors() package never gets a chance to set them (e.g. Render cold-start crash).
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Same-origin or server-to-server — allow
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,X-Requested-With,Accept,Origin'
  );
  // Short-circuit preflight immediately — no further processing needed
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads (asset photos & documents)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/notifications', notificationsRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audits', auditsRoutes);

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
// Verify DB connectivity before binding to port — fail fast with clear message
const db = require('./src/config/db');
db.query('SELECT 1')
  .then(() => {
    console.log('[DB] Database connection verified.');
    app.listen(PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════════╗
  ║   AssetFlow API Server                       ║
  ║   Running on http://localhost:${PORT}/api       ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
  ╚══════════════════════════════════════════════╝
      `);
    });
  })
  .catch((err) => {
    console.error('[FATAL] Cannot connect to database:', err.message);
    console.error('DATABASE_URL set?', !!process.env.DATABASE_URL);
    process.exit(1);
  });

module.exports = app;
