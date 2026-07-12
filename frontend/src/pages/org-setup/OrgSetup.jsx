import { useState } from 'react';
import { Tabs } from '../../components/ui';
import { Building2, FolderTree, Users } from 'lucide-react';
import DepartmentsTab from './DepartmentsTab';
import CategoriesTab from './CategoriesTab';
import EmployeeDirectoryTab from './EmployeeDirectoryTab';

const TABS = [
  { key: 'departments', label: 'Departments', icon: Building2 },
  { key: 'categories', label: 'Asset Categories', icon: FolderTree },
  { key: 'employees', label: 'Employee Directory', icon: Users },
];

export default function OrgSetup() {
  const [activeTab, setActiveTab] = useState('departments');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Organization Setup
        </h2>
        <p className="text-text-secondary mt-1">
          Manage departments, asset categories, and employee roles.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="p-5">
          {activeTab === 'departments' && <DepartmentsTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'employees' && <EmployeeDirectoryTab />}
        </div>
      </div>
    </div>
  );
}
