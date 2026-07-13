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
// In production: auto-run migrations so Render always has all tables.
// In development: just verify connectivity.
const db = require('./src/config/db');
const fs = require('path');

async function startServer() {
  // 1. Verify DB connectivity
  await db.query('SELECT 1');
  console.log('[DB] Database connection verified.');

  // 2. Auto-migrate in production (idempotent — CREATE IF NOT EXISTS)
  if (process.env.NODE_ENV === 'production') {
    try {
      const schemaPath = require('path').join(__dirname, 'src/db/schema.sql');
      const sql = require('fs').readFileSync(schemaPath, 'utf8');
      await db.query(sql);
      console.log('[DB] Schema migration applied.');

      // Also apply audit tables migration
      const auditSql = `
        CREATE TABLE IF NOT EXISTS audit_cycles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
          scope_location VARCHAR(255),
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          start_date DATE,
          end_date DATE,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS audit_cycle_auditors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          cycle_id UUID NOT NULL REFERENCES audit_cycles(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(cycle_id, user_id)
        );
        CREATE TABLE IF NOT EXISTS audit_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          cycle_id UUID NOT NULL REFERENCES audit_cycles(id) ON DELETE CASCADE,
          asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
          asset_tag VARCHAR(100),
          asset_name VARCHAR(255),
          expected_location VARCHAR(255),
          verification_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
          notes TEXT,
          verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
          verified_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          used BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await db.query(auditSql);
      console.log('[DB] Audit tables ensured.');
    } catch (migErr) {
      console.error('[DB] Migration warning (non-fatal):', migErr.message);
    }
  }

  // 3. Start listening
  app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║   AssetFlow API Server                       ║
  ║   Running on http://localhost:${PORT}/api       ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
  ╚══════════════════════════════════════════════╝
    `);
  });
}

startServer().catch((err) => {
  console.error('[FATAL] Cannot connect to database:', err.message);
  console.error('DATABASE_URL set?', !!process.env.DATABASE_URL);
  process.exit(1);
});

module.exports = app;

