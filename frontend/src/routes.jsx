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

// Member 3 pages (Bookings & Maintenance)
import BookingsPage from './pages/bookings/BookingsPage';
import MaintenancePage from './pages/maintenance/MaintenancePage';

// Stub pages for teammate modules
import ComingSoon from './pages/stubs/ComingSoon';

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

        {/* ─── Member 2: Assets & Allocation (stub routes) ─── */}
        <Route
          path="assets"
          element={
            <ComingSoon
              title="Assets"
              description="Asset registration, lifecycle tracking, and inventory management will be available here."
            />
          }
        />
        <Route
          path="assets/new"
          element={
            <ComingSoon
              title="Register Asset"
              description="The asset registration form will be available here."
            />
          }
        />
        <Route
          path="allocation"
          element={
            <ComingSoon
              title="Allocation & Transfer"
              description="Asset allocation, transfer requests, and return tracking will be available here."
            />
          }
        />

        {/* ─── Member 3: Bookings & Maintenance ─── */}
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/new" element={<BookingsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="maintenance/new" element={<MaintenancePage />} />

        {/* ─── Member 4: Audit & Reports (stub routes) ─── */}
        <Route
          path="audit"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Asset Manager']}>
              <ComingSoon
                title="Audit"
                description="Audit cycle management, compliance tracking, and audit reports will be available here."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Asset Manager', 'Department Head']}>
              <ComingSoon
                title="Reports"
                description="Analytics dashboards, usage reports, and data exports will be available here."
              />
            </ProtectedRoute>
          }
        />

        {/* ─── Notifications (all roles) ─── */}
        <Route
          path="notifications"
          element={
            <ComingSoon
              title="Notifications"
              description="System notifications, alerts, and reminders will be available here."
            />
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Global catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
