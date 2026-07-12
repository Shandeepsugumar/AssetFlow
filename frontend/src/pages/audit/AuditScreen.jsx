import React, { useState, useEffect } from 'react';
import client from '../../api/client';

export default function AuditScreen() {
  const [cycleName, setCycleName] = useState('Q3 General Hardware Audit');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('IT Engineering');

  const [auditItems, setAuditItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock fallback assets
  const mockInitialAssets = [
    { id: 'AF-0012', name: 'MacBook Pro 16"', expectedLocation: 'HQ - 4th Floor', status: 'pending' },
    { id: 'AF-0089', name: 'Dell UltraSharp 34"', expectedLocation: 'Design Lab', status: 'pending' },
    { id: 'AF-0104', name: 'iPad Pro 12.9"', expectedLocation: 'Executive Suite', status: 'pending' },
  ];

  useEffect(() => {
    async function fetchAuditData() {
      try {
        setLoading(true);
        const response = await client.get('/audits');
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setAuditItems(response.data.data);
        } else {
          // Fallback to mocks if response is not standard
          setAuditItems(mockInitialAssets);
        }
      } catch (error) {
        console.warn('Failed to fetch audits from API, falling back to mock data:', error);
        setAuditItems(mockInitialAssets);
      } finally {
        setLoading(false);
      }
    }

    fetchAuditData();
  }, []);

  const handleStatusChange = (assetId, newStatus) => {
    setAuditItems(prevItems =>
      prevItems.map(item =>
        item.id === assetId ? { ...item, status: newStatus } : item
      )
    );
  };

  // Flagged items for discrepancy preview (Missing or Damaged)
  const flaggedAssets = auditItems.filter(item => item.status === 'missing' || item.status === 'damaged');

  const handleCloseCycle = () => {
    alert(`Audit Cycle "${cycleName}" for ${department} closed successfully with ${flaggedAssets.length} discrepancy/discrepancies found.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white text-slate-800 font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Loading audit data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-800 font-sans">
      <div className="border-b border-slate-100 pb-6 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Asset Audit Session</h1>
        <p className="text-sm text-slate-500">Perform real-time asset verification and flag location or status discrepancies.</p>
      </div>

      {/* Top section: Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Audit Cycle Name
          </label>
          <input
            type="text"
            value={cycleName}
            onChange={(e) => setCycleName(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-slate-800 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Audit Date
          </label>
          <input
            type="date"
            value={auditDate}
            onChange={(e) => setAuditDate(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-slate-800 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-slate-800 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value="IT Engineering">IT Engineering</option>
            <option value="Product Design">Product Design</option>
            <option value="Operations & HR">Operations & HR</option>
            <option value="Executive Management">Executive Management</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-200 rounded overflow-hidden mb-8">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 font-semibold text-slate-600">Asset Tag</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Asset Name</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Expected Location</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-4 font-mono font-medium text-slate-900">{item.id}</td>
                <td className="px-4 py-4 text-slate-700">{item.name}</td>
                <td className="px-4 py-4 text-slate-500">{item.expectedLocation}</td>
                <td className="px-4 py-4 text-right">
                  <div className="inline-flex space-x-1">
                    <button
                      onClick={() => handleStatusChange(item.id, 'verified')}
                      className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                        item.status === 'verified'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                          : 'bg-white border-slate-200 text-emerald-600 hover:bg-emerald-50/50'
                      }`}
                    >
                      Verified
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'missing')}
                      className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                        item.status === 'missing'
                          ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold'
                          : 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50/50'
                      }`}
                    >
                      Missing
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'damaged')}
                      className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                        item.status === 'damaged'
                          ? 'bg-amber-50 border-amber-300 text-amber-700 font-semibold'
                          : 'bg-white border-slate-200 text-amber-600 hover:bg-amber-50/50'
                      }`}
                    >
                      Damaged
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom section: Discrepancy Report Preview */}
      <div className="border border-slate-200 rounded p-5 mb-8 bg-slate-50/50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Discrepancy Report Preview
          </h3>
          <span className="text-[11px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
            {flaggedAssets.length} Flagged
          </span>
        </div>

        {flaggedAssets.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No discrepancy found. All assets match their status.</p>
        ) : (
          <div className="space-y-2">
            {flaggedAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex justify-between items-center text-xs py-2 px-3 bg-white border border-slate-200 rounded"
              >
                <div>
                  <span className="font-mono font-semibold text-slate-800 mr-2">{asset.id}</span>
                  <span className="text-slate-600">{asset.name}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-mono font-medium capitalize text-[10px] ${
                    asset.status === 'missing'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {asset.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Audit Cycle Button */}
      <button
        onClick={handleCloseCycle}
        className="w-full py-3 bg-black hover:bg-slate-900 text-white font-medium text-sm rounded shadow transition-colors duration-150 uppercase tracking-wider"
      >
        Close Audit Cycle
      </button>
    </div>
  );
}
