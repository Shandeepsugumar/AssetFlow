# AssetFlow — Backend API

> Node.js + Express + PostgreSQL REST API for the AssetFlow Enterprise Asset & Resource Management System.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 17 or 18 running on port 5433

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Edit .env — update DATABASE_URL with your credentials
# Default: postgresql://postgres:shandeep@localhost:5433/assetflow

# 3. Create the database in psql
CREATE DATABASE assetflow;

# 4. Run schema migration (creates all tables)
npm run db:migrate

# 5. Seed default data (admin user + sample data)
npm run db:seed

# 6. Start development server
npm run dev
```

Server runs at **http://localhost:5000/api**

---

## Default Login Credentials & Role Workflow

> [!IMPORTANT]
> By design, **only the Admin account** is pre-seeded into the database by `npm run db:seed`. All other roles are managed dynamically through the Admin Dashboard.

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Admin** | `admin@assetflow.com` | `admin123` | Only pre-created account. Has full access to promote users and manage org setup. |

### How Roles Are Assigned (`Role Workflow`)
1. **Self-Registration (Employee):** New users (Teammates, Asset Managers, Department Heads, and Employees) register themselves on the frontend via the `/signup` page. All newly registered accounts are assigned the **Employee** (`employee`) role by default.
2. **Role Promotion (Admin):** The Admin logs into the dashboard (`http://localhost:5173/login`) and navigates to **Org Setup → Employee Directory**.
3. **Assigning Roles:** From the Employee Directory tab, the Admin clicks **Change Role** next to any registered employee to promote them to either:
   - **Asset Manager** (`asset_manager`)
   - **Department Head** (`department_head`)

---

## Project Structure

```
backend/
├── server.js                          # Express entry point
├── src/
│   ├── config/
│   │   └── db.js                      # PostgreSQL pool
│   ├── db/
│   │   ├── schema.sql                 # All table definitions
│   │   ├── migrate.js                 # Migration runner
│   │   └── seed.js                    # Default data seeder
│   ├── middleware/
│   │   ├── auth.js                    # authenticateToken + authorizeRoles
│   │   └── errorHandler.js            # Global error handler
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── departments.controller.js
│   │   ├── categories.controller.js
│   │   ├── employees.controller.js
│   │   └── dashboard.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── departments.routes.js
│   │   ├── categories.routes.js
│   │   ├── employees.routes.js
│   │   ├── dashboard.routes.js
│   │   └── activityLogs.routes.js
│   └── services/
│       └── activityLog.service.js     # logActivity() — import in ALL modules
├── API.md                             # Complete endpoint reference
├── test-api.js                        # End-to-end test script
└── .env.example                       # Config template
```

---

## For Teammates — Adding Your Module Routes

### 1. Import shared middleware
```javascript
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
```

### 2. Log activity from your controllers
```javascript
const { logActivity } = require('../services/activityLog.service');

await logActivity({
  userId: req.user.id,
  action: 'Laptop AF-0114 allocated to Priya Shah',
  entityType: 'asset',   // your entity type
  entityId: assetId,     // UUID of the entity
});
```

### 3. Mount your routes in server.js
```javascript
const myRoutes = require('./src/routes/myModule.routes');
app.use('/api/my-module', myRoutes);
```

### 4. Response envelope — always use this shape
```javascript
res.json({ success: true, data: result, error: null });
res.status(400).json({ success: false, data: null, error: 'Descriptive message' });
```

---

## Running Tests
```bash
node test-api.js
# Expected: 44/44 passed
```

See [API.md](./API.md) for full endpoint documentation.
