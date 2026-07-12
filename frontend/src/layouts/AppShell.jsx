import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui';
import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowLeftRight,
  CalendarCheck,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Hexagon,
} from 'lucide-react';

/**
 * Navigation items — EXACT order per spec.
 * `roles`: if null/undefined, visible to all roles.
 */
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: null },
  { label: 'Organization Setup', path: '/org-setup', icon: Building2, roles: ['Admin'] },
  { label: 'Assets', path: '/assets', icon: Package, roles: ['Admin', 'Asset Manager', 'Department Head'] },
  { label: 'Allocation & Transfer', path: '/allocation', icon: ArrowLeftRight, roles: ['Admin', 'Asset Manager', 'Department Head'] },
  { label: 'Resource Booking', path: '/bookings', icon: CalendarCheck, roles: null },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench, roles: null },
  { label: 'Audit', path: '/audit', icon: ClipboardCheck, roles: ['Admin', 'Asset Manager'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['Admin', 'Asset Manager', 'Department Head'] },
  { label: 'Notifications', path: '/notifications', icon: Bell, roles: null },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on wider screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  // Filter nav items by user role
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  // Find current page title
  const currentItem = NAV_ITEMS.find((item) =>
    location.pathname.startsWith(item.path)
  );
  const pageTitle = currentItem?.label || 'Dashboard';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center px-4 h-16 border-b border-white/10 shrink-0 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
        <Hexagon className="h-8 w-8 text-primary-500 shrink-0" fill="currentColor" strokeWidth={1.5} />
        {!collapsed && (
          <span className="text-lg font-bold text-white whitespace-nowrap">
            Asset<span className="text-primary-400">Flow</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-sidebar-active text-white shadow-md shadow-primary-900/20'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className={`border-t border-white/10 px-3 py-4 shrink-0 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 mb-3'}`}>
          <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-text truncate">
                {user?.role}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors w-full cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          title="Logout"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-surface-secondary">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-sidebar-bg transition-all duration-300 shrink-0 ${
          collapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ──────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 h-full bg-sidebar-bg flex flex-col animate-slide-in-right">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 p-1 rounded-lg text-sidebar-text hover:text-white hover:bg-sidebar-hover cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content Area ───────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-text-secondary hover:bg-gray-100 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors cursor-pointer"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>

            <h1 className="text-lg font-semibold text-text-primary">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">
                {user?.name}
              </span>
              <Badge status={user?.role === 'Admin' ? 'Active' : 'Available'}>
                {user?.role}
              </Badge>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-text-secondary hover:bg-gray-100 hover:text-danger-600 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
