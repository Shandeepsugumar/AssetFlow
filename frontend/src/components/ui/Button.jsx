import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary:
    'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
  warning:
    'bg-warning-500 hover:bg-warning-600 text-black focus:ring-warning-500',
  danger:
    'bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500',
  secondary:
    'bg-gray-100 hover:bg-gray-200 text-text-primary border border-border focus:ring-gray-400',
  outline:
    'bg-transparent hover:bg-gray-50 text-text-primary border border-border focus:ring-gray-400',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
