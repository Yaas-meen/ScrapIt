import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/ui/Button';
import { getInitials } from '../../utils/generateBadgeColor';

const inputCls = `w-full h-11 rounded-xl border border-ink-200 px-3 text-sm
  bg-white focus:border-eco-500 focus:ring-2 focus:ring-eco-100
  outline-none transition`;

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CollectorProfile() {
  const user  = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);

  const [pwd, setPwd] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [ok,     setOk]     = useState(false);
  const [err,    setErr]    = useState('');

  const name = user?.name || user?.fullName || 'Collector';

  const savePassword = async () => {
    setErr(''); setOk(false);

    if (pwd.newPassword !== pwd.confirmPassword) {
      setErr('New passwords do not match');
      return;
    }
    if (pwd.newPassword.length < 6) {
      setErr('Password must be at least 6 characters');
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
      setTimeout(() => setOk(false), 3000);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
        e?.message ||
        'Failed to change password'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-800">Profile</h1>
        <p className="text-sm text-ink-500 mt-1">
          Your collector account information.
        </p>
      </div>

      {/* Avatar + info */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gold-100 text-gold-700
          grid place-items-center text-xl font-bold">
          {getInitials(name)}
        </div>
        <div>
          <p className="font-semibold text-ink-800">{name}</p>
          <p className="text-sm text-ink-500">{user?.email}</p>
          {user?.zone && (
            <p className="text-xs text-eco-700 font-medium mt-0.5">
              Zone · {user.zone}
            </p>
          )}
        </div>
      </div>

      {/* Read-only info */}
      <div className="bg-white rounded-2xl border border-ink-100
        shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-ink-800">Account details</h2>

        <Field label="Full name">
          <div className={`${inputCls} flex items-center bg-ink-50
            text-ink-600 cursor-not-allowed`}>
            {name}
          </div>
        </Field>

        <Field label="Email">
          <div className={`${inputCls} flex items-center bg-ink-50
            text-ink-600 cursor-not-allowed`}>
            {user?.email || '—'}
          </div>
        </Field>

        <Field label="Phone">
          <div className={`${inputCls} flex items-center bg-ink-50
            text-ink-600 cursor-not-allowed`}>
            {user?.phone || '—'}
          </div>
        </Field>

        <p className="text-xs text-ink-400">
          To update your account details, contact your dispatch coordinator.
        </p>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-ink-100
        shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-ink-800">Change password</h2>

        <Field label="Current password">
          <input
            type="password"
            value={pwd.currentPassword}
            onChange={(e) =>
              setPwd((p) => ({ ...p, currentPassword: e.target.value }))
            }
            autoComplete="current-password"
            className={inputCls}
          />
        </Field>

        <Field label="New password">
          <input
            type="password"
            value={pwd.newPassword}
            onChange={(e) =>
              setPwd((p) => ({ ...p, newPassword: e.target.value }))
            }
            autoComplete="new-password"
            className={inputCls}
          />
        </Field>

        <Field label="Confirm new password">
          <input
            type="password"
            value={pwd.confirmPassword}
            onChange={(e) =>
              setPwd((p) => ({ ...p, confirmPassword: e.target.value }))
            }
            autoComplete="new-password"
            className={inputCls}
          />
        </Field>

        {err && (
          <p className="text-xs text-red-600 bg-red-50 border
            border-red-200 rounded-lg px-3 py-2">
            {err}
          </p>
        )}

        {ok && (
          <p className="text-xs text-eco-700 bg-eco-50 border
            border-eco-200 rounded-lg px-3 py-2
            flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            Password changed successfully
          </p>
        )}

        <Button
          onClick={savePassword}
          loading={saving}
          disabled={
            !pwd.currentPassword ||
            !pwd.newPassword ||
            !pwd.confirmPassword
          }
        >
          Update password
        </Button>
      </div>
    </div>
  );
}