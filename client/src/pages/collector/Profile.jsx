import { useState }     from 'react';
import { CheckCircle2, Lock, User, Mail, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import Button           from '../../components/ui/Button';
import { getInitials }  from '../../utils/generateBadgerColor';

const inputCls =
  'w-full h-11 rounded-xl border border-ink-200 px-3 text-sm ' +
  'bg-white focus:border-eco-500 focus:ring-2 focus:ring-eco-100 ' +
  'outline-none transition';

const readonlyCls =
  'w-full h-11 rounded-xl border border-ink-100 px-3 text-sm ' +
  'bg-ink-50 text-ink-500 cursor-not-allowed flex items-center';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-500 uppercase
        tracking-wide mb-1.5">
        {label}
      </label>
      <div className={`${readonlyCls} gap-2`}>
        <Icon size={14} className="text-ink-400 shrink-0" />
        <span>{value || '—'}</span>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-ink-800">{label}</label>
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function CollectorProfile() {
  const user = useAuthStore((s) => s.user);

  const [pwd, setPwd] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [show,   setShow]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok,     setOk]     = useState(false);
  const [err,    setErr]    = useState('');

  const name  = user?.fullName || user?.name || 'Collector';
  const email = user?.email    || '—';
  const phone = user?.phone    || '—';
  const zone  = user?.zone     || null;

  const set = (patch) => setPwd((p) => ({ ...p, ...patch }));

  const canSubmit =
    pwd.currentPassword.length >= 1 &&
    pwd.newPassword.length     >= 6 &&
    pwd.confirmPassword.length >= 1 &&
    !saving;

  const handleSubmit = async () => {
    setErr(''); setOk(false);

    if (pwd.newPassword !== pwd.confirmPassword) {
      setErr('New passwords do not match.');
      return;
    }
    if (pwd.newPassword.length < 6) {
      setErr('New password must be at least 6 characters.');
      return;
    }
    if (pwd.newPassword === pwd.currentPassword) {
      setErr('New password must be different from your current password.');
      return;
    }

    setSaving(true);
    try {
      const { default: client } = await import('../../api/axiosClient');
      await client.patch('/collectors/change-password', {
        currentPassword: pwd.currentPassword,
        newPassword:     pwd.newPassword,
        confirmPassword: pwd.confirmPassword,
      });
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setOk(true);
      setTimeout(() => setOk(false), 4000);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
        e?.message ||
        'Failed to change password. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pb-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-800">Profile</h1>
        <p className="text-sm text-ink-500 mt-1">
          Your collector account details.
        </p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          {/* Initials avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gold-100 text-gold-700
            grid place-items-center text-xl font-bold shrink-0 select-none">
            {getInitials(name)}
          </div>

          <div className="min-w-0">
            <p className="text-lg font-bold text-ink-800 truncate">{name}</p>
            <p className="text-sm text-ink-500 truncate">{email}</p>
            {zone && (
              <span className="inline-flex items-center gap-1 mt-1
                text-xs font-medium text-eco-700 bg-eco-50
                border border-eco-200 px-2 py-0.5 rounded-full">
                <MapPin size={10} />
                Zone · {zone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Account info — read-only */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5
        space-y-4">
        <h2 className="font-semibold text-ink-800">Account information</h2>

        <InfoRow icon={User}  label="Full name" value={name}  />
        <InfoRow icon={Mail}  label="Email"     value={email} />
        <InfoRow icon={Phone} label="Phone"     value={phone} />

        <p className="text-xs text-ink-400 pt-1">
          To update your account details, contact your dispatch coordinator.
        </p>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5
        space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-ink-500" />
          <h2 className="font-semibold text-ink-800">Change password</h2>
        </div>

        <Field label="Current password">
          <input
            type={show ? 'text' : 'password'}
            value={pwd.currentPassword}
            onChange={(e) => set({ currentPassword: e.target.value })}
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputCls}
          />
        </Field>

        <Field label="New password" hint="Min. 6 characters">
          <input
            type={show ? 'text' : 'password'}
            value={pwd.newPassword}
            onChange={(e) => set({ newPassword: e.target.value })}
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputCls}
          />
        </Field>

        <Field label="Confirm new password">
          <input
            type={show ? 'text' : 'password'}
            value={pwd.confirmPassword}
            onChange={(e) => set({ confirmPassword: e.target.value })}
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputCls}
          />
        </Field>

        {/* Show / hide toggle */}
        <label className="flex items-center gap-2 select-none cursor-pointer
          text-sm text-ink-600 w-fit">
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
            className="w-4 h-4 rounded border-ink-300 text-eco-600
              focus:ring-eco-500"
          />
          Show passwords
        </label>

        {/* Password strength hint */}
        {pwd.newPassword.length > 0 && (
          <ul className="grid grid-cols-2 gap-y-1 text-[11px]">
            {[
              { ok: pwd.newPassword.length >= 6,       label: '6+ characters'    },
              { ok: /[A-Z]/.test(pwd.newPassword),     label: 'Uppercase letter' },
              { ok: /[0-9]/.test(pwd.newPassword),     label: 'Number'           },
              { ok: /[^A-Za-z0-9]/.test(pwd.newPassword), label: 'Symbol'        },
            ].map((c) => (
              <li key={c.label}
                className={`flex items-center gap-1.5
                  ${c.ok ? 'text-eco-700' : 'text-ink-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full
                  ${c.ok ? 'bg-eco-500' : 'bg-ink-300'}`} />
                {c.label}
              </li>
            ))}
          </ul>
        )}

        {/* Error */}
        {err && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200
            rounded-xl px-3 py-2.5">
            {err}
          </div>
        )}

        {/* Success */}
        {ok && (
          <div className="flex items-center gap-2 text-xs text-eco-700
            bg-eco-50 border border-eco-200 rounded-xl px-3 py-2.5">
            <CheckCircle2 size={13} className="shrink-0" />
            Password changed successfully.
          </div>
        )}

        <Button
          onClick={handleSubmit}
          loading={saving}
          disabled={!canSubmit}
          className="w-full"
        >
          Update password
        </Button>
      </div>
    </div>
  );
}
