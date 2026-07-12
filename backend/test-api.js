/**
 * AssetFlow — API End-to-End Test Script
 * Run with: node test-api.js
 * Tests every route in order, using the token from login.
 */

const BASE = 'http://localhost:5000/api';
let passed = 0;
let failed = 0;
let adminToken = '';
let deptId = '';
let catId = '';
let employeeId = '';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, ...data };
}

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label} ${detail}`);
    failed++;
  }
}

async function run() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  AssetFlow API End-to-End Tests');
  console.log('═══════════════════════════════════════════\n');

  // ── HEALTH ────────────────────────────────────────
  console.log('▸ Health');
  const health = await req('GET', '/health');
  check('GET /api/health', health.success && health.data.status === 'ok');

  // ── AUTH ──────────────────────────────────────────
  console.log('\n▸ Auth — Signup');
  const badSignup = await req('POST', '/auth/signup', { email: 'bad-email', password: '123' });
  check('Signup rejects invalid email', !badSignup.success && badSignup.error);

  const newUser = await req('POST', '/auth/signup', { name: 'Test User', email: 'testuser99@assetflow.com', password: 'password123' });
  check('Signup creates employee', newUser.success && newUser.data?.user?.role === 'Employee' || newUser.data?.user?.role === 'employee', JSON.stringify(newUser.data?.user?.role));
  check('Signup returns token', !!newUser.data?.token);

  // Attempt role injection — must be blocked
  const injected = await req('POST', '/auth/signup', { name: 'Hacker', email: 'hacker@test.com', password: 'password123', role: 'admin' });
  check('Signup blocks role injection (always employee)', injected.data?.user?.role === 'Employee' || injected.data?.user?.role === 'employee');

  const dupSignup = await req('POST', '/auth/signup', { name: 'Test User', email: 'testuser99@assetflow.com', password: 'password123' });
  check('Signup rejects duplicate email', !dupSignup.success);

  console.log('\n▸ Auth — Login');
  const badLogin = await req('POST', '/auth/login', { email: 'admin@assetflow.com', password: 'wrongpass' });
  check('Login rejects wrong password', !badLogin.success && badLogin.error);

  const login = await req('POST', '/auth/login', { email: 'admin@assetflow.com', password: 'admin123' });
  check('Admin login succeeds', login.success && !!login.data?.token);
  check('Login returns user object', !!login.data?.user?.id);
  check('Login never returns password_hash', !JSON.stringify(login.data).includes('password_hash'));
  adminToken = login.data?.token;

  console.log('\n▸ Auth — Me');
  const me = await req('GET', '/auth/me', null, adminToken);
  check('GET /auth/me returns current user', me.success && me.data?.user?.email === 'admin@assetflow.com');
  const noToken = await req('GET', '/auth/me');
  check('GET /auth/me 401 without token', noToken.status === 401);

  console.log('\n▸ Auth — Forgot / Reset Password');
  const forgot = await req('POST', '/auth/forgot-password', { email: 'admin@assetflow.com' });
  check('Forgot password returns success', forgot.success);
  check('Dev mode returns reset token', !!forgot.data?.resetToken, JSON.stringify(forgot.data));
  const resetToken = forgot.data?.resetToken;

  const badReset = await req('POST', '/auth/reset-password', { token: 'invalid-token', password: 'newpass123' });
  check('Reset rejects invalid token', !badReset.success);

  const goodReset = await req('POST', '/auth/reset-password', { token: resetToken, password: 'admin123' });
  check('Reset password succeeds with valid token', goodReset.success, JSON.stringify(goodReset));

  const usedReset = await req('POST', '/auth/reset-password', { token: resetToken, password: 'admin123' });
  check('Reset token cannot be reused', !usedReset.success);

  // ── DEPARTMENTS ───────────────────────────────────
  console.log('\n▸ Departments');
  const depts = await req('GET', '/departments', null, adminToken);
  check('GET /departments returns array', depts.success && Array.isArray(depts.data));
  check('Departments have required fields', depts.data?.[0]?.id && depts.data?.[0]?.name !== undefined);

  const noDeptAuth = await req('GET', '/departments');
  check('GET /departments 401 without token', noDeptAuth.status === 401);

  const newDept = await req('POST', '/departments', { name: 'Test Department', description: 'For testing' }, adminToken);
  check('POST /departments creates dept', newDept.success, JSON.stringify(newDept.error));
  deptId = newDept.data?.id;

  const badDept = await req('POST', '/departments', { description: 'Missing name' }, adminToken);
  check('POST /departments 400 without name', !badDept.success);

  const updatedDept = await req('PUT', `/departments/${deptId}`, { name: 'Test Department Updated', description: 'Updated' }, adminToken);
  check('PUT /departments/:id updates dept', updatedDept.success, JSON.stringify(updatedDept.error));

  const deactivated = await req('PATCH', `/departments/${deptId}/deactivate`, null, adminToken);
  check('PATCH /departments/:id/deactivate toggles status', deactivated.success, JSON.stringify(deactivated.error));

  // ── CATEGORIES ────────────────────────────────────
  console.log('\n▸ Asset Categories');
  const cats = await req('GET', '/categories', null, adminToken);
  check('GET /categories returns array', cats.success && Array.isArray(cats.data));
  check('Categories have customFields', cats.data?.[0]?.customFields !== undefined);

  const newCat = await req('POST', '/categories', {
    name: 'Test Category',
    description: 'Test',
    customFields: [{ key: 'Serial', type: 'text', required: true }],
  }, adminToken);
  check('POST /categories creates category', newCat.success, JSON.stringify(newCat.error));
  catId = newCat.data?.id;

  const updatedCat = await req('PUT', `/categories/${catId}`, {
    name: 'Test Category Updated',
    description: 'Updated',
    customFields: [{ key: 'Serial', type: 'text', required: true }, { key: 'Warranty', type: 'text', required: false }],
  }, adminToken);
  check('PUT /categories/:id updates category', updatedCat.success, JSON.stringify(updatedCat.error));

  // ── EMPLOYEES ─────────────────────────────────────
  console.log('\n▸ Employees');
  const emps = await req('GET', '/employees', null, adminToken);
  check('GET /employees returns paginated list', emps.success && Array.isArray(emps.data));
  check('GET /employees includes pagination', !!emps.pagination);

  const searchEmps = await req('GET', '/employees?search=priya', null, adminToken);
  check('GET /employees?search= filters results', searchEmps.success);

  const filterEmps = await req('GET', '/employees?role=employee', null, adminToken);
  check('GET /employees?role= filters by role', filterEmps.success);

  // Find a non-admin user to promote
  const empList = await req('GET', '/employees?role=employee', null, adminToken);
  employeeId = empList.data?.[0]?.id;

  if (employeeId) {
    const promoted = await req('PATCH', `/employees/${employeeId}/role`, { role: 'Department Head' }, adminToken);
    check('PATCH /employees/:id/role changes role', promoted.success, JSON.stringify(promoted.error));

    const demoted = await req('PATCH', `/employees/${employeeId}/role`, { role: 'employee' }, adminToken);
    check('PATCH /employees/:id/role can revert role', demoted.success, JSON.stringify(demoted.error));

    const toggled = await req('PATCH', `/employees/${employeeId}/deactivate`, null, adminToken);
    check('PATCH /employees/:id/deactivate toggles status', toggled.success, JSON.stringify(toggled.error));

    // Re-activate
    await req('PATCH', `/employees/${employeeId}/deactivate`, null, adminToken);
  }

  // Employee cannot change roles (403)
  const empLogin = await req('POST', '/auth/login', { email: 'employee@assetflow.com', password: 'password123' });
  const empToken = empLogin.data?.token;
  if (empToken && employeeId) {
    const forbidden = await req('PATCH', `/employees/${employeeId}/role`, { role: 'admin' }, empToken);
    check('Non-admin cannot change roles (403)', forbidden.status === 403);
  }

  // ── DASHBOARD ─────────────────────────────────────
  console.log('\n▸ Dashboard');
  const dash = await req('GET', '/dashboard', null, adminToken);
  check('GET /dashboard returns stats', dash.success, JSON.stringify(dash.error));
  check('Dashboard has all required fields', [
    'assetsAvailable','assetsAllocated','maintenanceToday',
    'activeBookings','pendingTransfers','upcomingReturns','overdueReturns'
  ].every(k => dash.data?.[k] !== undefined), JSON.stringify(dash.data));
  check('Dashboard returns 0 for missing tables (not error)', dash.success && typeof dash.data?.assetsAvailable === 'number');

  // Dept Head scoping
  const headLogin = await req('POST', '/auth/login', { email: 'head@assetflow.com', password: 'password123' });
  const headToken = headLogin.data?.token;
  if (headToken) {
    const headDash = await req('GET', '/dashboard', null, headToken);
    check('Dept Head dashboard succeeds', headDash.success, JSON.stringify(headDash.error));
  }

  // Employee scoping
  if (empToken) {
    const empDash = await req('GET', '/dashboard', null, empToken);
    check('Employee dashboard succeeds', empDash.success, JSON.stringify(empDash.error));
  }

  // ── BOOKINGS & MAINTENANCE ───────────────────────
  console.log('\n▸ Resource Bookings & Maintenance');
  // Get bookable assets
  const assetsRes = await req('GET', '/assets?is_bookable=true', null, adminToken);
  check('GET /assets?is_bookable=true returns list', assetsRes.success && assetsRes.data?.length > 0);
  const bookableAsset = assetsRes.data?.[0];

  let bookingId = '';
  if (bookableAsset) {
    // 1. Create a booking
    const startStr = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // +1 hour
    const endStr = new Date(Date.now() + 1000 * 60 * 120).toISOString(); // +2 hours
    const bookingRes = await req('POST', '/bookings', {
      assetId: bookableAsset.id,
      startTime: startStr,
      endTime: endStr,
      purpose: 'API Test Booking'
    }, adminToken);
    check('POST /bookings creates upcoming booking', bookingRes.success && bookingRes.data?.status === 'Upcoming');
    bookingId = bookingRes.data?.id;

    // 2. Test overlap validation - overlaps existing
    const overlapStrStart = new Date(Date.now() + 1000 * 60 * 90).toISOString(); // +1.5 hour (overlaps!)
    const overlapStrEnd = new Date(Date.now() + 1000 * 60 * 150).toISOString(); // +2.5 hours
    const overlapRes = await req('POST', '/bookings', {
      assetId: bookableAsset.id,
      startTime: overlapStrStart,
      endTime: overlapStrEnd,
      purpose: 'Should Fail Overlap'
    }, adminToken);
    check('POST /bookings rejects overlapping booking slot', !overlapRes.success && overlapRes.status === 400);

    // 3. Test overlap validation - back-to-back should pass
    const backToBackStrStart = endStr; // starts exactly when prior ends
    const backToBackStrEnd = new Date(Date.now() + 1000 * 60 * 180).toISOString(); // +3 hours
    const backToBackRes = await req('POST', '/bookings', {
      assetId: bookableAsset.id,
      startTime: backToBackStrStart,
      endTime: backToBackStrEnd,
      purpose: 'Back-to-back booking'
    }, adminToken);
    check('POST /bookings accepts back-to-back booking slot', backToBackRes.success);
  }

  // Get all assets
  const allAssetsRes = await req('GET', '/assets', null, adminToken);
  const maintAsset = allAssetsRes.data?.[0];
  if (maintAsset) {
    // 1. Raise maintenance request
    const maintRes = await req('POST', '/maintenance', {
      assetId: maintAsset.id,
      issueDescription: 'Broken monitor screen',
      priority: 'High'
    }, adminToken);
    check('POST /maintenance creates request in Pending state', maintRes.success && maintRes.data?.status === 'Pending');
    const maintId = maintRes.data?.id;

    if (maintId) {
      // 2. Approve request
      const approveRes = await req('PATCH', `/maintenance/${maintId}/approve`, null, adminToken);
      check('PATCH /maintenance/:id/approve moves status to Approved', approveRes.success && approveRes.data?.status === 'Approved');

      // Verify asset status transitioned to Under Maintenance
      const assetVerify1 = await req('GET', `/assets/${maintAsset.id}`, null, adminToken);
      check('Asset status updated to Under Maintenance', assetVerify1.data?.status === 'Under Maintenance');

      // 3. Assign technician
      const assignRes = await req('PATCH', `/maintenance/${maintId}/assign`, { technicianName: 'Bob the Builder' }, adminToken);
      check('PATCH /maintenance/:id/assign moves status to In Progress', assignRes.success && assignRes.data?.status === 'In Progress');

      // 4. Resolve request
      const resolveRes = await req('PATCH', `/maintenance/${maintId}/resolve`, null, adminToken);
      check('PATCH /maintenance/:id/resolve moves status to Resolved', resolveRes.success && resolveRes.data?.status === 'Resolved');

      // Verify asset status reverted back to Available
      const assetVerify2 = await req('GET', `/assets/${maintAsset.id}`, null, adminToken);
      check('Asset status reverted back to Available', assetVerify2.data?.status === 'Available');
    }
  }

  // Cancel the booking to clean up
  if (bookingId) {
    const cancelRes = await req('PATCH', `/bookings/${bookingId}/cancel`, null, adminToken);
    check('PATCH /bookings/:id/cancel cancels booking', cancelRes.success && cancelRes.data?.status === 'Cancelled');
  }

  // ── ACTIVITY LOGS ─────────────────────────────────
  console.log('\n▸ Activity Logs');
  const logs = await req('GET', '/activity-logs/recent', null, adminToken);
  check('GET /activity-logs/recent returns array', logs.success && Array.isArray(logs.data));
  check('Activity logs have required fields', !logs.data?.length || !!logs.data[0].message);

  // ── 404 ───────────────────────────────────────────
  console.log('\n▸ Error Handling');
  const notFound = await req('GET', '/nonexistent-route', null, adminToken);
  check('Unknown routes return 404', notFound.status === 404);

  // ── SUMMARY ───────────────────────────────────────
  const total = passed + failed;
  console.log('\n═══════════════════════════════════════════');
  console.log(`  Results: ${passed}/${total} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════\n');
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Test runner error:', err.message);
  process.exit(1);
});
