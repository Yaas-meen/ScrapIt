import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { userApi }      from '../../api/userApi';
import Button           from '../../components/ui/Button';
import { getInitials }  from '../../utils/generateBadgeColor';

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

const inputCls = `w-full h-11 rounded-xl border border-ink-200 px-3 text-sm
  bg-white focus:border-eco-500 focus:ring-2 focus:ring-eco-100
  outline-none transition`;

export default function Profile() {
  const user     = useAuthStore((s) => s.user);
  const setAuth  = useAuthStore((s) => s.setAuth);
  const token    = useAuthStore((s) => s.accessToken);

  const [profile, setProfile] = useState({
    fullName: user?.fullName || user?.name || '',
    phone:    user?.phone    || '',
    address:  user?.address  || user?.defaultAddress || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileOk,     setProfileOk]     = useState(false);
  const [profileErr,    setProfileErr]    = useState('');

  const [pwd, setPwd] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdOk,     setPwdOk]     = useState(false);
  const [pwdErr,    setPwdErr]    = useState('');

  const name = user?.name || user?.fullName || '';

  const saveProfile = async () => {
    setProfileSaving(true); setProfileErr(''); setProfileOk(false);
    try {
      const updated = await userApi.updateProfile({
        fullName:       profile.fullName,
        phone:          profile.phone,
        defaultAddress: profile.address,
      });
      // Update the store with new user data
      setAuth({ user: { ...user, ...updated, name: updated.fullName }, accessToken: token });
      setProfileOk(true);
      setTimeout(() => setProfileOk(false), 3000);
    } catch (err) {
      setProfileErr(err?.response?.data?.message || err?.message || 'Save failed');
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async () => {
    setPwdSaving(true); setPwdErr(''); setPwdOk(false);
    if (pwd.newPassword !== pwd.confirmPassword) {
      setPwdErr('New passwords do not match');
      setPwdSaving(false);
      return;
    }
    try {
      await userApi.changePassword(pwd);
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwdOk(true);
      setTimeout(() => setPwdOk(false), 3000);
    } catch (err) {
      setPwdErr(err?.response?.data?.message || err?.message || 'Failed to change password');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-800">Profile</h1>
        <p className="text-sm text-ink-500 mt-1">
          Manage your account information.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-eco-100 text-eco-700
          grid place-items-center text-xl font-bold">
          {getInitials(name)}
        </div>
        <div>
          <p className="font-semibold text-ink-800">{name}</p>
          <p className="text-sm text-ink-500">{user?.email}</p>
          <p className="text-xs text-gold-600 font-medium mt-0.5">
            {(user?.points || 0).toLocaleString()} pts
          </p>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5
        space-y-4">
        <h2 className="font-semibold text-ink-800">Personal information</h2>

        <Field label="Full name">
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, fullName: e.target.value }))
            }
            className={inputCls}
          />
        </Field>

        <Field label="Phone number">
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) =>
              setProfile((p) => ({ ...p, phone: e.target.value }))
            }
            placeholder="+234..."
            className={inputCls}
          />
        </Field>

        <Field label="Default pickup address">
          <textarea
            rows={2}
            value={profile.address}
            onChange={(e) =>
              setProfile((p) => ({ ...p, address: e.target.value }))
            }
            placeholder="Your full address"
            className={`${inputCls} h-auto py-2.5`}
          />
        </Field>

        {profileErr && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200
            rounded-lg px-3 py-2">
            {profileErr}
          </p>
        )}

        {profileOk && (
          <p className="text-xs text-eco-700 bg-eco-50 border border-eco-200
            rounded-lg px-3 py-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Profile saved successfully
          </p>
        )}

        <Button onClick={saveProfile} loading={profileSaving}>
          Save changes
        </Button>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5
        space-y-4">
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

        {pwdErr && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200
            rounded-lg px-3 py-2">
            {pwdErr}
          </p>
        )}

        {pwdOk && (
          <p className="text-xs text-eco-700 bg-eco-50 border border-eco-200
            rounded-lg px-3 py-2 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Password changed successfully
          </p>
        )}

        <Button
          onClick={savePassword}
          loading={pwdSaving}
          disabled={!pwd.currentPassword || !pwd.newPassword || !pwd.confirmPassword}
        >
          Update password
        </Button>
      </div>
    </div>
  );
}