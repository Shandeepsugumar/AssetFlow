-- ============================================================
-- AssetFlow — Database Schema (PostgreSQL)
-- ============================================================
-- Run this migration FIRST before seeding or starting the server.
-- Other teammates will add their own tables (assets, bookings,
-- maintenance, audit) with FKs to these foundation tables.
-- ============================================================

-- Custom enum type for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'asset_manager', 'department_head', 'employee');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- USERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'employee',
  department_id   UUID,                          -- FK added after departments table
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- DEPARTMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(255) NOT NULL,
  description           TEXT DEFAULT '',
  parent_department_id  UUID REFERENCES departments(id) ON DELETE SET NULL,
  department_head_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Now add the FK from users -> departments
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS fk_users_department;
ALTER TABLE users
  ADD CONSTRAINT fk_users_department
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────
-- ASSET CATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  description     TEXT DEFAULT '',
  custom_fields   JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- PASSWORD RESET TOKENS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- ACTIVITY LOGS
-- ────────────────────────────────────────────────────────────
-- Generic activity log table used by ALL modules.
-- Other teammates should import logActivity() from
-- src/services/activityLog.service.js to write to this table.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity_type   VARCHAR(100),                    -- e.g. 'asset', 'booking', 'department'
  entity_id     UUID,                            -- ID of the related entity
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_departments_head ON departments(department_head_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);

-- ────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER FUNCTION
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_departments_updated_at ON departments;
CREATE TRIGGER set_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_asset_categories_updated_at ON asset_categories;
CREATE TRIGGER set_asset_categories_updated_at
  BEFORE UPDATE ON asset_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- ASSETS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag           VARCHAR(100) NOT NULL UNIQUE,
  name                VARCHAR(255) NOT NULL,
  category_id         UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
  serial_number       VARCHAR(100),
  acquisition_date    DATE,
  acquisition_cost    DECIMAL(12, 2),
  condition           VARCHAR(50) DEFAULT 'Good',
  location            VARCHAR(255),
  status              VARCHAR(50) DEFAULT 'Available', -- Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed
  is_bookable         BOOLEAN NOT NULL DEFAULT false,
  department_id       UUID REFERENCES departments(id) ON DELETE SET NULL,
  current_holder_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  photo_url           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for assets updated_at
DROP TRIGGER IF EXISTS set_assets_updated_at ON assets;
CREATE TRIGGER set_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- BOOKINGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id    UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  booked_by   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  status      VARCHAR(50) NOT NULL DEFAULT 'Upcoming', -- Upcoming, Ongoing, Completed, Cancelled
  purpose     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- MAINTENANCE REQUESTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id              UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  raised_by             UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  issue_description     TEXT NOT NULL,
  priority              VARCHAR(50) NOT NULL DEFAULT 'Medium', -- Low, Medium, High
  photo_url             TEXT,
  status                VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, In Progress, Resolved
  approved_by           UUID REFERENCES users(id) ON DELETE SET NULL,
  technician_assigned   VARCHAR(255),
  resolved_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                  VARCHAR(50) NOT NULL,
  message               TEXT NOT NULL,
  is_read               BOOLEAN NOT NULL DEFAULT false,
  related_entity_type   VARCHAR(100),
  related_entity_id     UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_department ON assets(department_id);
CREATE INDEX IF NOT EXISTS idx_assets_holder ON assets(current_holder_id);
CREATE INDEX IF NOT EXISTS idx_bookings_asset ON bookings(asset_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(booked_by);
CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON maintenance_requests(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_user ON maintenance_requests(raised_by);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = false;
