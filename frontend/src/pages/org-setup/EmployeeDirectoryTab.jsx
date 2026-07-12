import { useState, useEffect } from 'react';
import { employeesApi, departmentsApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button, Table, Badge, Modal, Select, Input } from '../../components/ui';
import { Search, ShieldCheck, AlertCircle } from 'lucide-react';

const ROLES = ['Employee', 'Department Head', 'Asset Manager'];
const PROMOTABLE_ROLES = ['Department Head', 'Asset Manager'];

export default function EmployeeDirectoryTab() {
  const toast = useToast();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Role promotion modal
  const [promoModal, setPromoModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [promoting, setPromoting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        employeesApi.getAll({
          search,
          department: filterDept,
          role: filterRole,
          status: filterStatus,
        }),
        departmentsApi.getAll(),
      ]);
      if (empRes.success) setEmployees(empRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterDept, filterRole, filterStatus]);

  const openPromotion = (emp) => {
    setSelectedEmployee(emp);
    setNewRole(emp.role);
    setPromoModal(true);
  };

  const handlePromotion = async () => {
    if (!newRole || newRole === selectedEmployee.role) {
      toast.warning('Please select a different role');
      return;
    }
    setPromoting(true);
    try {
      const res = await employeesApi.updateRole(selectedEmployee.id, newRole);
      if (res.success) {
        toast.success(`${selectedEmployee.name} is now a ${newRole}`);
        fetchData();
        setPromoModal(false);
      }
    } catch {
      toast.error('Failed to update role');
    } finally {
      setPromoting(false);
    }
  };

  const deptOptions = departments.map((d) => ({
    value: d.name,
    label: d.name,
  }));

  const roleOptions = ROLES.map((r) => ({ value: r, label: r }));
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (val) => val || <span className="text-text-tertiary">—</span>,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => (
        <Badge
          variant={
            val === 'Admin'
              ? 'info'
              : val === 'Asset Manager'
              ? 'success'
              : val === 'Department Head'
              ? 'warning'
              : 'neutral'
          }
        >
          {val}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'actions',
      label: 'Assign Role',
      render: (_, row) =>
        user?.role === 'Admin' ? (
          row.role !== 'Admin' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openPromotion(row)}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Change Role
            </Button>
          ) : (
            <span className="text-xs text-text-tertiary">Admin</span>
          )
        ) : (
          <span className="text-xs text-text-tertiary">Admin Only</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Role assignment notice */}
      <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            Role Assignment Center
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            This is the <strong>only place</strong> in the application where
            roles are assigned. Use the "Change Role" button to promote an
            Employee to Department Head or Asset Manager.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary placeholder:text-text-tertiary"
          />
        </div>
        <Select
          id="filter-dept"
          options={deptOptions}
          placeholder="All Departments"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        />
        <Select
          id="filter-role"
          options={roleOptions}
          placeholder="All Roles"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        />
        <Select
          id="filter-status"
          options={statusOptions}
          placeholder="All Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        data={employees}
        loading={loading}
        emptyMessage="No employees found matching your filters"
      />

      {/* Role Promotion Modal */}
      <Modal
        isOpen={promoModal}
        onClose={() => setPromoModal(false)}
        title="Change Employee Role"
        size="sm"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-secondary rounded-lg">
              <p className="text-sm font-medium text-text-primary">
                {selectedEmployee.name}
              </p>
              <p className="text-xs text-text-secondary">
                {selectedEmployee.email}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Current role:{' '}
                <span className="font-medium">{selectedEmployee.role}</span>
              </p>
            </div>

            <Select
              id="new-role"
              label="New Role"
              options={PROMOTABLE_ROLES.map((r) => ({ value: r, label: r }))}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Select a role"
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPromoModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={promoting}
                onClick={handlePromotion}
              >
                Assign Role
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
