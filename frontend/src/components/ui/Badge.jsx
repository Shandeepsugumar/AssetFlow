const statusToVariant = {
  // Success / green
  Available: 'success',
  Active: 'success',
  Approved: 'success',
  Completed: 'success',
  Resolved: 'success',

  // Warning / yellow
  Reserved: 'warning',
  Pending: 'warning',
  'Under Maintenance': 'warning',
  'In Progress': 'warning',
  Overdue: 'warning',

  // Danger / red
  Lost: 'danger',
  Rejected: 'danger',
  Damaged: 'danger',
  Failed: 'danger',
  'Overdue Return': 'danger',

  // Neutral / gray
  Retired: 'neutral',
  Disposed: 'neutral',
  Inactive: 'neutral',
  Cancelled: 'neutral',
};

const variantClasses = {
  success: 'bg-primary-100 text-primary-800',
  warning: 'bg-warning-100 text-warning-800',
  danger: 'bg-danger-100 text-danger-800',
  neutral: 'bg-gray-100 text-gray-700',
  info: 'bg-blue-100 text-blue-800',
};

export default function Badge({ status, variant, children, className = '' }) {
  const resolvedVariant =
    variant || statusToVariant[status] || 'info';
  const displayText = children || status;

  return (
    <span
      className={`
        inline-flex items-center rounded-full
        px-2.5 py-0.5 text-xs font-medium
        ${variantClasses[resolvedVariant] || variantClasses.info}
        ${className}
      `}
    >
      {displayText}
    </span>
  );
}
