import { useState }          from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck, Eye, EyeOff,
  AlertCircle, Loader2,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function CollectorLogin() {
  const navigate           = useNavigate();
  const loginCollector     = useAuthStore((s) => s.loginCollector);
  const isAuthenticating   = useAuthStore((s) => s.isAuthenticating);

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAuthenticating) return;
    setError(null);
    try {
      await loginCollector(email.trim(), password);
      navigate('/collector/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Invalid collector credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          <header className="mb-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-100
              text-gold-700 grid place-items-center mb-4">
              <Truck size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-800">
              Collector sign-in
            </h1>
            <p className="text-sm text-ink-500 mt-1">
              Access your assigned pickups.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white rounded-2xl shadow-sm border border-ink-100
              p-6 sm:p-7 space-y-5"
          >
            {error && (
              <div className="flex items-start gap-2 text-xs rounded-xl
                border px-3 py-2.5 bg-red-50 text-red-700 border-red-200">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="col-email"
                className="block text-sm font-medium text-ink-800 mb-1.5">
                Email
              </label>
              <input
                id="col-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collector@scrapit.com"
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="col-password"
                className="block text-sm font-medium text-ink-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="col-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2
                    p-1.5 rounded-lg text-ink-400 hover:bg-ink-100"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isAuthenticating || !email || !password}
              className="w-full inline-flex items-center justify-center
                gap-2 h-11 rounded-xl bg-gold-500 hover:bg-gold-600
                text-white font-semibold text-sm transition
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : 'Sign in as Collector'
              }
            </button>

            <p className="text-center text-xs text-ink-400 pt-1">
              <Link to="/login" className="hover:text-ink-600">
                ← Back to user sign-in
              </Link>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
const inputCls =
  'w-full h-11 rounded-xl border border-ink-200 px-3 text-sm bg-white ' +
  'focus:border-gold-500 focus:ring-2 focus:ring-gold-100 ' +
  'outline-none transition';