/**
 * ============================================================
 * AssetFlow — Centralized Route Configuration
 * ============================================================
 * All routes for the app are defined here.
 * Teammates: add your module routes in the marked sections below.
 * ============================================================
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages (public)
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Member 1 pages (Foundation)
import Dashboard from './pages/dashboard/Dashboard';
import OrgSetup from './pages/org-setup/OrgSetup';

// Member 2 pages (Assets & Allocation)
import AssetDirectoryPage from './pages/assets/AssetDirectoryPage';
import AssetAllocationPage from './pages/assets/AssetAllocationPage';

// Member 3 pages (Bookings & Maintenance)
import BookingsPage from './pages/bookings/BookingsPage';
import MaintenancePage from './pages/maintenance/MaintenancePage';

// Stub pages for teammate modules
import ComingSoon from './pages/stubs/ComingSoon';

// Member 4 pages (Audit, Reports, Notifications)
import AuditScreen from './pages/audit/AuditScreen';
import ReportsScreen from './pages/reports/ReportsScreen';
import NotificationsScreen from './pages/notifications/NotificationsScreen';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Auth Routes ─────────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── Protected App Shell ────────────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Root redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* ─── Member 1: Foundation (Dashboard, Org Setup) ─── */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="org-setup"
          element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <OrgSetup />
            </ProtectedRoute>
          }
        />

        {/* ─── Member 2: Assets & Allocation ─── */}
        <Route path="assets" element={<AssetDirectoryPage />} />
        <Route path="allocation" element={<AssetAllocationPage />} />

        {/* ─── Member 3: Bookings & Maintenance ─── */}
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/new" element={<BookingsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="maintenance/new" element={<MaintenancePage />} />

        {/* ─── Member 4: Audit & Reports ─── */}
        <Route
          path="audit"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Asset Manager']}>
              <AuditScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Asset Manager', 'Department Head']}>
              <ReportsScreen />
            </ProtectedRoute>
          }
        />

        {/* ─── Notifications (all roles) ─── */}
        <Route path="notifications" element={<NotificationsScreen />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Global catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
