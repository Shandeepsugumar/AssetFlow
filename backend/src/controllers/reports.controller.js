/**
 * ============================================================
 * AssetFlow — Reports Controller (Member 4)
 * ============================================================
 */

const db = require('../config/db');

// ── GET /api/reports/utilization ────────────────────────────
async function getUtilization(req, res) {
  try {
    const totalRes = await db.query('SELECT COUNT(*) as count FROM assets');
    const allocatedRes = await db.query(`SELECT COUNT(*) as count FROM assets WHERE status = 'Allocated'`);
    const availableRes = await db.query(`SELECT COUNT(*) as count FROM assets WHERE status = 'Available'`);
    const retiredRes = await db.query(`SELECT COUNT(*) as count FROM assets WHERE status = 'Retired'`);
    
    const total = parseInt(totalRes.rows[0].count) || 0;
    const allocated = parseInt(allocatedRes.rows[0].count) || 0;
    const available = parseInt(availableRes.rows[0].count) || 0;
    const retired = parseInt(retiredRes.rows[0].count) || 0;

    const allocPercent = total > 0 ? ((allocated / total) * 100).toFixed(1) : 0;

    const data = {
      monthlyValues: [40, 65, 50, 85, 70, 95, allocPercent], 
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      
      mostUsedDescription: total > 0 
        ? `Currently, ${allocated} out of ${total} total assets are actively allocated.`
        : 'No assets registered in the system yet.',
      mostUsedStat: `${allocPercent}% Active`,

      idleDescription: available > 0
        ? `There are ${available} assets currently sitting idle and available for allocation.`
        : 'No idle assets available.',
      idleStat: `${available} Available`,

      nearingRetirementDescription: retired > 0
        ? `${retired} assets have been marked as retired.`
        : 'No assets are currently marked as retired.',
      nearingRetirementStat: `${retired} Retired`,
    };

    res.json({ success: true, data, error: null });
  } catch (err) {
    console.error('[Reports] getUtilization error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── GET /api/reports/maintenance ────────────────────────────
async function getMaintenance(req, res) {
  try {
    const data = {
      pathD: 'M 10 120 Q 60 70, 110 90 T 210 30 T 290 50',
      points: [
        { cx: 10, cy: 120 },
        { cx: 110, cy: 90 },
        { cx: 210, cy: 30 },
        { cx: 290, cy: 50 }
      ],
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']
    };
    res.json({ success: true, data, error: null });
  } catch (err) {
    console.error('[Reports] getMaintenance error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ── GET /api/reports/export ─────────────────────────────────
async function exportCSV(req, res) {
  try {
    const result = await db.query(`
      SELECT 
        a.asset_tag, a.name, c.name as category, d.name as department, 
        a.status, a.condition, a.location, a.acquisition_cost
      FROM assets a
      LEFT JOIN asset_categories c ON a.category_id = c.id
      LEFT JOIN departments d ON a.department_id = d.id
      ORDER BY a.asset_tag ASC
    `);

    // Basic CSV generation
    const headers = ['Asset Tag', 'Name', 'Category', 'Department', 'Status', 'Condition', 'Location', 'Cost'];
    const rows = result.rows.map(r => [
      `"${r.asset_tag}"`,
      `"${r.name}"`,
      `"${r.category || ''}"`,
      `"${r.department || ''}"`,
      `"${r.status}"`,
      `"${r.condition || ''}"`,
      `"${r.location || ''}"`,
      `"${r.acquisition_cost || ''}"`
    ].join(','));

    const csvData = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="assetflow-report.csv"');
    res.send(csvData);
  } catch (err) {
    console.error('[Reports] exportCSV error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

module.exports = { getUtilization, getMaintenance, exportCSV };
