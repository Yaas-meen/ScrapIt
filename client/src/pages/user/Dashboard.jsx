import { useEffect, useRef, useState } from 'react';
import { Link }                         from 'react-router-dom';
import {
  Package, Clock, CheckCircle2,
  ArrowRight, Bell, Gift,
} from 'lucide-react';
import { useAuthStore }         from '../../store/useAuthStore';
import { usePickupStore }       from '../../store/usePickupStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import StatusBadge   from '../../components/ui/StatusBadge';
import Skeleton      from '../../components/ui/Skeleton';
import ErrorState    from '../../components/ui/ErrorState';
import { formatDate, formatTimeAgo, getGreeting } from '../../utils/formatDate';
import { formatCurrency }        from '../../utils/formatCurrency';

function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let raf;
    const start   = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

// Skeleton for stat cards
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-4">
      <Skeleton className="w-8 h-8 rounded-xl mb-3" />
      <Skeleton className="h-8 w-16 mb-1.5" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

// Skeleton for table rows
function TableRowSkeleton() {
  return (
    <tr className="border-b border-ink-100">
      {[1,2,3,4,5].map((i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full rounded-lg" />
        </td>
      ))}
    </tr>
  );
}

export default function UserDashboard() {
  const user              = useAuthStore((s) => s.user);
  const refreshUser       = useAuthStore((s) => s.refreshUser);
  const myPickups         = usePickupStore((s) => s.myPickups);
  const fetchMyPickups    = usePickupStore((s) => s.fetchMyPickups);
  const pickupLoading     = usePickupStore((s) => s.isLoading);
  const pickupError       = usePickupStore((s) => s.error);
  const notifications     = useNotificationStore((s) => s.items);
  const fetchNotifs       = useNotificationStore((s) => s.fetch);
  const notifLoading      = useNotificationStore((s) => s.isLoading);
  const unread            = useNotificationStore((s) => s.meta.unreadCount);

  const animatedPoints = useCountUp(user?.points || 0);

  const load = () => {
    refreshUser().catch(() => {});
    if (user?.id || user?._id) fetchMyPickups(user?.id || user?._id);
    fetchNotifs();
  };

  useEffect(() => { load(); }, [user?.id, user?._id]);

  const stats = {
    total:     myPickups.length,
    pending:   myPickups.filter((p) => p.status === 'Pending').length,
    completed: myPickups.filter((p) => p.status === 'Completed').length,
  };

  const recent       = [...myPickups]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentNotifs = notifications
    .filter((n) => !n.readAt && !n.isRead)
    .slice(0, 3);

  const name = user?.name || user?.fullName || 'there';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-ink-800">
          {getGreeting()}, {name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Here's what's happening with your recycling.
        </p>
      </div>

      {/* Points hero */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-gold-500
        to-gold-600 text-white shadow-soft-lg">
        <p className="text-sm font-medium text-gold-100 mb-1">
          Your points balance
        </p>
        <p className="text-5xl font-bold tabular-nums tracking-tight">
          {animatedPoints.toLocaleString()}
          <span className="text-2xl font-medium text-gold-200 ml-2">pts</span>
        </p>
        <p className="text-sm text-gold-200 mt-1">
          ≈ {formatCurrency(user?.points || 0)} airtime value
        </p>
        <Link to="/rewards"
          className="mt-4 inline-flex items-center gap-2 bg-white/20
            hover:bg-white/30 text-white text-sm font-semibold
            px-4 h-9 rounded-xl transition">
          <Gift size={15} />
          Redeem rewards
        </Link>
      </div>

      {/* Stats row */}
      {pickupLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total requests', value: stats.total,     icon: Package,      color: 'text-eco-600',  bg: 'bg-eco-50'  },
            { label: 'Pending',        value: stats.pending,   icon: Clock,        color: 'text-gold-600', bg: 'bg-gold-50' },
            { label: 'Completed',      value: stats.completed, icon: CheckCircle2, color: 'text-eco-600',  bg: 'bg-eco-50'  },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label}
              className="bg-white rounded-2xl border border-ink-100 p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-xl ${bg} ${color}
                grid place-items-center mb-3`}>
                <Icon size={16} />
              </div>
              <p className="text-2xl font-bold text-ink-800 tabular-nums">
                {value}
              </p>
              <p className="text-xs text-ink-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm
        overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-ink-100">
          <h2 className="font-semibold text-ink-800">Recent activity</h2>
          <Link to="/pickups"
            className="text-sm text-eco-700 font-medium hover:underline
              inline-flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {pickupLoading ? (
          <table className="w-full">
            <tbody>
              {[1,2,3].map((i) => <TableRowSkeleton key={i} />)}
            </tbody>
          </table>
        ) : pickupError ? (
          <ErrorState
            message={pickupError}
            onRetry={() => fetchMyPickups(user?.id || user?._id)}
          />
        ) : recent.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-ink-400">No pickups yet.</p>
            <Link to="/schedule"
              className="mt-3 inline-block text-sm text-eco-700 font-semibold">
              Schedule your first pickup →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50/60 text-xs uppercase tracking-wide
                text-ink-500">
                <tr>
                  <th className="text-left p-3 pl-5 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Weight</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 pr-5 font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => {
                  const id     = p._id || p.id;
                  const date   = p.pickupDate || p.scheduledFor;
                  const weight = p.totalWeight || p.weight || 0;
                  const pts    = p.totalPoints || p.estimatedPoints || 0;
                  const type   = p.wasteItems?.[0]?.type || p.wasteType || '—';

                  return (
                    <tr key={id}
                      className="border-b border-ink-100 last:border-0
                        hover:bg-ink-50/60">
                      <td className="p-3 pl-5 text-ink-600 whitespace-nowrap">
                        {formatDate(date)}
                      </td>
                      <td className="p-3 capitalize text-ink-700">{type}</td>
                      <td className="p-3 tabular-nums">{weight} kg</td>
                      <td className="p-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="p-3 pr-5 text-right tabular-nums
                        font-semibold text-gold-600">
                        {p.status === 'Completed' ? `+${pts} pts` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notification preview */}
      {notifLoading ? (
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[1,2].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        </div>
      ) : recentNotifs.length > 0 && (
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-800 flex items-center gap-2">
              <Bell size={16} className="text-eco-600" />
              Notifications
              {unread > 0 && (
                <span className="bg-eco-600 text-white text-[10px] font-bold
                  w-5 h-5 rounded-full grid place-items-center">
                  {unread}
                </span>
              )}
            </h2>
            <Link to="/notifications"
              className="text-sm text-eco-700 font-medium hover:underline">
              See all
            </Link>
          </div>
          <ul className="space-y-3">
            {recentNotifs.map((n) => (
              <li key={n.id || n._id}
                className="flex gap-3 p-3 rounded-xl bg-eco-50/60
                  border border-eco-100">
                <span className="w-7 h-7 rounded-full bg-eco-100
                  text-eco-700 grid place-items-center shrink-0 text-xs">
                  {n.type === 'Completed' ? '🎉'
                   : n.type === 'Approved' ? '✅'
                   : n.type === 'Rejected' ? '❌'
                   : n.type === 'In Progress' ? '🚛' : '🔔'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">
                    {n.title}
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {formatTimeAgo(n.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}