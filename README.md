# 🚀 AssetFlow — Enterprise Asset & Resource Management System

> **Full-Stack Application:** Node.js + Express + PostgreSQL REST API paired with a React 18 + Vite + Tailwind CSS Frontend.

---

## 🌟 Executive Summary: What Has Been Built Till Now

We have engineered and hardened the core **Authentication, Organization Setup, Role Elevation Hub, and Dashboard APIs** for the **AssetFlow** platform. Every component—from database tables to frontend state normalization—has been verified with an **end-to-end 44/44 passing test suite**.

### 1. 🗄️ PostgreSQL Database & Schema Architecture (`Port 5433`)
* **Migrated & Verified Core Schema (`schema.sql`):**
  * `users`: Stores user accounts, bcrypt hashed passwords (`password_hash`), active status, and foreign key relations to departments.
  * `departments`: Stores department definitions (`IT`, `Human Resources`, `Finance`, `Marketing`, `Operations`).
  * `asset_categories`: Stores dynamic asset categories and JSON custom field definitions (`Electronics`, `Vehicles`, `Safety Equipment`, etc.).
  * `activity_logs`: Immutable audit trail tracking system and administrative actions.
  * `password_reset_tokens`: Manages secure, time-limited password recovery tokens.
* **Migration & Seeding Tools:** Automated CLI runners (`npm run db:migrate` and `npm run db:seed`) to set up clean environments in seconds.

---

### 2. 🔐 Authentication Engine & Secure Role Elevation Hub
We implemented a **strict, single-point-of-control role assignment workflow** designed for enterprise security:
* **Single Pre-Seeded Admin (`db:seed`):** By design, **only one account** is pre-created by the database seeding script:
  * **Email:** `admin@assetflow.com`
  * **Password:** `admin123`
* **Employee Self-Registration (`/signup`):** When new teammates, department heads, or asset managers register themselves on the login screen, they are **automatically locked to the `Employee` role** (`role = 'employee'`). No user can elevate their own privileges upon signup.
* **Admin Role Promotion Hub (`Employee Directory Tab`):**
  * The Admin logs into the dashboard and navigates to **Org Setup → Employee Directory**.
  * From this dedicated assignment center, the Admin clicks **Change Role** to promote an `Employee` to **Asset Manager** (`asset_manager`) or **Department Head** (`department_head`).
  * **Security Guard:** `PATCH /api/employees/:id/role` is strictly guarded by `authorizeRoles('admin')`. If a non-admin accesses the UI, the button is hidden and replaced with an `Admin Only` indicator.

---

### 3. ⚙️ Backend API & Security Polish (`backend/`)
* **Dynamic CORS Multi-Port Support (`server.js`):** Configured CORS to dynamically accept requests from any `http://localhost:*` port (e.g., `5173`, `5174`, `5175`), eliminating cross-origin errors during multi-terminal local development.
* **Security & Parameterized SQL:** All SQL queries across all controllers (`auth`, `departments`, `categories`, `employees`, `dashboard`) use `$1, $2` parameter bindings to eliminate SQL injection vulnerabilities.
* **Role String Normalization (`formatRole`):** Automatically converts internal database enums (`asset_manager`, `department_head`) into clean UI strings (`Asset Manager`, `Department Head`) across all REST responses.
* **Centralized Activity Logging (`activityLog.service.js`):** Every key action (account creation, role change, deactivation) automatically inserts an audit entry with timestamps and user IDs.

---

### 4. 🎨 Frontend UI Polish & State Synchronization (`frontend/`)
* **Role Normalization Layer (`AuthContext.jsx`):** Created a `normalizeUser` helper inside `AuthContext` to ensure front-end route guards, navigation sidebars, and badges correctly recognize user roles whether received from local storage, login payloads, or session refreshes.
* **Resolved React Key Collisions (`Select.jsx` & `Table.jsx`):** Eliminated console warnings (`Encountered two children with the same key...`) by updating UI mapping loops to use `key={opt.id || `${opt.value}-${idx}`}`, ensuring 100% unique DOM keys even when dropdown options share label strings.
* **Org Setup Workspace:** Built interactive tabs for managing **Departments**, **Asset Categories** (with custom field definitions), and the **Employee Directory**.

---

### 5. ✅ Automated End-to-End Verification (`test-api.js`)
We created a comprehensive automated testing script (`test-api.js`) that verifies the entire stack against real database instances:
* **Test Results:** **44 / 44 Test Cases Passed** 🚀
* **Coverage Includes:** Health checks, signup constraints, login validation, token expiration, department CRUD, category CRUD, role promotion restrictions, activity log checks, and dashboard aggregations.

---

## ⚡ Quick Start Guide (`Running the Complete System`)

### Prerequisites
* **Node.js:** v18 or higher
* **PostgreSQL:** Running on `localhost:5433` (Database name: `assetflow`)

### Step 1: Initialize Database & Seed Data
Open your first terminal inside `C:\React\Odoo\backend`:
```powershell
cd C:\React\Odoo\backend
npm install

# 1. Create tables in PostgreSQL
npm run db:migrate

# 2. Seed Admin account & default departments
npm run db:seed
```

### Step 2: Start the Backend API Server
In the same backend terminal:
```powershell
npm run dev
```
* **Status:** API server listening on `http://localhost:5000/api`

### Step 3: Start the Frontend React Application
Open a second terminal inside `C:\React\Odoo\frontend`:
```powershell
cd C:\React\Odoo\frontend
npm install
npm run dev
```
* **Status:** Frontend running on `http://localhost:5173` (or `http://localhost:5174`)

---

## 🔑 Default Credentials & Role Cheat Sheet

| Role | Email | Password | How It Is Created / Assigned |
|------|-------|----------|------------------------------|
| **Admin** | `admin@assetflow.com` | `admin123` | **Pre-seeded** via `npm run db:seed`. Has full control. |
| **Employee** | Any self-registered email | User-defined | **Default role** when any user registers via `/signup`. |
| **Asset Manager** | Promoted employee email | User-defined | Admin promotes an `Employee` from **Org Setup → Employee Directory**. |
| **Department Head** | Promoted employee email | User-defined | Admin promotes an `Employee` from **Org Setup → Employee Directory**. |

---

## 📁 Project Directory Overview

```
C:\React\Odoo\
├── backend/                           # Node.js + Express REST API (`Port 5000`)
│   ├── src/
│   │   ├── config/db.js               # PostgreSQL connection pool (`Port 5433`)
│   │   ├── controllers/               # Auth, Departments, Categories, Employees, Dashboard
│   │   ├── db/                        # schema.sql, migrate.js, seed.js
│   │   ├── middleware/auth.js         # JWT verification (`authenticateToken` & `authorizeRoles`)
│   │   ├── routes/                    # API route declarations
│   │   └── services/activityLog.service.js # Centralized audit logger
│   ├── server.js                      # Express server entry point & dynamic CORS config
│   ├── test-api.js                    # End-to-end automated API test suite (44/44 passing)
│   ├── API.md                         # Detailed API route documentation
│   └── README.md                      # Backend specific documentation
│
├── frontend/                          # React 18 + Vite + Tailwind CSS (`Port 5173/5174`)
│   ├── src/
│   │   ├── api/endpoints.js           # Centralized Axios API wrappers
│   │   ├── components/ui/             # Reusable UI library (Table, Modal, Select, Button, Badge)
│   │   ├── context/                   # AuthContext (`normalizeUser`) & ToastContext
│   │   ├── layouts/MainLayout.jsx     # Navigation shell, header, sidebar & role guards
│   │   └── pages/                     # Login, Signup, Dashboard & Org Setup Tabs
│   └── README.md                      # Frontend specific documentation
│
└── README.md                          # ⬅️ You are reading this file!
```
