import { useEffect } from 'react';
import {
  Bell, CheckCircle2, XCircle,
  Truck, PartyPopper, Info,
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import Skeleton   from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button     from '../../components/ui/Button';
import { formatTimeAgo } from '../../utils/formatDate';

const TYPE_ICON = {
  Approved:     { icon: CheckCircle2, color: 'text-blue-600',  bg: 'bg-blue-50'  },
  Rejected:     { icon: XCircle,      color: 'text-red-600',   bg: 'bg-red-50'   },
  'In Progress':{ icon: Truck,        color: 'text-gold-600',  bg: 'bg-gold-50'  },
  Completed:    { icon: PartyPopper,  color: 'text-eco-600',   bg: 'bg-eco-50'   },
  General:      { icon: Info,         color: 'text-ink-500',   bg: 'bg-ink-100'  },
  pickup_approved:   { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
  pickup_rejected:   { icon: XCircle,      color: 'text-red-600',  bg: 'bg-red-50'  },
  pickup_in_progress:{ icon: Truck,        color: 'text-gold-600', bg: 'bg-gold-50' },
  pickup_completed:  { icon: PartyPopper,  color: 'text-eco-600',  bg: 'bg-eco-50'  },
};

export default function Notifications() {
  const items      = useNotificationStore((s) => s.items);
  const fetch      = useNotificationStore((s) => s.fetch);
  const markRead   = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const isLoading  = useNotificationStore((s) => s.isLoading);
  const unread     = useNotificationStore((s) => s.meta.unreadCount);

  useEffect(() => { fetch(); }, []);

  const handleClick = (n) => {
    const id = n.id || n._id;
    if (!n.readAt && !n.isRead) markRead(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-800">Notifications</h1>
          <p className="text-sm text-ink-500 mt-1">
            Updates about your pickups and rewards.
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" onClick={markAllRead} size="sm">
            Mark all as read
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-ink-100
        shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1,2,3,4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            message="We'll let you know when something happens with your pickups."
          />
        ) : (
          <ul className="divide-y divide-ink-100">
            {items.map((n) => {
              const id    = n.id || n._id;
              const read  = n.readAt || n.isRead;
              const conf  = TYPE_ICON[n.type] || TYPE_ICON.General;
              const Icon  = conf.icon;

              return (
                <li
                  key={id}
                  onClick={() => handleClick(n)}
                  className={`flex gap-4 p-4 sm:p-5 cursor-pointer
                    transition-colors hover:bg-ink-50/60
                    ${!read ? 'bg-eco-50/40' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl grid place-items-center
                    shrink-0 ${conf.bg}`}>
                    <Icon size={18} className={conf.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug
                        ${!read ? 'font-semibold text-ink-800'
                                 : 'font-medium text-ink-700'}`}>
                        {n.title}
                      </p>
                      {!read && (
                        <span className="w-2 h-2 rounded-full bg-eco-500
                          shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-ink-400 mt-1">
                      {formatTimeAgo(n.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
