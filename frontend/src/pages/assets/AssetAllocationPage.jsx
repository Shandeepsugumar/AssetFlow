import { useState, useEffect } from 'react';
import { allocationsApi, transfersApi, assetsApi, employeesApi, departmentsApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button, Table, Badge, Modal, Select, Input } from '../../components/ui';
import { Share2, RotateCcw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AssetAllocationPage() {
  const toast = useToast();
  const { user } = useAuth();
  const canManage = ['admin', 'asset_manager', 'department_head'].includes(user?.role?.toLowerCase().replace(' ', '_'));

  // ── Data State ────────────────────────────────────────────
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Allocation Form ───────────────────────────────────────
  const [allocAssetId, setAllocAssetId] = useState('');
  const [allocType, setAllocType] = useState('user'); // 'user' or 'department'
  const [allocTargetId, setAllocTargetId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submittingAlloc, setSubmittingAlloc] = useState(false);

  // ── Transfer Suggestion Modal ─────────────────────────────
  const [transferSuggestModal, setTransferSuggestModal] = useState(false);
  const [transferSuggestData, setTransferSuggestData] = useState(null);
  const [transferNotes, setTransferNotes] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [alRes, trRes, ovRes, astRes, empRes, deptRes] = await Promise.all([
        allocationsApi.getAll({ status: 'Active' }),
        transfersApi.getAll({ status: 'Requested' }),
        allocationsApi.getOverdue(),
        assetsApi.getAll(), // Get all to populate dropdown
        employeesApi.getAll({ limit: 1000 }),
        departmentsApi.getAll(),
      ]);
      if (alRes.success) setAllocations(alRes.data);
      if (trRes.success) setTransfers(trRes.data);
      if (ovRes.success) setOverdue(ovRes.data);
      if (astRes.success) setAssets(astRes.data);
      if (empRes.success) setEmployees(empRes.data.employees || empRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch {
      toast.error('Failed to load allocation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Handlers ──────────────────────────────────────────────
  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!allocAssetId) return toast.error('Please select an asset');
    if (!allocTargetId) return toast.error('Please select a recipient');

    setSubmittingAlloc(true);
    try {
      const payload = {
        assetId: allocAssetId,
        expectedReturnDate: expectedReturnDate || null,
        purpose: purpose || null,
      };
      if (allocType === 'user') payload.employeeId = allocTargetId;
      if (allocType === 'department') payload.departmentId = allocTargetId;

      const res = await allocationsApi.allocate(payload);
      if (res.success) {
        toast.success('Asset allocated successfully');
        setAllocAssetId(''); setAllocTargetId(''); setExpectedReturnDate(''); setPurpose('');
        fetchAll();
      }
    } catch (err) {
      const data = err?.response?.data;
      if (data?.transfer_suggested) {
        // GAP 3: Trigger the Transfer Suggestion Flow
        setTransferSuggestData({ ...payload, conflictInfo: data.data });
        setTransferSuggestModal(true);
      } else {
        toast.error(data?.error || 'Allocation failed');
      }
    } finally {
      setSubmittingAlloc(false);
    }
  };

  const handleRequestTransfer = async () => {
    setSubmittingAlloc(true);
    try {
      const payload = {
        assetId: transferSuggestData.assetId,
        notes: transferNotes,
      };
      if (transferSuggestData.employeeId) payload.toEmployeeId = transferSuggestData.employeeId;
      if (transferSuggestData.departmentId) payload.toDepartmentId = transferSuggestData.departmentId;

      const res = await transfersApi.create(payload);
      if (res.success) {
        toast.success('Transfer request submitted');
        setTransferSuggestModal(false);
        setTransferNotes('');
        setAllocAssetId(''); setAllocTargetId(''); setExpectedReturnDate(''); setPurpose('');
        fetchAll();
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to request transfer');
    } finally {
      setSubmittingAlloc(false);
    }
  };

  const handleReturn = async (allocId) => {
    if (!confirm('Are you sure you want to mark this asset as returned?')) return;
    try {
      const res = await allocationsApi.returnAsset(allocId);
      if (res.success) {
        toast.success('Asset returned successfully');
        fetchAll();
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to return asset');
    }
  };

  const handleApproveTransfer = async (transferId) => {
    try {
      const res = await transfersApi.approve(transferId);
      if (res.success) {
        toast.success('Transfer approved');
        fetchAll();
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to approve transfer');
    }
  };

  const handleRejectTransfer = async (transferId) => {
    const notes = prompt('Reason for rejection (optional):');
    if (notes === null) return; // Cancelled
    try {
      const res = await transfersApi.reject(transferId, notes);
      if (res.success) {
        toast.success('Transfer rejected');
        fetchAll();
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to reject transfer');
    }
  };

  // ── Render ────────────────────────────────────────────────
  const assetOptions = assets.map(a => ({ value: a.id, label: `${a.name} (${a.assetTag}) - ${a.status}` }));
  const userOptions = Array.isArray(employees) ? employees.map(e => ({ value: e.id, label: `${e.name} (${e.email})` })) : [];
  const deptOptions = departments.map(d => ({ value: d.id, label: d.name }));

  const allocColumns = [
    { key: 'asset_tag', label: 'Asset Tag' },
    { key: 'asset_name', label: 'Asset Name' },
    { key: 'recipient', label: 'Allocated To', render: (_, r) => r.allocated_to_name || r.department_name },
    { key: 'allocation_date', label: 'Allocated On', render: v => new Date(v).toLocaleDateString() },
    { key: 'expected_return_date', label: 'Due Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        canManage && (
          <Button variant="outline" size="sm" onClick={() => handleReturn(row.id)}>
            <RotateCcw className="h-4 w-4 mr-1 inline" /> Return
          </Button>
        )
      )
    },
  ];

  const transferColumns = [
    { key: 'asset_name', label: 'Asset' },
    { key: 'from_employee_name', label: 'Current Holder', render: v => v || 'Unknown' },
    { key: 'to', label: 'Requested For', render: (_, r) => r.to_employee_name || r.to_department_name },
    { key: 'requested_by_name', label: 'Requested By' },
    { key: 'created_at', label: 'Date', render: v => new Date(v).toLocaleDateString() },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        canManage && (
          <div className="flex gap-2">
            <button onClick={() => handleApproveTransfer(row.id)} className="text-success-600 hover:bg-success-50 p-1 rounded" title="Approve">
              <CheckCircle className="h-5 w-5" />
            </button>
            <button onClick={() => handleRejectTransfer(row.id)} className="text-error-600 hover:bg-error-50 p-1 rounded" title="Reject">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )
      )
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Allocation & Transfers</h1>
        <p className="text-sm text-text-secondary mt-1">Assign assets, manage returns, and approve transfers</p>
      </div>

      {/* Overdue Banner */}
      {overdue.length > 0 && canManage && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-error-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-error-800">Overdue Returns ({overdue.length})</h3>
            <p className="text-sm text-error-600 mt-1">
              There are assets that have passed their expected return date. Please follow up with the holders.
            </p>
          </div>
        </div>
      )}

      {/* Allocate Form */}
      {canManage && (
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary-600" />
            Allocate Asset
          </h2>
          <form onSubmit={handleAllocate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Select
              label="Select Asset *"
              options={assetOptions}
              value={allocAssetId}
              onChange={e => setAllocAssetId(e.target.value)}
              placeholder="-- Choose Asset --"
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-secondary">Allocate To *</label>
              <div className="flex gap-2">
                <select
                  value={allocType}
                  onChange={e => { setAllocType(e.target.value); setAllocTargetId(''); }}
                  className="w-1/3 py-2 px-3 border border-border rounded-lg text-sm bg-white"
                >
                  <option value="user">User</option>
                  <option value="department">Dept</option>
                </select>
                <div className="flex-1">
                  <Select
                    options={allocType === 'user' ? userOptions : deptOptions}
                    value={allocTargetId}
                    onChange={e => setAllocTargetId(e.target.value)}
                    placeholder="-- Select --"
                  />
                </div>
              </div>
            </div>

            <Input
              label="Expected Return (Optional)"
              type="date"
              value={expectedReturnDate}
              onChange={e => setExpectedReturnDate(e.target.value)}
            />

            <Button type="submit" variant="primary" loading={submittingAlloc} className="w-full">
              Allocate
            </Button>
          </form>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Active Allocations */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Active Allocations</h2>
          <Table columns={allocColumns} data={allocations} loading={loading} emptyMessage="No active allocations" />
        </div>

        {/* Transfer Requests */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Pending Transfers</h2>
          <Table columns={transferColumns} data={transfers} loading={loading} emptyMessage="No pending transfer requests" />
        </div>

      </div>

      {/* Transfer Suggestion Modal */}
      <Modal
        isOpen={transferSuggestModal}
        onClose={() => setTransferSuggestModal(false)}
        title="Asset Already Allocated"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-warning-50 border border-warning-200 text-warning-800 p-4 rounded-lg text-sm">
            <strong>{transferSuggestData?.conflictInfo?.assetName}</strong> is currently held by <strong>{transferSuggestData?.conflictInfo?.currentHolder}</strong>.
            <br className="my-1"/>
            You cannot allocate it directly, but you can request a transfer. If approved, the asset will be automatically re-allocated.
          </div>
          
          <Input
            label="Transfer Notes / Reason (Optional)"
            placeholder="e.g. Needed for the upcoming Q3 marketing event"
            value={transferNotes}
            onChange={e => setTransferNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setTransferSuggestModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRequestTransfer} loading={submittingAlloc}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
