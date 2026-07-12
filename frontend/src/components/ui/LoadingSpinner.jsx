export default function LoadingSpinner({ size = 'md', text }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <div
        className={`
          ${sizeClasses[size] || sizeClasses.md}
          rounded-full border-primary-600
          border-t-transparent
          animate-spin
        `}
      />
      {text && (
        <p className="text-sm text-text-secondary">{text}</p>
      )}
    </div>
  );
}
