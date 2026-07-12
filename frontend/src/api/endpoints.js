/**
 * ============================================================
 * AssetFlow — API Endpoint Functions
 * ============================================================
 * All API-shape assumptions are documented here.
 * Every endpoint falls back to mock data when USE_MOCKS is true.
 *
 * Standard API response shape:
 *   { success: boolean, data: ..., error: string|null }
 *
 * Backend teammates: diff against the routes/request/response
 * shapes below to ensure your Express API matches.
 * ============================================================
 */

import client, { USE_MOCKS } from './client';
import {
  mockUsers,
  mockEmployees,
  mockDepartments,
  mockCategories,
  mockDashboardStats,
  mockActivityLogs,
} from './mockData';

// Simulate network latency for mock responses
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────
// POST /api/auth/login      { email, password }          → { success, data: { token, user } }
// POST /api/auth/signup     { name, email, password }    → { success, data: { token, user } }
// GET  /api/auth/me                                      → { success, data: { user } }
// POST /api/auth/forgot-password  { email }              → { success, data: { message } }
// POST /api/auth/reset-password   { token, password }    → { success, data: { message } }
// ─────────────────────────────────────────────────────────────
export const authApi = {
  async login(email, password) {
    if (USE_MOCKS) {
      await delay(600);
      const user = mockUsers.find(
        (u) => u.email === email.toLowerCase().trim()
      );
      if (!user || password !== 'password123') {
        return { success: false, data: null, error: 'Invalid email or password' };
      }
      const token = `mock-jwt-${user.id}-${Date.now()}`;
      return { success: true, data: { token, user }, error: null };
    }
    const res = await client.post('/auth/login', { email, password });
    return res.data;
  },

  async signup({ name, email, password }) {
    if (USE_MOCKS) {
      await delay(600);
      const exists = mockUsers.find(
        (u) => u.email === email.toLowerCase().trim()
      );
      if (exists) {
        return { success: false, data: null, error: 'An account with this email already exists' };
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        name,
        email: email.toLowerCase().trim(),
        role: 'Employee',
        department: null,
        departmentId: null,
        status: 'Active',
        avatar: null,
      };
      const token = `mock-jwt-${newUser.id}-${Date.now()}`;
      return { success: true, data: { token, user: newUser }, error: null };
    }
    const res = await client.post('/auth/signup', { name, email, password });
    return res.data;
  },

  async getMe() {
    if (USE_MOCKS) {
      await delay(300);
      const token = localStorage.getItem('assetflow_token');
      if (!token) {
        return { success: false, data: null, error: 'No token' };
      }
      // Extract user ID from mock token format: mock-jwt-{userId}-{timestamp}
      const parts = token.split('-');
      const userId = parts.length >= 4 ? `${parts[2]}-${parts[3]}` : null;
      const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];
      return { success: true, data: { user }, error: null };
    }
    const res = await client.get('/auth/me');
    return res.data;
  },

  async forgotPassword(email) {
    if (USE_MOCKS) {
      await delay(800);
      return {
        success: true,
        data: { message: 'If an account with that email exists, a reset link has been sent.' },
        error: null,
      };
    }
    const res = await client.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token, password) {
    if (USE_MOCKS) {
      await delay(600);
      return {
        success: true,
        data: { message: 'Password has been reset successfully.' },
        error: null,
      };
    }
    const res = await client.post('/auth/reset-password', { token, password });
    return res.data;
  },
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD API
// ─────────────────────────────────────────────────────────────
// GET /api/dashboard                → { success, data: { assetsAvailable, ... } }
// GET /api/activity-logs/recent     → { success, data: [ { id, message, timestamp, type } ] }
// ─────────────────────────────────────────────────────────────
export const dashboardApi = {
  async getStats() {
    if (USE_MOCKS) {
      await delay(500);
      return { success: true, data: mockDashboardStats, error: null };
    }
    const res = await client.get('/dashboard');
    return res.data;
  },

  async getRecentActivity() {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: mockActivityLogs, error: null };
    }
    const res = await client.get('/activity-logs/recent');
    return res.data;
  },
};

// ─────────────────────────────────────────────────────────────
// DEPARTMENTS API
// ─────────────────────────────────────────────────────────────
// GET    /api/departments                → { success, data: [...] }
// POST   /api/departments                → { success, data: { department } }
// PUT    /api/departments/:id            → { success, data: { department } }
// PUT    /api/departments/:id/deactivate → { success, data: { department } }
// ─────────────────────────────────────────────────────────────
let _mockDepts = [...mockDepartments];

export const departmentsApi = {
  async getAll() {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: _mockDepts, error: null };
    }
    const res = await client.get('/departments');
    return res.data;
  },

  async create(data) {
    if (USE_MOCKS) {
      await delay(500);
      const head = data.headId
        ? mockEmployees.find((e) => e.id === data.headId)
        : null;
      const parent = data.parentId
        ? _mockDepts.find((d) => d.id === data.parentId)
        : null;
      const newDept = {
        id: `dept-${Date.now()}`,
        name: data.name,
        description: data.description || '',
        headId: data.headId || null,
        headName: head ? head.name : null,
        parentId: data.parentId || null,
        parentName: parent ? parent.name : null,
        status: 'Active',
        employeeCount: 0,
      };
      _mockDepts = [..._mockDepts, newDept];
      return { success: true, data: newDept, error: null };
    }
    const res = await client.post('/departments', data);
    return res.data;
  },

  async update(id, data) {
    if (USE_MOCKS) {
      await delay(500);
      const head = data.headId
        ? mockEmployees.find((e) => e.id === data.headId)
        : null;
      const parent = data.parentId
        ? _mockDepts.find((d) => d.id === data.parentId)
        : null;
      _mockDepts = _mockDepts.map((d) =>
        d.id === id
          ? {
              ...d,
              ...data,
              headName: head ? head.name : d.headName,
              parentName: parent ? parent.name : d.parentName,
            }
          : d
      );
      const updated = _mockDepts.find((d) => d.id === id);
      return { success: true, data: updated, error: null };
    }
    const res = await client.put(`/departments/${id}`, data);
    return res.data;
  },

  async deactivate(id) {
    if (USE_MOCKS) {
      await delay(400);
      _mockDepts = _mockDepts.map((d) =>
        d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d
      );
      const updated = _mockDepts.find((d) => d.id === id);
      return { success: true, data: updated, error: null };
    }
    // PATCH — matches backend route
    const res = await client.patch(`/departments/${id}/deactivate`);
    return res.data;
  },
};

// ─────────────────────────────────────────────────────────────
// CATEGORIES API
// ─────────────────────────────────────────────────────────────
// GET  /api/categories       → { success, data: [...] }
// POST /api/categories       → { success, data: { category } }
// PUT  /api/categories/:id   → { success, data: { category } }
// ─────────────────────────────────────────────────────────────
let _mockCats = [...mockCategories];

export const categoriesApi = {
  async getAll() {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: _mockCats, error: null };
    }
    const res = await client.get('/categories');
    return res.data;
  },

  async create(data) {
    if (USE_MOCKS) {
      await delay(500);
      const newCat = {
        id: `cat-${Date.now()}`,
        name: data.name,
        description: data.description || '',
        customFields: data.customFields || [],
        assetCount: 0,
      };
      _mockCats = [..._mockCats, newCat];
      return { success: true, data: newCat, error: null };
    }
    const res = await client.post('/categories', data);
    return res.data;
  },

  async update(id, data) {
    if (USE_MOCKS) {
      await delay(500);
      _mockCats = _mockCats.map((c) =>
        c.id === id ? { ...c, ...data } : c
      );
      const updated = _mockCats.find((c) => c.id === id);
      return { success: true, data: updated, error: null };
    }
    const res = await client.put(`/categories/${id}`, data);
    return res.data;
  },
};

// ─────────────────────────────────────────────────────────────
// EMPLOYEES API
// ─────────────────────────────────────────────────────────────
// GET /api/employees?search=&department=&role=&status=  → { success, data: [...] }
// PUT /api/employees/:id/role  { role }                 → { success, data: { user } }
// ─────────────────────────────────────────────────────────────
let _mockEmps = [...mockEmployees];

export const employeesApi = {
  async getAll(params = {}) {
    if (USE_MOCKS) {
      await delay(400);
      let filtered = [..._mockEmps];
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(s) ||
            e.email.toLowerCase().includes(s)
        );
      }
      if (params.department) {
        filtered = filtered.filter((e) => e.department === params.department);
      }
      if (params.role) {
        filtered = filtered.filter((e) => e.role === params.role);
      }
      if (params.status) {
        filtered = filtered.filter((e) => e.status === params.status);
      }
      return { success: true, data: filtered, error: null };
    }
    const res = await client.get('/employees', { params });
    return res.data;
  },

  async updateRole(id, role, departmentId) {
    if (USE_MOCKS) {
      await delay(500);
      _mockEmps = _mockEmps.map((e) =>
        e.id === id ? { ...e, role, departmentId } : e
      );
      const updated = _mockEmps.find((e) => e.id === id);
      return { success: true, data: updated, error: null };
    }
    // PATCH — updates a user's role and/or department
    const res = await client.patch(`/employees/${id}/role`, { role, departmentId });
    return res.data;
  },

  async deactivate(id) {
    if (USE_MOCKS) {
      await delay(400);
      _mockEmps = _mockEmps.map((e) =>
        e.id === id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e
      );
      const updated = _mockEmps.find((e) => e.id === id);
      return { success: true, data: updated, error: null };
    }
    const res = await client.patch(`/employees/${id}/deactivate`);
    return res.data;
  },
};

// ─────────────────────────────────────────────────────────────
// ASSETS API
// ─────────────────────────────────────────────────────────────
export const assetsApi = {
  async getAll(params = {}) {
    if (USE_MOCKS) {
      await delay(300);
      return { success: true, data: [], error: null };
    }
    const res = await client.get('/assets', { params });
    return res.data;
  },

  async getById(id) {
    if (USE_MOCKS) {
      await delay(300);
      return { success: false, data: null, error: 'Not in mock mode' };
    }
    const res = await client.get(`/assets/${id}`);
    return res.data;
  },

  async create(formData) {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: { id: `ast-${Date.now()}`, ...formData }, error: null };
    }
    const res = await client.post('/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async update(id, formData) {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: { id }, error: null };
    }
    const res = await client.put(`/assets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getHistory(id) {
    if (USE_MOCKS) {
      await delay(300);
      return { success: true, data: { allocations: [], maintenance: [] }, error: null };
    }
    const res = await client.get(`/assets/${id}/history`);
    return res.data;
  },
};

// ─────────────────────────────────────────────────────────────
// ALLOCATIONS API
// ─────────────────────────────────────────────────────────────
export const allocationsApi = {
  async getAll(params = {}) {
    if (USE_MOCKS) { await delay(400); return { success: true, data: [], error: null }; }
    const res = await client.get('/allocations', { params });
    return res.data;
  },

  async getOverdue() {
    if (USE_MOCKS) { await delay(400); return { success: true, data: [], error: null }; }
    const res = await client.get('/allocations/overdue');
    return res.data;
  },

  async allocate(data) {
    if (USE_MOCKS) {
      await delay(500);
      return { success: true, data: { id: `al-${Date.now()}`, ...data, status: 'Active' }, error: null };
    }
    const res = await client.post('/allocations', data);
    return res.data;
  },

  async returnAsset(id, notes) {
    if (USE_MOCKS) { await delay(400); return { success: true, data: { id, status: 'Returned' }, error: null }; }
    const res = await client.post(`/allocations/${id}/return`, { notes });
    return res.data;
  },
};

// ─────────────────────────────────────────────────────────────
// TRANSFERS API
// ─────────────────────────────────────────────────────────────
export const transfersApi = {
  async getAll(params = {}) {
    if (USE_MOCKS) { await delay(400); return { success: true, data: [], error: null }; }
    const res = await client.get('/transfers', { params });
    return res.data;
  },

  async create(data) {
    if (USE_MOCKS) {
      await delay(500);
      return { success: true, data: { id: `tr-${Date.now()}`, ...data, status: 'Requested' }, error: null };
    }
    const res = await client.post('/transfers', data);
    return res.data;
  },

  async approve(id) {
    if (USE_MOCKS) { await delay(400); return { success: true, data: { id, status: 'Approved' }, error: null }; }
    const res = await client.patch(`/transfers/${id}/approve`);
    return res.data;
  },

  async reject(id, notes) {
    if (USE_MOCKS) { await delay(400); return { success: true, data: { id, status: 'Rejected' }, error: null }; }
    const res = await client.patch(`/transfers/${id}/reject`, { notes });
    return res.data;
  },
};


// ─────────────────────────────────────────────────────────────
// BOOKINGS API
// ─────────────────────────────────────────────────────────────
export const bookingsApi = {
  async getAll(params = {}) {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: [], error: null };
    }
    const res = await client.get('/bookings', { params });
    return res.data;
  },

  async create(data) {
    if (USE_MOCKS) {
      await delay(500);
      return { success: true, data: { id: `bk-${Date.now()}`, ...data, status: 'Upcoming' }, error: null };
    }
    const res = await client.post('/bookings', data);
    return res.data;
  },

  async cancel(id) {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: { id, status: 'Cancelled' }, error: null };
    }
    const res = await client.patch(`/bookings/${id}/cancel`);
    return res.data;
  },

  async reschedule(id, data) {
    if (USE_MOCKS) {
      await delay(500);
      return { success: true, data: { id, ...data, status: 'Upcoming' }, error: null };
    }
    const res = await client.patch(`/bookings/${id}/reschedule`, data);
    return res.data;
  },

  async getActiveCount() {
    if (USE_MOCKS) {
      await delay(300);
      return { success: true, data: { count: 3 }, error: null };
    }
    const res = await client.get('/bookings/active-count');
    return res.data;
  }
};

// ─────────────────────────────────────────────────────────────
// MAINTENANCE API
// ─────────────────────────────────────────────────────────────
export const maintenanceApi = {
  async getAll(params = {}) {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: [], error: null };
    }
    const res = await client.get('/maintenance', { params });
    return res.data;
  },

  async create(data) {
    if (USE_MOCKS) {
      await delay(500);
      return { success: true, data: { id: `maint-${Date.now()}`, ...data, status: 'Pending' }, error: null };
    }
    const res = await client.post('/maintenance', data);
    return res.data;
  },

  async approve(id) {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: { id, status: 'Approved' }, error: null };
    }
    const res = await client.patch(`/maintenance/${id}/approve`);
    return res.data;
  },

  async reject(id) {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: { id, status: 'Rejected' }, error: null };
    }
    const res = await client.patch(`/maintenance/${id}/reject`);
    return res.data;
  },

  async assign(id, technicianName) {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: { id, status: 'In Progress', technicianAssigned: technicianName }, error: null };
    }
    const res = await client.patch(`/maintenance/${id}/assign`, { technicianName });
    return res.data;
  },

  async resolve(id) {
    if (USE_MOCKS) {
      await delay(400);
      return { success: true, data: { id, status: 'Resolved' }, error: null };
    }
    const res = await client.patch(`/maintenance/${id}/resolve`);
    return res.data;
  },

  async getTodayCount() {
    if (USE_MOCKS) {
      await delay(300);
      return { success: true, data: { count: 1 }, error: null };
    }
    const res = await client.get('/maintenance/today-count');
    return res.data;
  }
};
