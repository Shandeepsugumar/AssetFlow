export default function Input({
  label,
  error,
  id,
  type = 'text',
  className = '',
  icon: Icon,
  suffix,
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
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4.5 w-4.5 text-text-tertiary" />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`
            w-full rounded-lg border bg-white
            text-text-primary placeholder:text-text-tertiary
            text-sm py-2.5 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${Icon ? 'pl-10' : 'pl-3'}
            ${suffix ? 'pr-10' : 'pr-3'}
            ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : 'border-border'}
          `}
          {...rest}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
}
