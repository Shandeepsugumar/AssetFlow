import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Input } from '../../components/ui';
import { User, Mail, Lock, Hexagon } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
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
      const result = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        setGeneralError(result.error || 'Signup failed. Please try again.');
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
          <p className="text-text-secondary text-sm">
            Enterprise Asset & Resource Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-xl shadow-card p-8">
          <h1 className="text-xl font-semibold text-text-primary mb-1">
            Create your account
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Get started with AssetFlow today
          </p>

          {generalError && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="signup-name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={User}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />

            <Input
              id="signup-email"
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              icon={Mail}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />

            <Input
              id="signup-password"
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              icon={Lock}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />

            <Input
              id="signup-confirm"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              icon={Lock}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              error={errors.confirmPassword}
            />

            {/* Role notice */}
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-xs text-primary-800">
                You will be registered as an <strong>Employee</strong>. Role
                upgrades (Department Head, Asset Manager) are managed by your
                organization's Admin.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
