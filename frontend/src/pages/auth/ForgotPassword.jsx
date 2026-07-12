import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { Button, Input } from '../../components/ui';
import { Mail, Hexagon, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error || 'Failed to send reset link');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Hexagon className="h-9 w-9 text-primary-600" fill="currentColor" strokeWidth={1.5} />
            <span className="text-2xl font-bold text-text-primary">
              Asset<span className="text-primary-600">Flow</span>
            </span>
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-card p-8">
          {sent ? (
            <div className="text-center animate-fade-in">
              <div className="mx-auto mb-4 p-3 bg-primary-50 rounded-full w-fit">
                <CheckCircle className="h-10 w-10 text-primary-600" />
              </div>
              <h1 className="text-xl font-semibold text-text-primary mb-2">
                Check your email
              </h1>
              <p className="text-sm text-text-secondary mb-6">
                If an account with <strong>{email}</strong> exists, we've sent
                password reset instructions to your inbox.
              </p>
              <Link
                to="/login"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-text-primary mb-1">
                Forgot your password?
              </h1>
              <p className="text-sm text-text-secondary mb-6">
                Enter your email and we'll send you a link to reset it.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="forgot-email"
                  label="Email Address"
                  type="email"
                  placeholder="you@company.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  Send Reset Link
                </Button>
              </form>

              <p className="text-center text-sm text-text-secondary mt-4">
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  ← Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
