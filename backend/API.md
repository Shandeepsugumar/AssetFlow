# AssetFlow — API Reference

> **Base URL:** `http://localhost:5000/api`
>
> **Response Envelope:** All endpoints return `{ success: boolean, data: <object|array|null>, error: <string|null> }`
>
> **Auth Header:** `Authorization: Bearer <JWT_TOKEN>` (required on all protected endpoints)

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | Public | Register new Employee account |
| POST | `/api/auth/login` | Public | Login, returns JWT + user |
| POST | `/api/auth/forgot-password` | Public | Request password reset token |
| POST | `/api/auth/reset-password` | Public | Reset password with token |
| GET | `/api/auth/me` | Bearer | Get current user from JWT |

### POST /api/auth/signup
**Body:** `{ name: string, email: string, password: string }`
**Note:** Role is always forced to `employee` server-side. Any `role` field in the body is ignored.
**Response (201):** `{ success: true, data: { token: string, user: { id, name, email, role, department_id, is_active } } }`

### POST /api/auth/login
**Body:** `{ email: string, password: string }`
**Response:** `{ success: true, data: { token: string, user: { id, name, email, role, department_id, is_active } } }`

### POST /api/auth/forgot-password
**Body:** `{ email: string }`
**Response:** `{ success: true, data: { message: string, resetToken: string } }`
> ⚠️ `resetToken` is returned directly in dev mode only. In production, this would be sent via email.

### POST /api/auth/reset-password
**Body:** `{ token: string, password: string }`
**Response:** `{ success: true, data: { message: string } }`

### GET /api/auth/me
**Response:** `{ success: true, data: { user: { id, name, email, role, department_id, department, is_active } } }`

---

## Departments

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/departments` | Bearer | Any |
| POST | `/api/departments` | Bearer | Admin |
| PUT | `/api/departments/:id` | Bearer | Admin |
| PATCH | `/api/departments/:id/deactivate` | Bearer | Admin |

### GET /api/departments
**Response:** `{ success: true, data: [{ id, name, description, headId, headName, parentId, parentName, status, employeeCount }] }`

### POST /api/departments
**Body:** `{ name: string, description?: string, headId?: uuid, parentId?: uuid }`
**Response (201):** `{ success: true, data: { department } }`

### PUT /api/departments/:id
**Body:** `{ name: string, description?: string, headId?: uuid, parentId?: uuid }`

### PATCH /api/departments/:id/deactivate
Toggles `is_active` status (Active ↔ Inactive).

---

## Asset Categories

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/categories` | Bearer | Any |
| POST | `/api/categories` | Bearer | Admin |
| PUT | `/api/categories/:id` | Bearer | Admin |

### GET /api/categories
**Response:** `{ success: true, data: [{ id, name, description, customFields: JSON, assetCount }] }`

### POST /api/categories
**Body:** `{ name: string, description?: string, customFields?: JSON }`
`customFields` is a JSONB array, e.g. `[{ key: "Warranty", type: "text", required: true }]`

### PUT /api/categories/:id
Same body as POST.

---

## Employees

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/employees` | Bearer | Any |
| PATCH | `/api/employees/:id/role` | Bearer | **Admin only** |
| PATCH | `/api/employees/:id/deactivate` | Bearer | Admin |

### GET /api/employees
**Query params:** `?search=&department=&role=&status=&page=1&limit=50`
**Response:** `{ success: true, data: [{ id, name, email, role, department, departmentId, status }], pagination: { page, limit, total } }`

### PATCH /api/employees/:id/role
> ⚠️ **This is the ONLY endpoint in the entire system that changes a user's role.**

**Body:** `{ role: "Department Head" | "Asset Manager" | "Employee" }`
**Response:** `{ success: true, data: { id, name, email, role, status } }`

### PATCH /api/employees/:id/deactivate
Toggles `is_active` status.

---

## Dashboard

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/dashboard` | Bearer | Any (role-scoped) |
| GET | `/api/activity-logs/recent` | Bearer | Any |

### GET /api/dashboard
**Scoping:** Admin/Asset Manager → org-wide; Department Head → department; Employee → personal
**Response:** `{ success: true, data: { assetsAvailable, assetsAllocated, maintenanceToday, activeBookings, pendingTransfers, upcomingReturns, overdueReturns } }`
> Note: Counts for tables not yet created (assets, bookings, etc.) return 0.

### GET /api/activity-logs/recent
**Response:** `{ success: true, data: [{ id, message, type, timestamp, user_name }] }`

---

## Shared Utilities for Teammates

### Auth Middleware
```javascript
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Protect a route (any authenticated user)
router.get('/my-route', authenticateToken, handler);

// Restrict to specific roles
router.post('/admin-route', authenticateToken, authorizeRoles('admin'), handler);
```

### Activity Logging
```javascript
const { logActivity } = require('../services/activityLog.service');

await logActivity({
  userId: req.user.id,
  action: 'Laptop AF-0114 allocated to Priya Shah',
  entityType: 'asset',
  entityId: assetId,
});
```

---

## Default Credentials (Seeded)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@assetflow.com | admin123 |
| Asset Manager | manager@assetflow.com | password123 |
| Department Head | head@assetflow.com | password123 |
| Employee | employee@assetflow.com | password123 |
