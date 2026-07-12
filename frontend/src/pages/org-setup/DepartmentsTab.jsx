import { useState, useEffect } from 'react';
import { departmentsApi, employeesApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { Button, Table, Badge, Modal, Input, Select } from '../../components/ui';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';

export default function DepartmentsTab() {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    headId: '',
    parentId: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentsApi.getAll(),
        employeesApi.getAll(),
      ]);
      if (deptRes.success) setDepartments(deptRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', headId: '', parentId: '' });
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      description: dept.description || '',
      headId: dept.headId || '',
      parentId: dept.parentId || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Department name is required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await departmentsApi.update(editing.id, form);
        if (res.success) {
          toast.success('Department updated');
          fetchData();
        }
      } else {
        const res = await departmentsApi.create(form);
        if (res.success) {
          toast.success('Department created');
          fetchData();
        }
      }
      setModalOpen(false);
    } catch {
      toast.error('Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (dept) => {
    try {
      const res = await departmentsApi.deactivate(dept.id);
      if (res.success) {
        toast.success(
          `Department ${res.data.status === 'Active' ? 'activated' : 'deactivated'}`
        );
        fetchData();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const headOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.name} (${e.role})`,
  }));

  const parentOptions = departments
    .filter((d) => !editing || d.id !== editing.id)
    .map((d) => ({
      value: d.id,
      label: d.name,
    }));

  const columns = [
    { key: 'name', label: 'Department', sortable: true },
    {
      key: 'headName',
      label: 'Department Head',
      sortable: false,
      render: (val) => val || <span className="text-text-tertiary italic">Unassigned</span>,
    },
    {
      key: 'parentName',
      label: 'Parent Dept',
      sortable: false,
      render: (val) => val || <span className="text-text-tertiary">—</span>,
    },
    {
      key: 'employeeCount',
      label: 'Employees',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-100 hover:text-primary-600 transition-colors cursor-pointer"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-100 hover:text-warning-600 transition-colors cursor-pointer"
            title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          >
            {row.status === 'Active' ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Manage organizational departments and assign heads.
        </p>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Table
        columns={columns}
        data={departments}
        loading={loading}
        emptyMessage="No departments created yet"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Department' : 'Create Department'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            id="dept-name"
            label="Department Name"
            placeholder="e.g. Engineering"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            id="dept-desc"
            label="Description"
            placeholder="Brief description of the department"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Select
            id="dept-head"
            label="Department Head"
            options={headOptions}
            placeholder="Select a department head"
            value={form.headId}
            onChange={(e) => setForm({ ...form, headId: e.target.value })}
          />
          <Select
            id="dept-parent"
            label="Parent Department (optional)"
            options={parentOptions}
            placeholder="None (top-level)"
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {editing ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
