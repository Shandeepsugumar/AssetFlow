/**
 * ============================================================
 * AssetFlow — Mock Data
 * ============================================================
 * Realistic sample data for all API endpoints.
 * Used when USE_MOCKS is true in client.js.
 * IDs are consistent across all entities.
 * ============================================================
 */

// ── Mock Users (login credentials) ─────────────────────────
// All passwords: password123
export const mockUsers = [
  {
    id: 'usr-001',
    name: 'Rajesh Kumar',
    email: 'admin@assetflow.com',
    role: 'Admin',
    department: 'IT',
    departmentId: 'dept-001',
    status: 'Active',
    avatar: null,
  },
  {
    id: 'usr-002',
    name: 'Anita Sharma',
    email: 'manager@assetflow.com',
    role: 'Asset Manager',
    department: 'Operations',
    departmentId: 'dept-005',
    status: 'Active',
    avatar: null,
  },
  {
    id: 'usr-003',
    name: 'Vikram Patel',
    email: 'head@assetflow.com',
    role: 'Department Head',
    department: 'Engineering',
    departmentId: 'dept-006',
    status: 'Active',
    avatar: null,
  },
  {
    id: 'usr-004',
    name: 'Priya Shah',
    email: 'employee@assetflow.com',
    role: 'Employee',
    department: 'Marketing',
    departmentId: 'dept-004',
    status: 'Active',
    avatar: null,
  },
];

// ── Mock Employees ──────────────────────────────────────────
export const mockEmployees = [
  ...mockUsers,
  {
    id: 'usr-005',
    name: 'Suresh Reddy',
    email: 'suresh.reddy@assetflow.com',
    role: 'Employee',
    department: 'IT',
    departmentId: 'dept-001',
    status: 'Active',
    avatar: null,
  },
  {
    id: 'usr-006',
    name: 'Meera Nair',
    email: 'meera.nair@assetflow.com',
    role: 'Department Head',
    department: 'Human Resources',
    departmentId: 'dept-002',
    status: 'Active',
    avatar: null,
  },
  {
    id: 'usr-007',
    name: 'Arjun Desai',
    email: 'arjun.desai@assetflow.com',
    role: 'Employee',
    department: 'Finance',
    departmentId: 'dept-003',
    status: 'Active',
    avatar: null,
  },
  {
    id: 'usr-008',
    name: 'Kavita Joshi',
    email: 'kavita.joshi@assetflow.com',
    role: 'Department Head',
    department: 'Finance',
    departmentId: 'dept-003',
    status: 'Active',
    avatar: null,
  },
  {
    id: 'usr-009',
    name: 'Rohit Mehta',
    email: 'rohit.mehta@assetflow.com',
    role: 'Employee',
    department: 'Engineering',
    departmentId: 'dept-006',
    status: 'Active',
    avatar: null,
  },
  {
    id: 'usr-010',
    name: 'Deepa Iyer',
    email: 'deepa.iyer@assetflow.com',
    role: 'Employee',
    department: 'Marketing',
    departmentId: 'dept-004',
    status: 'Inactive',
    avatar: null,
  },
];

// ── Mock Departments ────────────────────────────────────────
export const mockDepartments = [
  {
    id: 'dept-001',
    name: 'IT',
    description: 'Information Technology & Infrastructure',
    headId: 'usr-001',
    headName: 'Rajesh Kumar',
    parentId: null,
    parentName: null,
    status: 'Active',
    employeeCount: 12,
  },
  {
    id: 'dept-002',
    name: 'Human Resources',
    description: 'People Operations & Talent Management',
    headId: 'usr-006',
    headName: 'Meera Nair',
    parentId: null,
    parentName: null,
    status: 'Active',
    employeeCount: 8,
  },
  {
    id: 'dept-003',
    name: 'Finance',
    description: 'Financial Planning & Accounting',
    headId: 'usr-008',
    headName: 'Kavita Joshi',
    parentId: null,
    parentName: null,
    status: 'Active',
    employeeCount: 6,
  },
  {
    id: 'dept-004',
    name: 'Marketing',
    description: 'Brand Strategy & Digital Marketing',
    headId: null,
    headName: null,
    parentId: null,
    parentName: null,
    status: 'Active',
    employeeCount: 10,
  },
  {
    id: 'dept-005',
    name: 'Operations',
    description: 'Business Operations & Logistics',
    headId: 'usr-002',
    headName: 'Anita Sharma',
    parentId: null,
    parentName: null,
    status: 'Active',
    employeeCount: 15,
  },
  {
    id: 'dept-006',
    name: 'Engineering',
    description: 'Product Engineering & Development',
    headId: 'usr-003',
    headName: 'Vikram Patel',
    parentId: 'dept-001',
    parentName: 'IT',
    status: 'Active',
    employeeCount: 20,
  },
];

// ── Mock Asset Categories ───────────────────────────────────
export const mockCategories = [
  {
    id: 'cat-001',
    name: 'Electronics',
    description: 'Laptops, monitors, phones, and other electronic devices',
    customFields: [
      { key: 'Warranty Period', type: 'text', required: true },
      { key: 'Serial Number Pattern', type: 'text', required: true },
      { key: 'Operating System', type: 'text', required: false },
    ],
    assetCount: 156,
  },
  {
    id: 'cat-002',
    name: 'Furniture',
    description: 'Desks, chairs, cabinets, and office furniture',
    customFields: [
      { key: 'Material', type: 'text', required: false },
      { key: 'Color', type: 'text', required: false },
      { key: 'Weight Capacity (kg)', type: 'text', required: false },
    ],
    assetCount: 89,
  },
  {
    id: 'cat-003',
    name: 'Vehicles',
    description: 'Company cars, vans, and transport vehicles',
    customFields: [
      { key: 'License Plate', type: 'text', required: true },
      { key: 'Insurance Expiry', type: 'text', required: true },
      { key: 'Fuel Type', type: 'text', required: true },
      { key: 'Mileage', type: 'text', required: false },
    ],
    assetCount: 12,
  },
  {
    id: 'cat-004',
    name: 'Office Equipment',
    description: 'Printers, projectors, scanners, and shared equipment',
    customFields: [
      { key: 'Model Number', type: 'text', required: true },
      { key: 'Connectivity', type: 'text', required: false },
    ],
    assetCount: 34,
  },
  {
    id: 'cat-005',
    name: 'Safety Equipment',
    description: 'Fire extinguishers, first aid kits, safety gear',
    customFields: [
      { key: 'Inspection Date', type: 'text', required: true },
      { key: 'Certification Number', type: 'text', required: true },
      { key: 'Expiry Date', type: 'text', required: true },
    ],
    assetCount: 45,
  },
];

// ── Mock Dashboard Stats ────────────────────────────────────
export const mockDashboardStats = {
  assetsAvailable: 142,
  assetsAllocated: 194,
  maintenanceToday: 7,
  activeBookings: 23,
  pendingTransfers: 5,
  upcomingReturns: 12,
  overdueReturns: 3,
};

// ── Mock Activity Logs ──────────────────────────────────────
export const mockActivityLogs = [
  {
    id: 'log-001',
    message: 'Laptop AF-0114 allocated to Priya Shah',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: 'allocation',
    icon: 'laptop',
  },
  {
    id: 'log-002',
    message: 'Conference Room A booked by Marketing for Jul 15',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'booking',
    icon: 'calendar',
  },
  {
    id: 'log-003',
    message: 'Printer PR-0023 maintenance request raised by Arjun Desai',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    type: 'maintenance',
    icon: 'wrench',
  },
  {
    id: 'log-004',
    message: 'Monitor MN-0089 transferred from IT to Engineering',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    type: 'transfer',
    icon: 'arrow-right',
  },
  {
    id: 'log-005',
    message: 'Vehicle VH-003 returned by Suresh Reddy',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    type: 'return',
    icon: 'check',
  },
  {
    id: 'log-006',
    message: 'New category "Safety Equipment" created by Admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    type: 'system',
    icon: 'settings',
  },
];
