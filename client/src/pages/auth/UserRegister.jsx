import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, User, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function UserRegister() {
  const navigate = useNavigate();
  const { registerUser, isAuthenticating, error, setError } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setLocalError('');
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!form.name.trim()) return setLocalError('Full name is required.');
    if (!form.email.trim()) return setLocalError('Email is required.');
    if (!form.password) return setLocalError('Password is required.');
    if (form.password.length < 6) return setLocalError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setLocalError('Passwords do not match.');

    const ok = await registerUser({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      password: form.password,
    });

    if (ok) navigate('/dashboard');
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex">
      {/* ── Brand panel ── */}
      <div className="hidden lg:flex lg:w-2/5 bg-eco-600 flex-col justify-center items-center p-12 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Recycle size={36} className="text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight">ScrapIt</span>
        </div>
        <h2 className="text-2xl font-semibold text-center mb-3 leading-snug">
          Join the recycling movement
        </h2>
        <p className="text-eco-100 text-center text-sm leading-relaxed max-w-xs">
          Create your free account and start earning rewards every time you recycle.
          Every kilogram counts.
        </p>

        <div className="mt-10 space-y-3 w-full max-w-xs">
          {[
            { icon: '♻️', label: 'Schedule free pickups' },
            { icon: '🏆', label: 'Earn points & badges' },
            { icon: '📊', label: 'Track your impact' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-sm">
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-ink-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="bg-eco-600 p-2 rounded-xl">
              <Recycle size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-ink-900">ScrapIt</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-ink-200 p-8">
            <h1 className="text-2xl font-bold text-ink-900 mb-1">Create account</h1>
            <p className="text-ink-500 text-sm mb-6">Free · No credit card required</p>

            {displayError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label="Full name"
                name="name"
                placeholder="Ada Okonkwo"
                icon={User}
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
              <Input
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
              <Input
                label="Phone number"
                name="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                icon={Phone}
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
              <Input
                label="Address (optional)"
                name="address"
                placeholder="12 Green St, Lagos"
                icon={MapPin}
                value={form.address}
                onChange={handleChange}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                icon={Lock}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <Input
                label="Confirm password"
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                icon={Lock}
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isAuthenticating}
                className="w-full mt-2"
              >
                Create account
              </Button>
            </form>

            <p className="text-center text-sm text-ink-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-eco-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-ink-400 mt-5">
            Admin?{' '}
            <Link to="/admin/login" className="text-ink-600 hover:underline">Sign in here</Link>
            {' · '}
            <Link to="/collector/login" className="text-ink-600 hover:underline">Collector portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
