import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/endpoints';
import { Button, Badge, LoadingSpinner, EmptyState } from '../../components/ui';
import {
  Package,
  Users,
  Wrench,
  CalendarCheck,
  ArrowLeftRight,
  RotateCcw,
  AlertTriangle,
  Plus,
  CalendarPlus,
  Clock,
  Activity,
  TrendingUp,
  Inbox,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResult = await dashboardApi.getStats();
        if (statsResult.success) {
          setStats(statsResult.data);
        }
      } catch {
        // Tolerate missing endpoint
      } finally {
        setLoading(false);
      }

      try {
        const actResult = await dashboardApi.getRecentActivity();
        if (actResult.success) {
          setActivity(actResult.data || []);
        }
      } catch {
        // Tolerate missing endpoint — show empty state
        setActivity([]);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpiCards = [
    {
      label: 'Assets Available',
      value: stats?.assetsAvailable ?? '—',
      icon: Package,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: 'Assets Allocated',
      value: stats?.assetsAllocated ?? '—',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Maintenance Today',
      value: stats?.maintenanceToday ?? '—',
      icon: Wrench,
      color: 'text-warning-600',
      bg: 'bg-warning-50',
    },
    {
      label: 'Active Bookings',
      value: stats?.activeBookings ?? '—',
      icon: CalendarCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Pending Transfers',
      value: stats?.pendingTransfers ?? '—',
      icon: ArrowLeftRight,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Upcoming Returns',
      value: stats?.upcomingReturns ?? '—',
      icon: RotateCcw,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
  ];

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  };

  const quickActions = [
    {
      label: 'Register Asset',
      icon: Plus,
      path: '/assets/new',
      description: 'Add a new asset to inventory',
    },
    {
      label: 'Book Resource',
      icon: CalendarPlus,
      path: '/bookings/new',
      description: 'Reserve a room or vehicle',
    },
    {
      label: 'Raise Maintenance',
      icon: Wrench,
      path: '/maintenance/new',
      description: 'Submit a maintenance request',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h2>
        <p className="text-text-secondary mt-1">
          Here's what's happening across your organization today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-surface rounded-xl border border-border p-5 hover:shadow-card-hover transition-shadow duration-200"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    {kpi.label}
                  </p>
                  <p className="text-3xl font-bold text-text-primary mt-1">
                    {kpi.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overdue Returns Callout */}
      {stats?.overdueReturns > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex items-start gap-3 animate-slide-in-up">
          <div className="p-2 bg-warning-100 rounded-lg shrink-0">
            <AlertTriangle className="h-5 w-5 text-warning-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-warning-800">
              {stats.overdueReturns} asset{stats.overdueReturns > 1 ? 's' : ''} overdue for return
            </h3>
            <p className="text-sm text-warning-700 mt-0.5">
              These items have passed their return date and are flagged for
              follow-up. Please review and take action.
            </p>
          </div>
          <Button
            variant="warning"
            size="sm"
            onClick={() => navigate('/allocation')}
          >
            Review
          </Button>
        </div>
      )}

      {/* Bottom Grid: Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-border">
            {activityLoading ? (
              <div className="p-8">
                <LoadingSpinner size="sm" text="Loading activity..." />
              </div>
            ) : activity.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Inbox}
                  title="No recent activity yet"
                  description="Activity from asset allocations, bookings, and maintenance will appear here."
                />
              </div>
            ) : (
              activity.map((log) => (
                <div
                  key={log.id}
                  className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface-secondary/50 transition-colors"
                >
                  <div className="p-1.5 bg-surface-secondary rounded-lg shrink-0">
                    <TrendingUp className="h-4 w-4 text-text-tertiary" />
                  </div>
                  <p className="text-sm text-text-primary flex-1">
                    {log.message}
                  </p>
                  <span className="text-xs text-text-tertiary whitespace-nowrap flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">
              Quick Actions
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 text-left group cursor-pointer"
                >
                  <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                    <Icon className="h-4.5 w-4.5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {action.label}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
