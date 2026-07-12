import { useState, useEffect, useRef } from 'react';
import { assetsApi, categoriesApi, departmentsApi, BACKEND_ORIGIN } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button, Table, Badge, Modal, Select, Input } from '../../components/ui';
import { Plus, Search, Eye, Pencil, Package, FileText, Image } from 'lucide-react';

const STATUSES = ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

const BACKEND = BACKEND_ORIGIN;

function statusVariant(status) {
  if (status === 'Available') return 'success';
  if (status === 'Allocated') return 'info';
  if (status === 'Reserved') return 'warning';
  if (['Lost', 'Retired', 'Disposed'].includes(status)) return 'error';
  return 'neutral';
}

export default function AssetDirectoryPage() {
  const toast = useToast();
  const { user } = useAuth();
  const canManage = ['admin', 'asset_manager'].includes(user?.role?.toLowerCase().replace(' ', '_'));

  // ── List State ────────────────────────────────────────────
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCat, setFilterCat] = useState('');

  // ── Register/Edit Modal ───────────────────────────────────
  const [regModal, setRegModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', categoryId: '', serialNumber: '', acquisitionDate: '',
    acquisitionCost: '', condition: 'Good', location: '', departmentId: '',
    isBookable: false,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const photoRef = useRef();
  const docRef = useRef();

  // ── View Detail Modal ─────────────────────────────────────
  const [viewModal, setViewModal] = useState(false);
  const [viewAsset, setViewAsset] = useState(null);
  const [history, setHistory] = useState({ allocations: [], maintenance: [] });
  const [histTab, setHistTab] = useState('allocations');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [assetRes, catRes, deptRes] = await Promise.all([
        assetsApi.getAll({ search, status: filterStatus, category_id: filterCat }),
        categoriesApi.getAll(),
        departmentsApi.getAll(),
      ]);
      if (assetRes.success) setAssets(assetRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [search, filterStatus, filterCat]);

  const openRegister = () => {
    setEditTarget(null);
    setForm({ name: '', categoryId: '', serialNumber: '', acquisitionDate: '', acquisitionCost: '', condition: 'Good', location: '', departmentId: '', isBookable: false });
    setPhotoFile(null);
    setDocFile(null);
    setRegModal(true);
  };

  const openEdit = (asset) => {
    setEditTarget(asset);
    setForm({
      name: asset.name,
      categoryId: asset.categoryId || '',
      serialNumber: asset.serialNumber || '',
      acquisitionDate: asset.acquisitionDate ? asset.acquisitionDate.slice(0, 10) : '',
      acquisitionCost: asset.acquisitionCost || '',
      condition: asset.condition || 'Good',
      location: asset.location || '',
      departmentId: asset.departmentId || '',
      isBookable: asset.isBookable || false,
    });
    setPhotoFile(null);
    setDocFile(null);
    setRegModal(true);
  };

  const openView = async (asset) => {
    setViewAsset(asset);
    setHistTab('allocations');
    setViewModal(true);
    try {
      const res = await assetsApi.getHistory(asset.id);
      if (res.success) setHistory(res.data);
    } catch {
      // history is optional — don't block the modal
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Asset name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      if (docFile) fd.append('document', docFile);

      let res;
      if (editTarget) {
        res = await assetsApi.update(editTarget.id, fd);
      } else {
        res = await assetsApi.create(fd);
      }

      if (res.success) {
        toast.success(editTarget ? 'Asset updated' : 'Asset registered');
        setRegModal(false);
        fetchAll();
      } else {
        toast.error(res.error || 'Operation failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const deptOptions = departments.map(d => ({ value: d.id, label: d.name }));
  const statusOptions = STATUSES.map(s => ({ value: s, label: s }));

  const columns = [
    { key: 'assetTag', label: 'Asset Tag', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'categoryName', label: 'Category', render: v => v || <span className="text-text-tertiary">—</span> },
    { key: 'location', label: 'Location', render: v => v || <span className="text-text-tertiary">—</span> },
    { key: 'currentHolderName', label: 'Current Holder', render: v => v || <span className="text-text-tertiary">Unassigned</span> },
    {
      key: 'status', label: 'Status',
      render: v => <Badge variant={statusVariant(v)}>{v}</Badge>,
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openView(row)}
            className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-secondary transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canManage && (
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-secondary transition-colors"
              title="Edit asset"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Asset Directory</h1>
          <p className="text-sm text-text-secondary mt-1">Register, track, and manage all organizational assets</p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={openRegister} id="btn-register-asset">
            <Plus className="h-4 w-4" />
            Register Asset
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by name, tag, serial..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary placeholder:text-text-tertiary"
          />
        </div>
        <Select id="filter-status" options={statusOptions} placeholder="All Statuses" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} />
        <Select id="filter-cat" options={catOptions} placeholder="All Categories" value={filterCat} onChange={e => setFilterCat(e.target.value)} />
      </div>

      <Table columns={columns} data={assets} loading={loading} emptyMessage="No assets found" />

      {/* Register / Edit Modal */}
      <Modal
        isOpen={regModal}
        onClose={() => setRegModal(false)}
        title={editTarget ? `Edit: ${editTarget.name}` : 'Register New Asset'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Asset Name *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Dell Laptop XPS 15"
            />
            <Select
              id="reg-category"
              label="Category"
              options={catOptions}
              placeholder="Select category"
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            />
            <Input
              label="Serial Number"
              value={form.serialNumber}
              onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))}
              placeholder="e.g. SN-12345"
            />
            <Input
              label="Location"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. HQ Floor 2 - Desk 12"
            />
            <Input
              label="Acquisition Date"
              type="date"
              value={form.acquisitionDate}
              onChange={e => setForm(f => ({ ...f, acquisitionDate: e.target.value }))}
            />
            <Input
              label="Acquisition Cost (₹)"
              type="number"
              value={form.acquisitionCost}
              onChange={e => setForm(f => ({ ...f, acquisitionCost: e.target.value }))}
              placeholder="e.g. 75000"
            />
            <Select
              id="reg-condition"
              label="Condition"
              options={CONDITIONS.map(c => ({ value: c, label: c }))}
              value={form.condition}
              onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
            />
            <Select
              id="reg-department"
              label="Department"
              options={deptOptions}
              placeholder="Unassigned"
              value={form.departmentId}
              onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-bookable"
              checked={form.isBookable}
              onChange={e => setForm(f => ({ ...f, isBookable: e.target.checked }))}
              className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="is-bookable" className="text-sm text-text-primary">Mark as bookable (employees can book this asset)</label>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                <Image className="h-4 w-4 inline mr-1" />
                Asset Photo
              </label>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setPhotoFile(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => photoRef.current.click()}
                className="w-full py-2 px-3 text-sm border border-dashed border-border rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors text-left"
              >
                {photoFile ? photoFile.name : editTarget?.photoUrl ? '📷 Replace photo' : '📷 Upload photo'}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Document (Invoice / Warranty)
              </label>
              <input
                ref={docRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={e => setDocFile(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => docRef.current.click()}
                className="w-full py-2 px-3 text-sm border border-dashed border-border rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors text-left"
              >
                {docFile ? docFile.name : editTarget?.documentUrl ? '📄 Replace document' : '📄 Upload document'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setRegModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>
              {editTarget ? 'Save Changes' : 'Register Asset'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        title={viewAsset?.name || 'Asset Detail'}
        size="lg"
      >
        {viewAsset && (
          <div className="space-y-5">
            {/* Photo */}
            {viewAsset.photoUrl && (
              <div className="rounded-lg overflow-hidden bg-surface-secondary h-48 flex items-center justify-center">
                <img
                  src={`${BACKEND}${viewAsset.photoUrl}`}
                  alt={viewAsset.name}
                  className="object-contain h-full w-full"
                />
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Asset Tag', viewAsset.assetTag],
                ['Status', <Badge variant={statusVariant(viewAsset.status)}>{viewAsset.status}</Badge>],
                ['Category', viewAsset.categoryName || '—'],
                ['Condition', viewAsset.condition || '—'],
                ['Serial Number', viewAsset.serialNumber || '—'],
                ['Location', viewAsset.location || '—'],
                ['Department', viewAsset.departmentName || '—'],
                ['Current Holder', viewAsset.currentHolderName || 'Unassigned'],
                ['Acquisition Date', viewAsset.acquisitionDate ? new Date(viewAsset.acquisitionDate).toLocaleDateString() : '—'],
                ['Acquisition Cost', viewAsset.acquisitionCost ? `₹${Number(viewAsset.acquisitionCost).toLocaleString()}` : '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-text-tertiary text-xs">{label}</p>
                  <p className="text-text-primary font-medium mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            {/* Document Link */}
            {viewAsset.documentUrl && (
              <a
                href={`${BACKEND}${viewAsset.documentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 text-sm hover:underline"
              >
                <FileText className="h-4 w-4" />
                View Attached Document
              </a>
            )}

            {/* History Tabs */}
            <div>
              <div className="flex gap-2 border-b border-border mb-3">
                {['allocations', 'maintenance'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setHistTab(tab)}
                    className={`pb-2 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${histTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                  >
                    {tab} ({history[tab]?.length || 0})
                  </button>
                ))}
              </div>

              {histTab === 'allocations' && (
                history.allocations.length === 0
                  ? <p className="text-sm text-text-tertiary">No allocation history.</p>
                  : <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history.allocations.map(al => (
                        <div key={al.id} className="p-3 bg-surface-secondary rounded-lg text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{al.allocated_to_name || al.department_name || 'Unknown'}</span>
                            <Badge variant={al.status === 'Active' ? 'success' : 'neutral'}>{al.status}</Badge>
                          </div>
                          <p className="text-text-tertiary text-xs mt-1">
                            {new Date(al.created_at).toLocaleDateString()}
                            {al.actual_return_date ? ` → ${new Date(al.actual_return_date).toLocaleDateString()}` : ' → Present'}
                          </p>
                        </div>
                      ))}
                    </div>
              )}

              {histTab === 'maintenance' && (
                history.maintenance.length === 0
                  ? <p className="text-sm text-text-tertiary">No maintenance history.</p>
                  : <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history.maintenance.map(mr => (
                        <div key={mr.id} className="p-3 bg-surface-secondary rounded-lg text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{mr.issue_description}</span>
                            <Badge variant={mr.status === 'Resolved' ? 'success' : 'warning'}>{mr.status}</Badge>
                          </div>
                          <p className="text-text-tertiary text-xs mt-1">Raised by {mr.raised_by_name} · {new Date(mr.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
