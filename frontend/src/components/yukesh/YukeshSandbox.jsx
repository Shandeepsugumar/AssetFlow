import React, { useState } from 'react';
import AuditScreen from './AuditScreen';
import ReportsScreen from './ReportsScreen';
import NotificationsScreen from './NotificationsScreen';

export default function YukeshSandbox() {
  const [activeTab, setActiveTab] = useState('audit');

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 pb-5 mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Yukesh's Module Sandbox</h2>
            <p className="text-xs text-slate-500 mt-1">Isolate-tested React components for auditing, reports, and notifications.</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex mt-4 sm:mt-0 bg-white border border-slate-200 rounded p-1 space-x-1 shadow-sm">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 text-xs font-semibold rounded uppercase tracking-wider transition-colors duration-150 ${
                activeTab === 'audit'
                  ? 'bg-black text-white'
                  : 'text-slate-600 hover:text-black hover:bg-slate-50'
              }`}
            >
              Audit
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 text-xs font-semibold rounded uppercase tracking-wider transition-colors duration-150 ${
                activeTab === 'reports'
                  ? 'bg-black text-white'
                  : 'text-slate-600 hover:text-black hover:bg-slate-50'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 text-xs font-semibold rounded uppercase tracking-wider transition-colors duration-150 ${
                activeTab === 'notifications'
                  ? 'bg-black text-white'
                  : 'text-slate-600 hover:text-black hover:bg-slate-50'
              }`}
            >
              Notifications
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Screen Rendering */}
      <div className="transition-all duration-300">
        {activeTab === 'audit' && <AuditScreen />}
        {activeTab === 'reports' && <ReportsScreen />}
        {activeTab === 'notifications' && <NotificationsScreen />}
      </div>
    </div>
  );
}
