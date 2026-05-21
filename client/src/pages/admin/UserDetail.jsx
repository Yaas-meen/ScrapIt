import { useEffect, useState } from 'react';
import { adminApi }  from '../../api/adminApi';
import { userApi }   from '../../api/userApi';
import Skeleton      from '../../components/ui/Skeleton';
import StatusBadge   from '../../components/ui/StatusBadge';
import { getInitials } from '../../utils/generateBadgeColor';
import { formatDate, formatTimeAgo } from '../../utils/formatDate';
import { formatNumber, formatPoints, formatCurrency } from '../../utils/formatCurrency';

const TABS = ['Overview', 'Pickups', 'Rewards'];

export default function UserDetail({ userId }) {
  const [tab,     setTab]     = useState('Overview');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    adminApi.userSummary(userId)
      .then(setData)
      .catch((e) => setError(e?.message || 'Failed to load user'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-600 text-center py-8">{error || 'No data'}</p>
    );
  }

  const { user, pickups = [], rewards = [], summary = {} } = data;
  const name = user?.fullName || user?.name || '—';

  return (
    <div className="space-y-5">
      {/* User header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-eco-100 text-eco-700
          grid place-items-center font-bold text-lg">
          {getInitials(name)}
        </div>
        <div>
          <p className="font-semibold text-ink-800">{name}</p>
          <p className="text-sm text-ink-500">{user?.email}</p>
          <p className="text-xs text-ink-400 mt-0.5">
            Member since {formatDate(user?.createdAt)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-ink-100 rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 h-8 rounded-lg text-xs font-semibold transition
              ${tab === t
                ? 'bg-white text-ink-800 shadow-sm'
                : 'text-ink-500 hover:text-ink-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total pickups',   val: formatNumber(summary.totalPickups || 0)    },
            { label: 'Completed',       val: formatNumber(summary.completedPickups || 0) },
            { label: 'Completion rate', val: `${summary.completionRate || 0}%`           },
            { label: 'Balance',         val: formatPoints(user?.points || 0)             },
            { label: 'Total earned',    val: formatPoints(summary.totalPointsEarned || 0)},
            { label: 'Total redeemed',  val: formatPoints(summary.totalPointsSpent || 0) },
          ].map(({ label, val }) => (
            <div key={label}
              className="bg-white rounded-xl border border-ink-100 p-4">
              <p className="text-xs text-ink-500 mb-1">{label}</p>
              <p className="text-lg font-bold text-ink-800 tabular-nums">{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pickups */}
      {tab === 'Pickups' && (
        <div className="space-y-2">
          {pickups.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-6">
              No pickups yet.
            </p>
          ) : pickups.slice(0, 10).map((p) => (
            <div key={p._id || p.id}
              className="flex items-center justify-between py-2 border-b
                border-ink-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-ink-800">
                  {(p.totalWeight || p.weight || 0)} kg
                </p>
                <p className="text-xs text-ink-400">
                  {formatDate(p.pickupDate || p.scheduledFor)}
                </p>
              </div>
              <StatusBadge status={p.status} size="sm" />
            </div>
          ))}
        </div>
      )}

      {/* Rewards */}
      {tab === 'Rewards' && (
        <div className="space-y-2">
          {rewards.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-6">
              No redemptions yet.
            </p>
          ) : rewards.slice(0, 10).map((r) => (
            <div key={r._id || r.id}
              className="flex items-center justify-between py-2 border-b
                border-ink-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-ink-800 capitalize">
                  {r.type} · {r.provider}
                </p>
                <p className="text-xs text-ink-400">
                  {formatTimeAgo(r.createdAt)}
                </p>
              </div>
              <span className="text-sm font-semibold text-red-600">
                −{formatNumber(r.pointsSpent)} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
