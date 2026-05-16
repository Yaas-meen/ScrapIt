import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Recycle, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function UserLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginUser = useAuthStore((s) => s.loginUser);
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';
  const expiredHint = location.state?.reason === 'expired';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isAuthenticating) return;
    setError(null);
    try {
      await loginUser(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed');
    }
  };

  const disabled = isAuthenticating || !email || !password;

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <header className="mb-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-eco-100 text-eco-700 grid place-items-center mb-4">
              <Recycle size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-800">Welcome back</h1>
            <p className="text-sm text-ink-500 mt-1">
              Sign in to schedule pickups and redeem your points.
            </p>
          </header>

          <form
            onSubmit={onSubmit}
            className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6 sm:p-7 space-y-5"
            noValidate
          >
            {expiredHint && (
              <Banner tone="warn">Your session expired. Please sign in again.</Banner>
            )}
            {error && (
              <Banner tone="error">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {error}
              </Banner>
            )}

            <Field label="Email" htmlFor="user-email">
              <input
                id="user-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 rounded-xl border border-ink-200 px-3 text-sm bg-white focus:border-eco-500 focus:ring-2 focus:ring-eco-100 outline-none transition"
              />
            </Field>

            <Field
              label="Password"
              htmlFor="user-password"
              suffix={
                <Link to="/forgot-password" className="text-xs text-eco-700 hover:underline">
                  Forgot?
                </Link>
              }
            >
              <div className="relative">
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl border border-ink-200 px-3 pr-10 text-sm bg-white focus:border-eco-500 focus:ring-2 focus:ring-eco-100 outline-none transition"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-ink-400 hover:bg-ink-100"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={disabled}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-eco-600 hover:bg-eco-700 text-white font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating && <Loader2 size={16} className="animate-spin" />}
              {isAuthenticating ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-center text-sm text-ink-600">
              New to ScrapIt?{' '}
              <Link to="/register" className="text-eco-700 font-semibold hover:underline">
                Create an account
              </Link>
            </p>

            <div className="text-center text-xs text-ink-400 space-x-3 pt-2 border-t border-ink-100">
              <Link to="/admin/login" className="hover:text-ink-600">Admin sign-in</Link>
              <span aria-hidden>·</span>
              <Link to="/collector/login" className="hover:text-ink-600">Collector sign-in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, suffix, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800">
          {label}
        </label>
        {suffix}
      </div>
      {children}
    </div>
  );
}

function Banner({ tone = 'error', children }) {
  const tones = {
    error: 'bg-red-50 text-red-700 border-red-200',
    warn: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div className={`flex items-start gap-2 text-xs rounded-xl border px-3 py-2 ${tones[tone]}`}>
      {children}
    </div>
  );
}