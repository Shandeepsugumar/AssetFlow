import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, Button } from './ui';
import { ShieldX } from 'lucide-react';

export default function ProtectedRoute({ requiredRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();

  // Still bootstrapping session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-6">
        <div className="bg-surface rounded-xl shadow-card p-8 max-w-md text-center animate-fade-in">
          <div className="mx-auto mb-4 p-3 bg-danger-50 rounded-full w-fit">
            <ShieldX className="h-10 w-10 text-danger-600" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Access Denied
          </h2>
          <p className="text-text-secondary mb-6">
            You don't have permission to access this page. This section requires{' '}
            <span className="font-medium">{requiredRoles.join(' or ')}</span> access.
          </p>
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Authorized → render children or Outlet
  return children || <Outlet />;
}
