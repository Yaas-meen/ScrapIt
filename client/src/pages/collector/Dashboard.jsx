import { useEffect } from 'react';
import { Link }       from 'react-router-dom';
import {
  ClipboardCheck, Truck, CheckCircle2,
  MapPin, Calendar, Phone, ArrowRight,
} from 'lucide-react';
import { useAuthStore }   from '../../store/useAuthStore';
import { usePickupStore } from '../../store/usePickupStore';
import StatusBadge from '../../components/ui/StatusBadge';
import Skeleton    from '../../components/ui/Skeleton';
import EmptyState  from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatDate';

// Normalize mock + API shapes
function norm(p) {
  return {
    id:         p._id || p.id,
    status:     p.status,
    address:    p.address,
    date:       p.pickupDate || p.scheduledFor,
    userPhone:  p.user?.phone || p.userPhone || null,
    userName:   p.user?.fullName || p.userName || 'User',
    weight:     p.totalWeight  || p.weight || 0,
    wasteItems: p.wasteItems   ||
      (p.wasteType
        ? [{ type: p.wasteType, weight: p.weight }]
        : []),
  };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function CollectorDashboard() {
  const user                 = useAuthStore((s) => s.user);
  const assignedPickups      = usePickupStore((s) => s.assignedPickups);
  const fetchAssignedPickups = usePickupStore((s) => s.fetchAssignedPickups);
  const isLoading            = usePickupStore((s) => s.isLoading);

  useEffect(() => {
    if (user?.id) fetchAssignedPickups(user.id);
  }, [user?.id]);

  const now      = new Date();
  const todayStr = now.toDateString();

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const stats = {
    assignedToday: assignedPickups.filter((p) => {
      const d = p.pickupDate || p.scheduledFor;
      return d && new Date(d).toDateString() === todayStr
        && ['Approved', 'In Progress'].includes(p.status);
    }).length,
    inProgress: assignedPickups.filter((p) =>
      p.status === 'In Progress'
    ).length,
    completedThisWeek: assignedPickups.filter((p) =>
      p.status === 'Completed' &&
      new Date(p.createdAt) >= weekAgo
    ).length,
  };

  const active = assignedPickups
    .filter((p) => ['Approved', 'In Progress'].includes(p.status))
    .slice(0, 4)
    .map(norm);

  const name = user?.name || user?.fullName || 'Collector';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-ink-800">
          {getGreeting()}, {name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Here's your pickup overview for today.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Assigned today',
            value: stats.assignedToday,
            icon:  ClipboardCheck,
            color: 'text-blue-600',
            bg:    'bg-blue-50',
          },
          {
            label: 'In progress',
            value: stats.inProgress,
            icon:  Truck,
            color: 'text-gold-600',
            bg:    'bg-gold-50',
          },
          {
            label: 'Done this week',
            value: stats.completedThisWeek,
            icon:  CheckCircle2,
            color: 'text-eco-600',
            bg:    'bg-eco-50',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label}
            className="bg-white rounded-2xl border border-ink-100
              shadow-sm p-4">
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

      {/* Active pickups */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink-800">Active pickups</h2>
          <Link to="/collector/assigned"
            className="text-sm text-eco-700 font-medium
              inline-flex items-center gap-1 hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : active.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No active pickups"
            message="You have no pickups assigned for today."
          />
        ) : (
          <div className="space-y-3">
            {active.map((p) => (
              <div key={p.id}
                className="bg-white rounded-2xl border border-ink-100
                  shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink-800 text-sm">
                      {p.wasteItems
                        .map((i) => `${i.type} ${i.weight}kg`)
                        .join(' · ') || `${p.weight}kg`}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {p.userName}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs
                  text-ink-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {p.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(p.date)}
                  </span>
                  {p.userPhone && (
                    <a href={`tel:${p.userPhone}`}
                      className="flex items-center gap-1
                        text-eco-700 font-medium"
                      onClick={(e) => e.stopPropagation()}>
                      <Phone size={11} />
                      {p.userPhone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}