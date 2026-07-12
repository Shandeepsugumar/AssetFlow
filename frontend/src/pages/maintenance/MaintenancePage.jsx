import { useState, useEffect } from 'react';
import { assetsApi, maintenanceApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge, Modal, Input, Select } from '../../components/ui';
import { Wrench, Plus, User, Calendar, MessageSquare, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MaintenancePage() {
  const toast = useToast();
  const { user } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [requestModal, setRequestModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [form, setForm] = useState({
    assetId: '',
    issueDescription: '',
    priority: 'Medium',
    photoUrl: '',
  });

  const [technicianName, setTechnicianName] = useState('');

  const isManagerOrAdmin = user?.role === 'Admin' || user?.role === 'Asset Manager';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, assetRes] = await Promise.all([
        maintenanceApi.getAll(),
        assetsApi.getAll(),
      ]);
      if (reqRes.success) setRequests(reqRes.data);
      if (assetRes.success) setAssets(assetRes.data);
    } catch {
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRaiseRequest = async () => {
    if (!form.assetId) {
      toast.error('Please select an asset');
      return;
    }
    if (!form.issueDescription.trim()) {
      toast.error('Issue description is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await maintenanceApi.create(form);
      if (res.success) {
        toast.success('Maintenance request submitted successfully');
        fetchData();
        setRequestModal(false);
        setForm({ assetId: '', issueDescription: '', priority: 'Medium', photoUrl: '' });
      }
    } catch {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await maintenanceApi.approve(id);
      if (res.success) {
        toast.success('Request approved — Asset is now Under Maintenance');
        fetchData();
      }
    } catch {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await maintenanceApi.reject(id);
      if (res.success) {
        toast.warning('Request rejected');
        fetchData();
      }
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const openAssignModal = (reqItem) => {
    setSelectedRequest(reqItem);
    setTechnicianName('');
    setAssignModal(true);
  };

  const handleAssign = async () => {
    if (!technicianName.trim()) {
      toast.error('Technician name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await maintenanceApi.assign(selectedRequest.id, technicianName);
      if (res.success) {
        toast.success('Technician assigned successfully');
        fetchData();
        setAssignModal(false);
      }
    } catch {
      toast.error('Failed to assign technician');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await maintenanceApi.resolve(id);
      if (res.success) {
        toast.success('Request resolved — Asset status reverted to Available');
        fetchData();
      }
    } catch {
      toast.error('Failed to resolve request');
    }
  };

  // Group requests by status for Kanban Board
  const statuses = ['Pending', 'Approved', 'In Progress', 'Resolved'];
  const columns = {
    Pending: requests.filter((r) => r.status === 'Pending'),
    Approved: requests.filter((r) => r.status === 'Approved'),
    'In Progress': requests.filter((r) => r.status === 'In Progress'),
    Resolved: requests.filter((r) => r.status === 'Resolved'),
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'danger';
      case 'Medium':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-surface border border-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Maintenance Control Center</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Log technical issues, assign repair technicians, and track resolution workflows.
          </p>
        </div>
        <div>
          <Button variant="primary" onClick={() => setRequestModal(true)}>
            <Plus className="h-4 w-4" />
            Raise Request
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-secondary">
          Loading workflow board...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {statuses.map((status) => {
            const list = columns[status] || [];
            return (
              <div key={status} className="bg-surface-secondary border border-border rounded-xl p-3 space-y-3 min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <span className="font-bold text-text-primary text-sm uppercase tracking-wide">
                    {status}
                  </span>
                  <Badge variant="neutral">
                    {list.length}
                  </Badge>
                </div>

                {/* Card List */}
                <div className="space-y-3">
                  {list.length === 0 ? (
                    <div className="text-center py-8 text-xs text-text-tertiary border border-dashed border-border rounded-lg bg-white">
                      No requests
                    </div>
                  ) : (
                    list.map((reqItem) => (
                      <div
                        key={reqItem.id}
                        className="bg-white border border-border rounded-xl p-4 shadow-sm space-y-3 hover:border-primary-300 transition-colors"
                      >
                        {/* Header Details */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-text-primary text-sm leading-snug">
                              {reqItem.assetName}
                            </h4>
                            <span className="text-xs text-text-tertiary font-mono">
                              {reqItem.assetTag}
                            </span>
                          </div>
                          <Badge variant={getPriorityColor(reqItem.priority)}>
                            {reqItem.priority}
                          </Badge>
                        </div>

                        {/* Description */}
                        <div className="flex items-start gap-1.5 text-xs text-text-secondary">
                          <MessageSquare className="h-3.5 w-3.5 text-text-tertiary shrink-0 mt-0.5" />
                          <p className="line-clamp-3">{reqItem.issueDescription}</p>
                        </div>

                        {/* Metadata details */}
                        <div className="pt-2 border-t border-border space-y-1.5 text-[11px] text-text-tertiary">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span>Logged by: {reqItem.raisedByName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(reqItem.createdAt).toLocaleDateString()}</span>
                          </div>
                          {reqItem.technicianAssigned && (
                            <div className="flex items-center gap-1.5 text-primary-700 font-medium">
                              <Wrench className="h-3.5 w-3.5" />
                              <span>Tech: {reqItem.technicianAssigned}</span>
                            </div>
                          )}
                          {reqItem.resolvedAt && (
                            <div className="flex items-center gap-1.5 text-success-700 font-medium">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Resolved: {new Date(reqItem.resolvedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons (Managers only) */}
                        {isManagerOrAdmin && (
                          <div className="pt-2 border-t border-border flex flex-wrap gap-1.5 justify-end">
                            {status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleReject(reqItem.id)}
                                  className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-danger-200 bg-danger-50 text-danger-700 hover:bg-danger-100 cursor-pointer transition-colors"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApprove(reqItem.id)}
                                  className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-success-200 bg-success-50 text-success-700 hover:bg-success-100 cursor-pointer transition-colors"
                                >
                                  Approve
                                </button>
                              </>
                            )}

                            {(status === 'Approved' || status === 'Pending') && (
                              <button
                                onClick={() => openAssignModal(reqItem)}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 cursor-pointer transition-colors"
                              >
                                Assign Tech
                              </button>
                            )}

                            {status === 'In Progress' && (
                              <button
                                onClick={() => handleResolve(reqItem.id)}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-success-200 bg-success-50 text-success-700 hover:bg-success-100 cursor-pointer transition-colors w-full text-center"
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Raise Request Modal */}
      <Modal
        isOpen={requestModal}
        onClose={() => setRequestModal(false)}
        title="Raise Maintenance Request"
        size="md"
      >
        <div className="space-y-4">
          <Select
            id="maint-asset"
            label="Select Affected Asset"
            options={assets.map((a) => ({ value: a.id, label: `${a.name} (${a.assetTag})` }))}
            value={form.assetId}
            onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            placeholder="Select an asset..."
          />
          
          <Select
            id="maint-priority"
            label="Priority Level"
            options={[
              { value: 'Low', label: 'Low (General wear/tear)' },
              { value: 'Medium', label: 'Medium (Functional degradation)' },
              { value: 'High', label: 'High (Total breakdown/critical)' },
            ]}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          />

          <Input
            id="maint-desc"
            label="Issue Description"
            placeholder="Describe what is broken or malfunctioning..."
            value={form.issueDescription}
            onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
          />

          <Input
            id="maint-photo"
            label="Photo URL (Optional)"
            placeholder="Provide a link to a photo demonstrating the issue"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          />

          <div className="flex items-start gap-2.5 p-3 bg-warning-50 border border-warning-200 rounded-lg text-warning-800 text-xs">
            <AlertTriangle className="h-4.5 w-4.5 text-warning-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lifecycle Status Transition</p>
              <p className="mt-0.5">Approving this request will automatically update the asset status to "Under Maintenance", marking it unavailable for allocation or booking.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setRequestModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleRaiseRequest}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Tech Modal */}
      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="Assign Technician"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            id="tech-name"
            label="Technician Name"
            placeholder="e.g. John Doe (External Engineer)"
            value={technicianName}
            onChange={(e) => setTechnicianName(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAssignModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleAssign}>
              Assign & Start Repair
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
