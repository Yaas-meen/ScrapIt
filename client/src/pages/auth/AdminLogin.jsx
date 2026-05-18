import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin, isAuthenticating, error, setError } = useAuth();

  const [form, setForm] = useState({ email: 'admin@scrapit.ng', password: 'admin123' });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setLocalError('');
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!form.email.trim()) return setLocalError('Email is required.');
    if (!form.password) return setLocalError('Password is required.');

    const ok = await loginAdmin({ email: form.email.trim().toLowerCase(), password: form.password });
    if (ok) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-100 p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-ink-800 p-3 rounded-2xl mb-4">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">Admin Portal</h1>
          <p className="text-ink-500 text-sm mt-1">ScrapIt Operations Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ink-200 p-8">
          {displayError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Admin email"
              name="email"
              type="email"
              placeholder="admin@scrapit.ng"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isAuthenticating}
              className="w-full !bg-ink-800 hover:!bg-ink-900"
            >
              Sign in to Admin
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 bg-ink-50 rounded-xl p-3 text-xs text-ink-500 text-center">
            Demo: <span className="font-mono font-medium text-ink-700">admin@scrapit.ng</span> / <span className="font-mono font-medium text-ink-700">admin123</span>
          </div>
        </div>

        <p className="text-center text-xs text-ink-400 mt-5">
          <Link to="/login" className="hover:underline">User portal</Link>
          {' · '}
          <Link to="/collector/login" className="hover:underline">Collector portal</Link>
        </p>
      </div>
    </div>
  );
}
