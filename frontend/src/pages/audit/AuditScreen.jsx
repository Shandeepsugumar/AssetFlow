import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AuditScreen() {
  const { user } = useAuth();
  const canManage = user && ['Admin', 'Asset Manager', 'admin', 'asset_manager'].includes(user.role);
  
  // Views: 'list', 'create', 'session'
  const [view, setView] = useState('list');
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create form
  const [newCycle, setNewCycle] = useState({ name: '', departmentId: '', location: '', startDate: '', endDate: '' });
  const [departments, setDepartments] = useState([]);

  // Session view
  const [activeCycle, setActiveCycle] = useState(null);

  useEffect(() => {
    if (view === 'list') {
      fetchCycles();
    } else if (view === 'create') {
      fetchDepartments();
    }
  }, [view]);

  async function fetchCycles() {
    try {
      setLoading(true);
      const res = await client.get('/audits');
      if (res.data.success) {
        setCycles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch audits:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDepartments() {
    try {
      const res = await client.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateCycle(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...newCycle,
        auditorIds: [user.id] // Assign self as auditor for simplicity
      };
      const res = await client.post('/audits', payload);
      if (res.data.success) {
        setView('list');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create cycle. You must be an admin.');
    } finally {
      setLoading(false);
    }
  }

  async function openCycle(cycleId) {
    try {
      setLoading(true);
      const res = await client.get(`/audits/${cycleId}`);
      if (res.data.success) {
        setActiveCycle(res.data.data);
        setView('session');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(itemId, newStatus) {
    try {
      await client.put(`/audits/${activeCycle.id}/items/${itemId}`, { status: newStatus });
      // update local state
      setActiveCycle(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.audit_item_id === itemId ? { ...item, verification_status: newStatus } : item
        )
      }));
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  }

  async function handleCloseCycle() {
    try {
      const res = await client.post(`/audits/${activeCycle.id}/close`);
      if (res.data.success) {
        alert(`Audit cycle closed. ${res.data.data.flagged} discrepancies flagged.`);
        setView('list');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close cycle');
    }
  }

  if (loading && view !== 'session') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  // ── LIST VIEW ────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="max-w-5xl mx-auto my-8 p-8 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-800 font-sans">
        <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Audit Cycles</h1>
            <p className="text-sm text-slate-500">Manage and track asset verification cycles.</p>
          </div>
          {canManage && (
            <button
              onClick={() => setView('create')}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-slate-900 transition-colors"
            >
              + Create Cycle
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cycles.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-slate-500 bg-slate-50 rounded">No audit cycles found.</div>
          ) : (
            cycles.map(cycle => (
              <div key={cycle.id} className="border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900">{cycle.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cycle.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {cycle.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mb-4">
                  {cycle.department_name ? `Dept: ${cycle.department_name}` : ''} 
                  {cycle.scope_location ? ` | Loc: ${cycle.scope_location}` : ''}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-900">{cycle.verified_items}</span> / {cycle.total_items} Verified
                  </div>
                  <button onClick={() => openCycle(cycle.id)} className="text-blue-600 hover:text-blue-800 font-medium">
                    {cycle.status === 'Active' ? 'Continue Audit →' : 'View Report →'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── CREATE VIEW ─────────────────────────────────────────────
  if (view === 'create') {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-800 font-sans">
        <div className="border-b border-slate-100 pb-6 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Create Audit Cycle</h1>
          <p className="text-sm text-slate-500">Define the scope for a new asset verification cycle.</p>
        </div>
        <form onSubmit={handleCreateCycle} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Cycle Name *</label>
            <input required type="text" value={newCycle.name} onChange={e => setNewCycle({...newCycle, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-black" placeholder="e.g. Q3 Hardware Audit" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Scope: Department</label>
              <select value={newCycle.departmentId} onChange={e => setNewCycle({...newCycle, departmentId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-black">
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Scope: Location</label>
              <input type="text" value={newCycle.location} onChange={e => setNewCycle({...newCycle, location: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-black" placeholder="Optional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Start Date *</label>
              <input required type="date" value={newCycle.startDate} onChange={e => setNewCycle({...newCycle, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">End Date</label>
              <input type="date" value={newCycle.endDate} onChange={e => setNewCycle({...newCycle, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-black" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setView('list')} className="px-4 py-2 border border-slate-200 text-slate-600 rounded text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded text-sm font-medium hover:bg-slate-900 disabled:opacity-50">Create Cycle</button>
          </div>
        </form>
      </div>
    );
  }

  // ── SESSION VIEW ────────────────────────────────────────────
  if (view === 'session' && activeCycle) {
    const flaggedAssets = activeCycle.items.filter(i => i.verification_status === 'Missing' || i.verification_status === 'Damaged');
    
    return (
      <div className="max-w-4xl mx-auto my-8 p-8 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-800 font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
          <div>
            <button onClick={() => setView('list')} className="text-sm text-slate-500 hover:text-black mb-2 inline-block">← Back to Cycles</button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{activeCycle.name}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${activeCycle.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
            {activeCycle.status}
          </span>
        </div>

        <div className="border border-slate-200 rounded overflow-hidden mb-8">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-slate-600">Asset</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Location</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeCycle.items.map((item) => (
                <tr key={item.audit_item_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-mono font-medium text-slate-900">{item.asset_tag}</div>
                    <div className="text-slate-500 text-xs">{item.asset_name}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{item.expected_location || 'Unknown'}</td>
                  <td className="px-4 py-4 text-right">
                    {activeCycle.status === 'Completed' ? (
                       <span className="font-semibold text-slate-700">{item.verification_status}</span>
                    ) : (
                      <div className="inline-flex space-x-1">
                        <button onClick={() => handleStatusChange(item.audit_item_id, 'Verified')} className={`px-3 py-1 text-xs font-medium rounded border ${item.verification_status === 'Verified' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Verified</button>
                        <button onClick={() => handleStatusChange(item.audit_item_id, 'Missing')} className={`px-3 py-1 text-xs font-medium rounded border ${item.verification_status === 'Missing' ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Missing</button>
                        <button onClick={() => handleStatusChange(item.audit_item_id, 'Damaged')} className={`px-3 py-1 text-xs font-medium rounded border ${item.verification_status === 'Damaged' ? 'bg-amber-50 border-amber-300 text-amber-700 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Damaged</button>
                      </div>
                    )}
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
            <span className="text-[11px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {flaggedAssets.length} Flagged
            </span>
          </div>

          {flaggedAssets.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No discrepancy found. All assets match their status.</p>
          ) : (
            <div className="space-y-2">
              {flaggedAssets.map((asset) => (
                <div
                  key={asset.audit_item_id}
                  className="flex justify-between items-center text-xs py-2 px-3 bg-white border border-slate-200 rounded shadow-sm"
                >
                  <div>
                    <span className="font-mono font-semibold text-slate-800 mr-2">{asset.asset_tag}</span>
                    <span className="text-slate-600 font-medium">{asset.asset_name}</span>
                    <span className="text-slate-400 ml-2">({asset.expected_location || 'Unknown location'})</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold capitalize text-[10px] ${
                      asset.verification_status === 'Missing'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {asset.verification_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeCycle.status === 'Active' && canManage && (
          <button onClick={handleCloseCycle} className="w-full py-3 bg-black hover:bg-slate-900 text-white font-medium text-sm rounded shadow uppercase tracking-wider disabled:opacity-50">
            Close Cycle ({flaggedAssets.length} Discrepancies)
          </button>
        )}
      </div>
    );
  }

  return null;
}
