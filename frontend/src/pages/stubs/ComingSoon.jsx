import { Construction } from 'lucide-react';

export default function ComingSoon({
  title = 'Coming Soon',
  description = 'This module is being built by another team member and will be available soon.',
  icon: Icon = Construction,
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center animate-fade-in max-w-md">
        <div className="mx-auto mb-6 p-4 bg-warning-50 rounded-full w-fit">
          <Icon className="h-12 w-12 text-warning-600" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          {title}
        </h2>
        <p className="text-text-secondary mb-6">{description}</p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 bg-primary-600 rounded-full animate-pulse-soft" />
          <span
            className="h-2 w-2 bg-primary-600 rounded-full animate-pulse-soft"
            style={{ animationDelay: '0.3s' }}
          />
          <span
            className="h-2 w-2 bg-primary-600 rounded-full animate-pulse-soft"
            style={{ animationDelay: '0.6s' }}
          />
        </div>
      </div>
    </div>
  );
}
