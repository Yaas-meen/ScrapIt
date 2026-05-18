import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Recycle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function UserLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isAuthenticating, error, setError } = useAuth();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: 'adaeze@example.com', password: 'password123' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError(null);
    if (!validate()) return;
    try {
      await loginUser(form.email, form.password);
      navigate(from, { replace: true });
    } catch { /* error shown via useAuth().error */ }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-eco-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 grid place-items-center">
            <Recycle size={20} strokeWidth={2.2} />
          </div>
          <span className="text-xl font-extrabold tracking-tight">ScrapIt</span>
        </div>
        <div className="relative max-w-sm">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Turn your waste into worth.
          </h1>
          <p className="mt-4 text-eco-100 leading-relaxed">
            Schedule a doorstep collection for plastic, glass and metal. Earn points you can redeem for airtime and gift cards.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[['♻️', 'Plastic', '10 pts/kg'], ['🫙', 'Glass', '8 pts/kg'], ['⚙️', 'Metal', '20 pts/kg']].map(([icon, label, rate]) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 border border-white/15">
                <div className="text-xl">{icon}</div>
                <div className="font-semibold text-sm mt-1">{label}</div>
                <div className="text-xs text-eco-200">{rate}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-eco-200">© 2026 ScrapIt — keeping cities cleaner.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-eco-600 grid place-items-center text-white">
              <Recycle size={18} strokeWidth={2.2} />
            </div>
            <span className="text-lg font-extrabold text-ink-800">ScrapIt</span>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-eco-700 bg-eco-50 border border-eco-100 px-2.5 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-eco-500" />
            User portal
          </div>
          <h2 className="text-3xl font-bold text-ink-800 tracking-tight">Sign in</h2>
          <p className="text-ink-500 mt-1 text-sm">Welcome back. Let's make today greener.</p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            <Input
              label="Email" type="email" icon={Mail} required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={errors.email}
            />
            <Input
              label="Password" type="password" icon={Lock} required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors.password}
            />
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-ink-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-eco-600" />
                Remember me
              </label>
              <a href="#" className="font-semibold text-eco-700 hover:text-eco-800">Forgot password?</a>
            </div>
            <Button type="submit" size="lg" loading={isAuthenticating} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="text-sm text-ink-500 mt-6 text-center">
            New to ScrapIt?{' '}
            <Link to="/register" className="font-semibold text-eco-700 hover:text-eco-800">
              Create an account
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-ink-100">
            <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold mb-3">Other portals</p>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/admin/login" className="text-xs font-semibold text-center h-9 rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 grid place-items-center">
                Admin portal
              </Link>
              <Link to="/collector/login" className="text-xs font-semibold text-center h-9 rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 grid place-items-center">
                Collector portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
