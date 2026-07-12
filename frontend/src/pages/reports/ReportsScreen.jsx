import React, { useState, useEffect } from 'react';
import client from '../../api/client';

export default function ReportsScreen() {
  const [utilization, setUtilization] = useState(null);
  const [maintenance, setMaintenance] = useState(null);

  useEffect(() => {
    async function fetchReportsData() {
      try {
        const utilResponse = await client.get('/reports/utilization');
        if (utilResponse.data && utilResponse.data.success) {
          setUtilization(utilResponse.data.data);
        }
      } catch (error) {
        console.warn('Failed to fetch utilization report from API, using mock state defaults:', error);
      }

      try {
        const maintResponse = await client.get('/reports/maintenance');
        if (maintResponse.data && maintResponse.data.success) {
          setMaintenance(maintResponse.data.data);
        }
      } catch (error) {
        console.warn('Failed to fetch maintenance report from API, using mock state defaults:', error);
      }
    }

    fetchReportsData();
  }, []);

  const handleExport = async () => {
    try {
      const response = await client.get('/reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'assetflow-report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Failed to export report:', error);
      alert('Failed to export report.');
    }
  };

  // Determine chart values (either from backend or fallback to the sandbox design metrics)
  const barChartValues = (utilization && Array.isArray(utilization.monthlyValues))
    ? utilization.monthlyValues
    : [40, 65, 50, 85, 70, 95, 80];

  const barChartLabels = (utilization && Array.isArray(utilization.months))
    ? utilization.months
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const lineChartPath = (maintenance && maintenance.pathD)
    ? maintenance.pathD
    : 'M 10 120 Q 60 70, 110 90 T 210 30 T 290 50';

  const lineChartPoints = (maintenance && Array.isArray(maintenance.points))
    ? maintenance.points
    : [
        { cx: 10, cy: 120 },
        { cx: 110, cy: 90 },
        { cx: 210, cy: 30 },
        { cx: 290, cy: 50 }
      ];

  const lineChartLabels = (maintenance && Array.isArray(maintenance.labels))
    ? maintenance.labels
    : ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];

  // Inject state summaries if they exist, otherwise use our elegant default descriptions
  const mostUsedDescription = (utilization && utilization.mostUsedDescription)
    ? utilization.mostUsedDescription
    : 'MacBook Pro 16" (M2) leads with a 94.2% active usage rate, followed closely by Dell 34" Curved Monitors.';

  const mostUsedStat = (utilization && utilization.mostUsedStat)
    ? utilization.mostUsedStat
    : '94.2% Peak';

  const idleDescription = (utilization && utilization.idleDescription)
    ? utilization.idleDescription
    : '12 iPad Pro units located in storage lockers have been inactive for over 30 days. Action recommended.';

  const idleStat = (utilization && utilization.idleStat)
    ? utilization.idleStat
    : '12 Units';

  const nearingRetirementDescription = (utilization && utilization.nearingRetirementDescription)
    ? utilization.nearingRetirementDescription
    : '4 Enterprise printers and 15 ThinkPad X1 laptops will reach their end-of-support lease next month.';

  const nearingRetirementStat = (utilization && utilization.nearingRetirementStat)
    ? utilization.nearingRetirementStat
    : '19 Assets';

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
            {barChartValues.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center w-8">
                <div 
                  style={{ height: `${val}%` }} 
                  className="w-full bg-slate-800 hover:bg-black transition-colors rounded-t-sm"
                />
                <span className="text-[10px] font-mono text-slate-400 mt-2">
                  {barChartLabels[idx] || ''}
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
                d={lineChartPath}
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
              {/* Points */}
              {lineChartPoints.map((pt, idx) => (
                <circle key={idx} cx={pt.cx} cy={pt.cy} r="4" fill="#0f172a" />
              ))}
            </svg>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 px-1">
              {lineChartLabels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
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
                {mostUsedDescription}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Updated 1h ago</span>
              <span className="text-slate-800 font-semibold">{mostUsedStat}</span>
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
                {idleDescription}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Stale Devices</span>
              <span className="text-rose-600 font-semibold">{idleStat}</span>
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
                {nearingRetirementDescription}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Depreciation</span>
              <span className="text-amber-600 font-semibold">{nearingRetirementStat}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
