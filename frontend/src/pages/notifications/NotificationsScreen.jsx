import React, { useState, useEffect } from 'react';
import client from '../../api/client';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Alerts', 'Approvals', 'Bookings'];

  const mockInitialNotifications = [
    {
      id: 1,
      category: 'Alerts',
      message: 'Asset AF-0012 marked as Damaged',
      time: '10m ago',
      severity: 'high',
    },
    {
      id: 2,
      category: 'Approvals',
      message: 'Laptop checkout request by Sarah Jenkins pending approval',
      time: '45m ago',
      severity: 'medium',
    },
    {
      id: 3,
      category: 'Bookings',
      message: 'Conference Room Alpha booked by Product Design team for 2:00 PM',
      time: '1h ago',
      severity: 'low',
    },
    {
      id: 4,
      category: 'Alerts',
      message: 'Temperature warning in Server Room C',
      time: '2h ago',
      severity: 'high',
    },
    {
      id: 5,
      category: 'Bookings',
      message: 'Testing Kit B reserved by Yukesh for July 15',
      time: '3h ago',
      severity: 'low',
    },
    {
      id: 6,
      category: 'Approvals',
      message: 'Disposal request for 5 obsolete monitors approved',
      time: '1d ago',
      severity: 'low',
    },
  ];

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        const response = await client.get('/notifications');
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setNotifications(response.data.data);
        } else {
          setNotifications(mockInitialNotifications);
        }
      } catch (error) {
        console.warn('Failed to fetch notifications from API, falling back to mock data:', error);
        setNotifications(mockInitialNotifications);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white text-slate-800 font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-800 font-sans">
      <div className="border-b border-slate-100 pb-6 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Notification Center</h1>
        <p className="text-sm text-slate-500">Stay updated on system warnings, workflow approvals, and asset allocations.</p>
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

      {/* Main Feed */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 border border-slate-100 rounded bg-slate-50/50 text-slate-400 text-sm italic">
            No notifications found for category "{activeFilter}"
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded hover:border-slate-400 transition-colors duration-150"
            >
              <div className="flex items-center space-x-3 mr-4">
                {/* Status Dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${getSeverityStyle(notif.severity)}`} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    {notif.category}
                  </span>
                  <span className="text-sm text-slate-700 font-medium leading-relaxed">
                    {notif.message}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                {notif.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
