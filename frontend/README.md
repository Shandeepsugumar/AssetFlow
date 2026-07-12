# AssetFlow — Frontend (React + Vite + Tailwind CSS)

> Enterprise Asset & Resource Management Frontend Application built with React 18, Vite, and Lucide Icons.

## Quick Start

### Prerequisites
- Node.js 18+
- AssetFlow Backend running on `http://localhost:5000`

### Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The frontend will run by default at **http://localhost:5173** (or port `5174` if `5173` is busy).

---

## Authentication & Role Assignment Workflow

### Pre-Seeded Admin Credentials
When you run `npm run db:seed` in the backend, **only the Admin account is created**:
- **Email:** `admin@assetflow.com`
- **Password:** `admin123`

### How Users & Roles Work (`Role Workflow`)
1. **Self-Registration:** Every employee or department member goes to the `/signup` page to register their own account.
2. **Default Employee Role:** By default, all newly registered accounts are assigned the **Employee** role (`role = 'Employee'`).
3. **Role Elevation (Admin Only):**
   - Log in as the Admin (`admin@assetflow.com`).
   - Navigate to **Org Setup → Employee Directory**.
   - Click the **Change Role** button next to any registered employee to promote them to either **Asset Manager** or **Department Head**.

> [!NOTE]
> The **Change Role** action is restricted exclusively to the Admin account. Non-admin users viewing the Employee Directory will see an `Admin Only` status indicator instead of the action button.

---

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.js           # Axios instance with JWT interceptor & base URL
│   │   └── endpoints.js       # Centralized API method calls
│   ├── components/
│   │   └── ui/                # Reusable UI components (Table, Modal, Select, Button, Badge)
│   ├── context/
│   │   ├── AuthContext.jsx    # Global authentication & user normalization (`normalizeUser`)
│   │   └── ToastContext.jsx   # Toast notification provider
│   ├── layouts/
│   │   └── MainLayout.jsx     # App shell with Sidebar, Header & navigation guards
│   ├── pages/
│   │   ├── Login.jsx          # User login
│   │   ├── Signup.jsx         # Employee self-registration
│   │   ├── Dashboard.jsx      # KPI statistics & quick actions
│   │   └── org-setup/
│   │       ├── EmployeeDirectoryTab.jsx # Admin role promotion hub
│   │       ├── DepartmentsTab.jsx       # Department management
│   │       └── AssetCategoriesTab.jsx   # Custom asset category definition
│   ├── App.jsx                # Root context wrappers
│   ├── routes.jsx             # React Router configuration
│   └── main.jsx               # DOM mount point
├── index.html
├── package.json
└── vite.config.js
```
