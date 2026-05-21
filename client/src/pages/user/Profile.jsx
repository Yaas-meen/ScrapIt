import { useEffect }             from 'react';
import { useForm }               from 'react-hook-form';
import { zodResolver }           from '@hookform/resolvers/zod';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore }          from '../../store/useAuthStore';
import { userApi }               from '../../api/userApi';
import Button                    from '../../components/ui/Button';
import { getInitials }           from '../../utils/generateBadgerColor';
import {
  profileSchema,
  changePasswordSchema,
} from '../../validation/schemas';

const inputCls =
  'w-full h-11 rounded-xl border px-3 text-sm bg-white outline-none transition ';

function FormInput({ label, hint, error, registration, type = 'text', placeholder }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-ink-800">{label}</label>
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        {...registration}
        className={inputCls +
          (error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-ink-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-100'
          )
        }
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={11} />
          {error.message}
        </p>
      )}
    </div>
  );
}

// ── Profile section ───────────────────────────────────────────
function ProfileForm({ user, setAuth, token }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || user?.name || '',
      phone:    user?.phone    || '',
      address:  user?.address  || user?.defaultAddress || '',
    },
  });

  // Re-populate when user changes
  useEffect(() => {
    reset({
      fullName: user?.fullName || user?.name || '',
      phone:    user?.phone    || '',
      address:  user?.address  || user?.defaultAddress || '',
    });
  }, [user, reset]);

  const onSubmit = async (data) => {
    const updated = await userApi.updateProfile({
      fullName:       data.fullName,
      phone:          data.phone,
      defaultAddress: data.address,
    });
    setAuth({
      user:        { ...user, ...updated, name: updated.fullName },
      accessToken: token,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border border-ink-100 shadow-sm
        p-5 space-y-4">
      <h2 className="font-semibold text-ink-800">Personal information</h2>

      <FormInput
        label="Full name"
        registration={register('fullName')}
        error={errors.fullName}
        placeholder="Chidi Okeke"
      />
      <FormInput
        label="Phone number"
        type="tel"
        registration={register('phone')}
        error={errors.phone}
        placeholder="+234..."
      />
      <div>
        <label className="block text-sm font-medium text-ink-800 mb-1.5">
          Default pickup address
        </label>
        <textarea
          rows={2}
          {...register('address')}
          placeholder="Your full pickup address"
          className={inputCls + 'h-auto py-2.5 ' +
            (errors.address
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-ink-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-100'
            )
          }
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={11} />{errors.address.message}
          </p>
        )}
      </div>

      {isSubmitSuccessful && (
        <p className="text-xs text-eco-700 bg-eco-50 border border-eco-200
          rounded-lg px-3 py-2 flex items-center gap-1.5">
          <CheckCircle2 size={12} /> Profile saved successfully
        </p>
      )}

      <Button type="submit" loading={isSubmitting}>
        Save changes
      </Button>
    </form>
  );
}

// ── Password section ──────────────────────────────────────────
function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data) => {
    await userApi.changePassword(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border border-ink-100 shadow-sm
        p-5 space-y-4">
      <h2 className="font-semibold text-ink-800">Change password</h2>

      <FormInput
        label="Current password"
        type="password"
        registration={register('currentPassword')}
        error={errors.currentPassword}
        placeholder="••••••••"
      />
      <FormInput
        label="New password"
        type="password"
        hint="Min. 6 characters"
        registration={register('newPassword')}
        error={errors.newPassword}
        placeholder="••••••••"
      />
      <FormInput
        label="Confirm new password"
        type="password"
        registration={register('confirmPassword')}
        error={errors.confirmPassword}
        placeholder="••••••••"
      />

      {isSubmitSuccessful && (
        <p className="text-xs text-eco-700 bg-eco-50 border border-eco-200
          rounded-lg px-3 py-2 flex items-center gap-1.5">
          <CheckCircle2 size={12} /> Password changed successfully
        </p>
      )}

      <Button type="submit" loading={isSubmitting}>
        Update password
      </Button>
    </form>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Profile() {
  const user       = useAuthStore((s) => s.user);
  const setAuth    = useAuthStore((s) => s.setAuth);
  const token      = useAuthStore((s) => s.accessToken);
  const name       = user?.fullName || user?.name || '';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-800">Profile</h1>
        <p className="text-sm text-ink-500 mt-1">
          Manage your account information.
        </p>
      </div>

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

      <ProfileForm user={user} setAuth={setAuth} token={token} />
      <PasswordForm />
    </div>
  );
}