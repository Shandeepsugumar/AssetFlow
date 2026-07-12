import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-primary-50 border-primary-200',
    iconColor: 'text-primary-600',
    textColor: 'text-primary-800',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning-50 border-warning-200',
    iconColor: 'text-warning-600',
    textColor: 'text-warning-800',
  },
  error: {
    icon: XCircle,
    bg: 'bg-danger-50 border-danger-200',
    iconColor: 'text-danger-600',
    textColor: 'text-danger-800',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-800',
  },
};

export function ToastItem({ toast, onDismiss }) {
  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg
        min-w-[320px] max-w-md
        ${config.bg}
        ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}
      `}
    >
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${config.textColor}`}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded hover:bg-black/10 transition-colors shrink-0 cursor-pointer"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
