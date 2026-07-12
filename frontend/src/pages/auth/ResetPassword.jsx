import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { Button, Input } from '../../components/ui';
import { Lock, Hexagon, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const result = await authApi.resetPassword(resetToken, form.password);
      if (result.success) {
        setSuccess(true);
      } else {
        setGeneralError(result.error || 'Failed to reset password');
      }
    } catch {
      setGeneralError('Something went wrong. Please try again.');
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
          {success ? (
            <div className="text-center animate-fade-in">
              <div className="mx-auto mb-4 p-3 bg-primary-50 rounded-full w-fit">
                <CheckCircle className="h-10 w-10 text-primary-600" />
              </div>
              <h1 className="text-xl font-semibold text-text-primary mb-2">
                Password Reset!
              </h1>
              <p className="text-sm text-text-secondary mb-6">
                Your password has been reset successfully. You can now sign in
                with your new password.
              </p>
              <Link to="/login">
                <Button variant="primary">Go to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-text-primary mb-1">
                Set new password
              </h1>
              <p className="text-sm text-text-secondary mb-6">
                Enter your new password below.
              </p>

              {generalError && (
                <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
                  {generalError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="reset-password"
                  label="New Password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  icon={Lock}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  error={errors.password}
                />

                <Input
                  id="reset-confirm"
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter your new password"
                  icon={Lock}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  error={errors.confirmPassword}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
