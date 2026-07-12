import { useState, useEffect } from 'react';
import { categoriesApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { Button, Table, Modal, Input } from '../../components/ui';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function CategoriesTab() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    customFields: [],
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAll();
      if (res.success) setCategories(res.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', customFields: [] });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      customFields: cat.customFields ? [...cat.customFields] : [],
    });
    setModalOpen(true);
  };

  const addCustomField = () => {
    setForm({
      ...form,
      customFields: [
        ...form.customFields,
        { key: '', type: 'text', required: false },
      ],
    });
  };

  const updateCustomField = (index, field, value) => {
    const updated = [...form.customFields];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, customFields: updated });
  };

  const removeCustomField = (index) => {
    setForm({
      ...form,
      customFields: form.customFields.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    // Filter out empty custom fields
    const cleanedFields = form.customFields.filter((f) => f.key.trim());
    const payload = { ...form, customFields: cleanedFields };

    setSaving(true);
    try {
      if (editing) {
        const res = await categoriesApi.update(editing.id, payload);
        if (res.success) {
          toast.success('Category updated');
          fetchData();
        }
      } else {
        const res = await categoriesApi.create(payload);
        if (res.success) {
          toast.success('Category created');
          fetchData();
        }
      }
      setModalOpen(false);
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Category', sortable: true },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (val) =>
        val ? (
          <span className="text-text-secondary">{val}</span>
        ) : (
          <span className="text-text-tertiary italic">No description</span>
        ),
    },
    {
      key: 'customFields',
      label: 'Custom Fields',
      sortable: false,
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {val && val.length > 0 ? (
            val.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 bg-surface-secondary border border-border rounded text-xs text-text-secondary"
              >
                {f.key}
                {f.required && <span className="text-danger-500 ml-0.5">*</span>}
              </span>
            ))
          ) : (
            <span className="text-text-tertiary text-xs italic">None</span>
          )}
        </div>
      ),
    },
    {
      key: 'assetCount',
      label: 'Assets',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => openEdit(row)}
          className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-100 hover:text-primary-600 transition-colors cursor-pointer"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Define asset categories with custom metadata fields.
        </p>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Table
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No asset categories created yet"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'Create Category'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            id="cat-name"
            label="Category Name"
            placeholder="e.g. Electronics"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            id="cat-desc"
            label="Description"
            placeholder="Brief description of this category"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Custom Fields Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-text-primary">
                Custom Fields
              </label>
              <Button variant="outline" size="sm" onClick={addCustomField}>
                <Plus className="h-3.5 w-3.5" />
                Add Field
              </Button>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Define additional metadata fields for assets in this category.
              These are stored as JSON and rendered dynamically.
            </p>

            {form.customFields.length === 0 ? (
              <div className="text-center py-6 bg-surface-secondary rounded-lg border border-dashed border-border">
                <p className="text-sm text-text-tertiary">
                  No custom fields yet. Click "Add Field" to define one.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {form.customFields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-surface-secondary rounded-lg border border-border"
                  >
                    <input
                      type="text"
                      placeholder="Field name (e.g. Warranty Period)"
                      value={field.key}
                      onChange={(e) =>
                        updateCustomField(index, 'key', e.target.value)
                      }
                      className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary"
                    />
                    <label className="flex items-center gap-1.5 text-sm text-text-secondary whitespace-nowrap cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateCustomField(index, 'required', e.target.checked)
                        }
                        className="rounded border-border text-primary-600 focus:ring-primary-500"
                      />
                      Required
                    </label>
                    <button
                      onClick={() => removeCustomField(index)}
                      className="p-1.5 rounded-lg text-text-tertiary hover:bg-danger-50 hover:text-danger-600 transition-colors cursor-pointer"
                      title="Remove field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {editing ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
