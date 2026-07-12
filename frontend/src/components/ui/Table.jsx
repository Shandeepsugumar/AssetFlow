import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { Inbox } from 'lucide-react';

export default function Table({
  columns = [],
  data = [],
  pagination,
  sortBy,
  sortOrder = 'asc',
  onSort,
  loading = false,
  emptyMessage = 'No data found',
}) {
  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-12">
        <LoadingSpinner size="md" text="Loading data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-12">
        <EmptyState
          icon={Inbox}
          title="No Data"
          description={emptyMessage}
        />
      </div>
    );
  }

  const handleSort = (column) => {
    if (!column.sortable || !onSort) return;
    const newOrder =
      sortBy === column.key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newOrder);
  };

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-secondary border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider
                    ${col.sortable ? 'cursor-pointer select-none hover:text-text-primary' : ''}
                  `}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortBy === col.key && (
                      sortOrder === 'asc' ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={`
                  border-b border-border last:border-0
                  transition-colors duration-150
                  ${idx % 2 === 1 ? 'bg-surface-secondary/50' : 'bg-surface'}
                  hover:bg-primary-50/50
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-text-primary">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-secondary">
          <p className="text-sm text-text-secondary">
            Showing{' '}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-medium">{pagination.total}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-border text-text-secondary hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-text-secondary px-2">
              Page {pagination.page} of {totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-1.5 rounded-lg border border-border text-text-secondary hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
