import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginAdmin = useAuthStore((s) => s.loginAdmin);
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/admin/dashboard';
  const expiredHint = location.state?.reason === 'expired';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isAuthenticating) return;
    setError(null);
    try {
      await loginAdmin(email.trim(), password);
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
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-700 grid place-items-center mb-4">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-800">Admin sign-in</h1>
            <p className="text-sm text-ink-500 mt-1">
              Restricted area. Admin credentials required.
            </p>
          </header>

          <form
            onSubmit={onSubmit}
            className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6 sm:p-7 space-y-5"
            noValidate
          >
            {expiredHint && (
              <Banner tone="warn">
                Your session expired. Please sign in again.
              </Banner>
            )}
            {error && (
              <Banner tone="error">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {error}
              </Banner>
            )}

            <Field label="Email" htmlFor="admin-email">
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@scrapit.io"
                className="w-full h-11 rounded-xl border border-ink-200 px-3 text-sm bg-white focus:border-eco-500 focus:ring-2 focus:ring-eco-100 outline-none transition"
              />
            </Field>

            <Field label="Password" htmlFor="admin-password">
              <div className="relative">
                <input
                  id="admin-password"
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
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating && <Loader2 size={16} className="animate-spin" />}
              {isAuthenticating ? 'Signing in…' : 'Sign in to Admin'}
            </button>

            <div className="text-center text-xs text-ink-500 space-x-3">
              <Link to="/login" className="hover:text-ink-700">User portal</Link>
              <span aria-hidden>·</span>
              <Link to="/collector/login" className="hover:text-ink-700">Collector sign-in</Link>
            </div>
          </form>

          <p className="mt-6 text-center text-[11px] text-ink-400">
            ScrapIt — restricted admin portal. All sign-in attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="block mb-1.5 text-sm font-medium text-ink-800">{label}</span>
      {children}
    </label>
  );
}

function Banner({ tone = 'error', children }) {
  const tones = {
    error: 'bg-red-50 text-red-700 border-red-200',
    warn:  'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div className={`flex items-start gap-2 text-xs rounded-xl border px-3 py-2 ${tones[tone]}`}>
      {children}
    </div>
  );
}