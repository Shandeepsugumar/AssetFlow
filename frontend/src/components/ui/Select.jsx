import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  error,
  id,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...rest
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`
            w-full rounded-lg border bg-white appearance-none
            text-text-primary text-sm py-2.5 pl-3 pr-10
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : 'border-border'}
          `}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((opt, idx) => (
            <option key={opt.id || `${opt.value}-${idx}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-text-tertiary" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
}
