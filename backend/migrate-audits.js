const db = require('./src/config/db');
const sql = `
CREATE TABLE IF NOT EXISTS audit_cycles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  scope_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  scope_location      VARCHAR(255),
  start_date          DATE NOT NULL,
  end_date            DATE,
  status              VARCHAR(50) NOT NULL DEFAULT 'Active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_audit_cycles_updated_at ON audit_cycles;
CREATE TRIGGER set_audit_cycles_updated_at
  BEFORE UPDATE ON audit_cycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS audit_cycle_auditors (
  audit_cycle_id UUID NOT NULL REFERENCES audit_cycles(id) ON DELETE CASCADE,
  auditor_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (audit_cycle_id, auditor_id)
);

CREATE TABLE IF NOT EXISTS audit_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_cycle_id      UUID NOT NULL REFERENCES audit_cycles(id) ON DELETE CASCADE,
  asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  verification_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_audit_items_updated_at ON audit_items;
CREATE TRIGGER set_audit_items_updated_at
  BEFORE UPDATE ON audit_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_audit_cycles_status ON audit_cycles(status);
CREATE INDEX IF NOT EXISTS idx_audit_items_cycle ON audit_items(audit_cycle_id);
CREATE INDEX IF NOT EXISTS idx_audit_items_status ON audit_items(verification_status);
`;
async function migrate() {
  try {
    await db.query(sql);
    console.log('Migration successful');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}
migrate();
