import React, { useState, useEffect } from 'react';
import client from '../../api/client';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Alerts', 'Approvals', 'Bookings', 'Activity Logs'];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        if (activeFilter === 'Activity Logs') {
          const res = await client.get('/activity-logs?limit=50');
          if (res.data.success) {
            setActivityLogs(res.data.data);
          }
        } else {
          const res = await client.get('/notifications');
          if (res.data.success) {
            setNotifications(res.data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeFilter]);

  const filteredNotifications = activeFilter === 'All'
    ? notifications
    : notifications.filter(n => n.category === activeFilter);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-rose-500';
      case 'medium':
        return 'bg-amber-500';
      default:
        return 'bg-slate-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-800 font-sans">
      <div className="border-b border-slate-100 pb-6 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Notification & Activity Center</h1>
        <p className="text-sm text-slate-500">Stay updated on system warnings, workflow approvals, and historical system logs.</p>
      </div>

      {/* Top Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 text-xs font-semibold rounded border transition-colors duration-150 uppercase tracking-wider ${
              activeFilter === filter
                ? 'bg-black border-black text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading...</div>
      ) : activeFilter === 'Activity Logs' ? (
        /* Activity Logs View */
        <div className="space-y-3">
          {activityLogs.length === 0 ? (
            <div className="text-center py-12 border border-slate-100 rounded bg-slate-50/50 text-slate-400 text-sm italic">
              No activity logs recorded yet.
            </div>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="p-4 bg-white border border-slate-200 rounded hover:border-slate-400 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold text-slate-900">{log.action}</span>
                  <span className="text-xs font-mono text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <div className="text-xs text-slate-500 flex space-x-4">
                  <span>User: <strong className="text-slate-700">{log.user_name || 'System / Admin'}</strong></span>
                  <span>Entity: <strong className="text-slate-700 uppercase font-mono">{log.entity_type}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Notifications Feed */
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 border border-slate-100 rounded bg-slate-50/50 text-slate-400 text-sm italic">
              No notifications found for category "{activeFilter}"
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded hover:border-slate-400 transition-colors duration-150">
                <div className="flex items-center space-x-3 mr-4">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getSeverityStyle(notif.severity)}`} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">{notif.category}</span>
                    <span className="text-sm text-slate-700 font-medium leading-relaxed">{notif.message}</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 whitespace-nowrap">{notif.time}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
