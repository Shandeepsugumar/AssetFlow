import React from 'react';

export default function ReportsScreen() {
  const handleExport = () => {
    alert('Exporting Report (CSV)...');
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-800 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics & Reports</h1>
          <p className="text-sm text-slate-500">Overview of utilization statistics, maintenance trends, and asset lifecycle.</p>
        </div>
        <button
          onClick={handleExport}
          className="self-start sm:self-auto px-5 py-2.5 bg-black hover:bg-slate-900 text-white font-medium text-xs rounded uppercase tracking-wider transition-colors duration-150"
        >
          Export Report (CSV)
        </button>
      </div>

      {/* Grid: 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Asset Utilization Trends Card */}
        <div className="flex flex-col p-6 bg-slate-50 border border-dashed border-slate-400 rounded-lg min-h-[340px] justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold tracking-tight text-slate-800">Asset Utilization Trends</h3>
            <p className="text-xs text-slate-400">Bar Chart — monthly peak allocations</p>
          </div>
          
          {/* Simple Inline SVG Bar Chart */}
          <div className="flex items-end justify-between h-48 px-4 border-b border-slate-200 pb-2">
            {[40, 65, 50, 85, 70, 95, 80].map((val, idx) => (
              <div key={idx} className="flex flex-col items-center w-8">
                <div 
                  style={{ height: `${val}%` }} 
                  className="w-full bg-slate-800 hover:bg-black transition-colors rounded-t-sm"
                />
                <span className="text-[10px] font-mono text-slate-400 mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][idx]}
                </span>
              </div>
            ))}
          </div>
          
          <div className="text-[11px] text-slate-500 font-mono mt-4 text-center">
            Figure 1.1: Percentage utilization rate across core engineering assets.
          </div>
        </div>

        {/* Maintenance Frequency Card */}
        <div className="flex flex-col p-6 bg-slate-50 border border-dashed border-slate-400 rounded-lg min-h-[340px] justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold tracking-tight text-slate-800">Maintenance Frequency</h3>
            <p className="text-xs text-slate-400">Line Chart — tickets logged vs. resolved</p>
          </div>
          
          {/* Simple Inline SVG Line Chart */}
          <div className="relative h-48 border-b border-slate-200 pb-2">
            <svg className="w-full h-full" viewBox="0 0 300 150">
              {/* Gridlines */}
              <line x1="0" y1="37.5" x2="300" y2="37.5" stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="300" y2="75" stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="0" y1="112.5" x2="300" y2="112.5" stroke="#e2e8f0" strokeDasharray="4 4" />
              
              {/* Path line */}
              <path
                d="M 10 120 Q 60 70, 110 90 T 210 30 T 290 50"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
              {/* Points */}
              <circle cx="10" cy="120" r="4" fill="#0f172a" />
              <circle cx="110" cy="90" r="4" fill="#0f172a" />
              <circle cx="210" cy="30" r="4" fill="#0f172a" />
              <circle cx="290" cy="50" r="4" fill="#0f172a" />
            </svg>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 px-1">
              <span>Wk 1</span>
              <span>Wk 2</span>
              <span>Wk 3</span>
              <span>Wk 4</span>
            </div>
          </div>
          
          <div className="text-[11px] text-slate-500 font-mono mt-4 text-center">
            Figure 1.2: Weekly aggregate support and service requests.
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Key Asset Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Most-used */}
          <div className="bg-white border border-slate-300 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Performance
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1">Most-used Assets</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                MacBook Pro 16" (M2) leads with a 94.2% active usage rate, followed closely by Dell 34" Curved Monitors.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Updated 1h ago</span>
              <span className="text-slate-800 font-semibold">94.2% Peak</span>
            </div>
          </div>

          {/* Card 2: Idle */}
          <div className="bg-white border border-slate-300 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Optimization
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1">Idle Assets</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                12 iPad Pro units located in storage lockers have been inactive for over 30 days. Action recommended.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Stale Devices</span>
              <span className="text-rose-600 font-semibold">12 Units</span>
            </div>
          </div>

          {/* Card 3: Nearing Retirement */}
          <div className="bg-white border border-slate-300 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Lifecycle
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1">Nearing Retirement</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                4 Enterprise printers and 15 ThinkPad X1 laptops will reach their end-of-support lease next month.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Depreciation</span>
              <span className="text-amber-600 font-semibold">19 Assets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
