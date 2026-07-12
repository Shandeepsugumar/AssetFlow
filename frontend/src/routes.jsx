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

// Stub pages for teammate modules
import ComingSoon from './pages/stubs/ComingSoon';

// Member 4: Audit & Reports
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

        {/* ─── Member 3: Bookings & Maintenance (stub routes) ─── */}
        <Route
          path="bookings"
          element={
            <ComingSoon
              title="Resource Booking"
              description="Book shared resources like conference rooms, vehicles, and equipment."
            />
          }
        />
        <Route
          path="bookings/new"
          element={
            <ComingSoon
              title="Book Resource"
              description="The resource booking form will be available here."
            />
          }
        />
        <Route
          path="maintenance"
          element={
            <ComingSoon
              title="Maintenance"
              description="Maintenance request tracking and scheduling will be available here."
            />
          }
        />
        <Route
          path="maintenance/new"
          element={
            <ComingSoon
              title="Raise Maintenance Request"
              description="The maintenance request form will be available here."
            />
          }
        />

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
        <Route
          path="notifications"
          element={
            <NotificationsScreen />
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
