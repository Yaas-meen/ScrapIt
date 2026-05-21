import { useMemo, useState }        from 'react';
import { Link, useNavigate }        from 'react-router-dom';
import {
  Recycle, Eye, EyeOff,
  AlertCircle, Check, Loader2,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const MIN_PASSWORD = 8;

export default function UserRegister() {
  const navigate         = useNavigate();
  const registerUser     = useAuthStore((s) => s.registerUser);
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);

  const [form, setForm] = useState({
    name:    '',
    email:   '',
    phone:   '',
    password:'',
    confirm: '',
    accept:  false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState(null);

  const patch = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError(null);
    patch(name, type === 'checkbox' ? checked : value);
  };

  const validation = useMemo(() => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return { ok: false, message: 'Please enter your full name.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return { ok: false, message: 'Please enter a valid email address.' };
    if (!form.phone.trim() || form.phone.replace(/[^0-9]/g, '').length < 10)
      return { ok: false, message: 'Please enter a valid phone number.' };
    if (form.password.length < MIN_PASSWORD)
      return {
        ok: false,
        message: `Password must be at least ${MIN_PASSWORD} characters.`,
      };
    if (form.password !== form.confirm)
      return { ok: false, message: 'Passwords do not match.' };
    if (!form.accept)
      return { ok: false, message: 'Please accept the Terms to continue.' };
    return { ok: true };
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isAuthenticating) return;
    if (!validation.ok) { setError(validation.message); return; }
    setError(null);
    try {
      await registerUser({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        phone:    form.phone.trim(),
        password: form.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    }
  };

  const disabled = isAuthenticating || !validation.ok;

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Header */}
          <header className="mb-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-eco-100
              text-eco-700 grid place-items-center mb-4">
              <Recycle size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-800">
              Create your account
            </h1>
            <p className="text-sm text-ink-500 mt-1">
              Recycle waste, earn points, redeem airtime and gift cards.
            </p>
          </header>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            noValidate
            className="bg-white rounded-2xl shadow-sm border border-ink-100
              p-6 sm:p-7 space-y-4"
          >
            {error && (
              <Banner tone="error">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {error}
              </Banner>
            )}

            {/* Full name */}
            <Field label="Full name" htmlFor="reg-name">
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Adaeze Okafor"
                className={inputCls}
              />
            </Field>

            {/* Email */}
            <Field label="Email" htmlFor="reg-email">
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputCls}
              />
            </Field>

            {/* Phone */}
            <Field
              label="Phone (Nigeria)"
              htmlFor="reg-phone"
              hint="e.g. +234 803 555 0142"
            >
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+234..."
                className={inputCls}
              />
            </Field>

            {/* Password */}
            <Field
              label="Password"
              htmlFor="reg-password"
              hint={`At least ${MIN_PASSWORD} characters`}
            >
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
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
              <PasswordStrength password={form.password} />
            </Field>

            {/* Confirm password */}
            <Field label="Confirm password" htmlFor="reg-confirm">
              <input
                id="reg-confirm"
                name="confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={form.confirm}
                onChange={handleChange}
                className={inputCls}
              />
            </Field>

            {/* Terms */}
            <label className="flex items-start gap-2.5 select-none cursor-pointer">
              <input
                type="checkbox"
                name="accept"
                checked={form.accept}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-ink-300
                  text-eco-600 focus:ring-eco-500"
              />
              <span className="text-xs text-ink-600">
                I agree to the{' '}
                <Link to="/terms" className="text-eco-700 hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-eco-700 hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={disabled}
              className="w-full inline-flex items-center justify-center
                gap-2 h-11 rounded-xl bg-eco-600 hover:bg-eco-700
                text-white font-semibold text-sm transition
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {isAuthenticating ? 'Creating account…' : 'Create account'}
            </button>

            {/* Sign-in link */}
            <p className="text-center text-sm text-ink-600 pt-1">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-eco-700 font-semibold hover:underline"
              >
                Sign in
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
  'focus:border-eco-500 focus:ring-2 focus:ring-eco-100 outline-none transition';

function Field({ label, htmlFor, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800">
          {label}
        </label>
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Banner({ tone = 'error', children }) {
  const tones = {
    error: 'bg-red-50  text-red-700  border-red-200',
    warn:  'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div className={`flex items-start gap-2 text-xs rounded-xl border
      px-3 py-2 ${tones[tone]}`}>
      {children}
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { ok: password.length >= MIN_PASSWORD, label: `${MIN_PASSWORD}+ chars`   },
    { ok: /[A-Z]/.test(password),          label: 'Uppercase'                 },
    { ok: /[0-9]/.test(password),          label: 'Number'                    },
    { ok: /[^A-Za-z0-9]/.test(password),   label: 'Symbol'                   },
  ];
  return (
    <ul className="mt-2 grid grid-cols-2 gap-y-1 text-[11px] text-ink-500">
      {checks.map((c) => (
        <li key={c.label}
          className={`flex items-center gap-1.5 ${c.ok ? 'text-eco-700' : ''}`}>
          <Check size={12} className={c.ok ? 'opacity-100' : 'opacity-25'} />
          {c.label}
        </li>
      ))}
    </ul>
  );
}