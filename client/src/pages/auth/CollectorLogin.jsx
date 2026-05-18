import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function CollectorLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginCollector, isAuthenticating, error, setError } = useAuth();

  const [form, setForm] = useState({ email: 'collector1@scrapit.ng', password: 'collector123' });
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

    const ok = await loginCollector({ email: form.email.trim().toLowerCase(), password: form.password });
    if (ok) {
      const from = location.state?.from?.pathname || '/collector/dashboard';
      navigate(from, { replace: true });
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-50 p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-eco-600 p-3 rounded-2xl mb-4">
            <Truck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">Collector Portal</h1>
          <p className="text-ink-500 text-sm mt-1">ScrapIt Field Operations</p>
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
              label="Collector email"
              name="email"
              type="email"
              placeholder="collector@scrapit.ng"
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
              className="w-full"
            >
              Sign in
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 bg-eco-50 rounded-xl p-3 text-xs text-ink-500 text-center">
            Demo: <span className="font-mono font-medium text-ink-700">collector1@scrapit.ng</span> / <span className="font-mono font-medium text-ink-700">collector123</span>
          </div>
        </div>

        <p className="text-center text-xs text-ink-400 mt-5">
          <Link to="/login" className="hover:underline">User portal</Link>
          {' · '}
          <Link to="/admin/login" className="hover:underline">Admin portal</Link>
        </p>
      </div>
    </div>
  );
}
