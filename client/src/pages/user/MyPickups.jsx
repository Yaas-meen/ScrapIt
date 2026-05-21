import { useEffect, useState } from 'react';
import { Inbox }               from 'lucide-react';
import { useAuthStore }        from '../../store/useAuthStore';
import { usePickupStore }      from '../../store/usePickupStore';
import StatusBadge   from '../../components/ui/StatusBadge';
import SlideOver     from '../../components/ui/SlideOver';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState    from '../../components/ui/EmptyState';
import Skeleton      from '../../components/ui/Skeleton';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { STATUS_TIMELINE }    from '../../constants/statusList';

const TABS = ['All','Pending','Approved','In Progress','Completed','Rejected'];

function norm(p) {
  return {
    id:          p._id || p.id,
    date:        p.pickupDate || p.scheduledFor,
    status:      p.status,
    address:     p.address,
    totalWeight: p.totalWeight || p.weight || 0,
    totalPoints: p.totalPoints || p.estimatedPoints || 0,
    pointsAwarded: p.pointsAwarded || 0,
    wasteItems:  p.wasteItems ||
      (p.wasteType ? [{ type: p.wasteType, weight: p.weight }] : []),
    collector:   p.assignedCollector?.fullName || null,
    imageUrl:    p.imageUrl || p.imageUrls?.[0] || null,
    rejectionReason: p.rejectionReason || null,
    timeline:    p.statusLog || p.timeline || [],
    createdAt:   p.createdAt,
  };
}

function StatusTimeline({ status, timeline = [] }) {
  const steps = STATUS_TIMELINE;
  const current = steps.indexOf(status);
  const isRejected = status === 'Rejected';

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const done   = !isRejected && i <= current;
        const active = !isRejected && i === current;
        const entry  = timeline.find((t) => t.status === step || t.status === step);

        return (
          <div key={step} className="flex gap-3 items-start">
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center
              justify-center shrink-0 text-[10px] font-bold
              ${done
                ? 'bg-eco-600 border-eco-600 text-white'
                : 'bg-white border-ink-300 text-ink-400'}`}>
              {done && '✓'}
            </div>
            <div>
              <p className={`text-sm font-medium
                ${active ? 'text-eco-700' : done ? 'text-ink-700' : 'text-ink-400'}`}>
                {step}
              </p>
              {entry?.at && (
                <p className="text-xs text-ink-400 mt-0.5">
                  {formatDateTime(entry.at)}
                  {entry.by ? ` · by ${entry.by}` : ''}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {isRejected && (
        <div className="flex gap-3 items-start">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-red-600 border-2
            border-red-600 text-white flex items-center justify-center
            shrink-0 text-[10px] font-bold">✕</div>
          <p className="text-sm font-medium text-red-700">Rejected</p>
        </div>
      )}
    </div>
  );
}

export default function MyPickups() {
  const user            = useAuthStore((s) => s.user);
  const myPickups       = usePickupStore((s) => s.myPickups);
  const fetchMyPickups  = usePickupStore((s) => s.fetchMyPickups);
  const cancelPickup    = usePickupStore((s) => s.cancelPickup);
  const isLoading       = usePickupStore((s) => s.isLoading);

  const [tab,        setTab]        = useState('All');
  const [selected,   setSelected]   = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [lightbox,   setLightbox]   = useState(null);

  useEffect(() => {
    if (user?.id) fetchMyPickups(user.id);
  }, [user?.id]);

  const filtered = myPickups.filter(
    (p) => tab === 'All' || p.status === tab
  ).map(norm);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await cancelPickup(deleteId);
      setDeleteId(null);
      if (selected?.id === deleteId) setSelected(null);
    } finally {
      setDeleting(false);
    }
  };

  const sel = selected ? norm(selected) : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-800">My pickups</h1>
        <p className="text-sm text-ink-500 mt-1">
          Track all your pickup requests and their status.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-ink-100 rounded-xl w-fit">
        {TABS.map((t) => {
          const count = t === 'All'
            ? myPickups.length
            : myPickups.filter((p) => p.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 h-8 rounded-lg text-xs font-semibold
                transition inline-flex items-center gap-1.5
                ${tab === t
                  ? 'bg-white text-ink-800 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'}`}
            >
              {t}
              <span className={`text-[10px] px-1.5 rounded-full
                ${tab === t
                  ? 'bg-eco-100 text-eco-700'
                  : 'bg-ink-200 text-ink-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-ink-100
        shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50/60 text-xs uppercase tracking-wide
              text-ink-500">
              <tr>
                <th className="text-left p-3 pl-5 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Items</th>
                <th className="text-left p-3 font-medium">Weight</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 pr-5 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="p-6">
                    <div className="space-y-2">
                      {[1,2,3].map((i) => (
                        <Skeleton key={i} className="h-10" />
                      ))}
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Inbox}
                      title={`No ${tab === 'All' ? '' : tab.toLowerCase()} pickups`}
                      message="Your pickups will appear here once scheduled."
                    />
                  </td>
                </tr>
              )}

              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(
                    myPickups.find((mp) => (mp._id || mp.id) === p.id)
                  )}
                  className="border-b border-ink-100 last:border-0
                    hover:bg-ink-50/60 cursor-pointer"
                >
                  <td className="p-3 pl-5 text-ink-600">
                    {formatDate(p.date)}
                  </td>
                  <td className="p-3 text-ink-700 capitalize">
                    {p.wasteItems.map((i) => i.type).join(', ') || '—'}
                  </td>
                  <td className="p-3 tabular-nums">
                    {p.totalWeight} kg
                  </td>
                  <td className="p-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="p-3 pr-5 text-right tabular-nums
                    font-semibold">
                    {p.status === 'Completed'
                      ? <span className="text-gold-600">+{p.totalPoints} pts</span>
                      : <span className="text-ink-300">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail slide-over */}
      <SlideOver
        open={!!sel}
        onClose={() => setSelected(null)}
        title={sel ? `Pickup · ${formatDate(sel.date)}` : ''}
        subtitle={sel?.address}
        footer={
          sel?.status === 'Pending' && (
            <button
              onClick={() => setDeleteId(sel.id)}
              className="w-full h-10 rounded-xl border border-red-200
                text-red-700 text-sm font-semibold hover:bg-red-50
                transition"
            >
              Cancel pickup
            </button>
          )
        }
      >
        {sel && (
          <div className="space-y-6">
            <StatusBadge status={sel.status} size="md" />

            {/* Waste items */}
            <div>
              <h3 className="text-xs font-semibold text-ink-500 uppercase
                tracking-wide mb-3">
                Waste items
              </h3>
              <div className="space-y-2">
                {sel.wasteItems.map((it, i) => (
                  <div key={i}
                    className="flex justify-between text-sm py-2
                      border-b border-ink-100 last:border-0">
                    <span className="capitalize text-ink-700">
                      {it.type}
                    </span>
                    <span className="text-ink-600">
                      {it.weight} kg
                      {it.pointsEarned != null &&
                        <span className="ml-2 text-gold-600 font-medium">
                          +{it.pointsEarned} pts
                        </span>
                      }
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span>Total</span>
                  <span>{sel.totalWeight} kg
                    {sel.status === 'Completed' &&
                      <span className="ml-2 text-gold-600">
                        +{sel.totalPoints} pts
                      </span>
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              {sel.collector && (
                <div className="flex gap-3">
                  <span className="text-ink-500 w-24 shrink-0">Collector</span>
                  <span className="text-ink-800 font-medium">
                    {sel.collector}
                  </span>
                </div>
              )}
              <div className="flex gap-3">
                <span className="text-ink-500 w-24 shrink-0">Submitted</span>
                <span className="text-ink-800">
                  {formatDateTime(sel.createdAt)}
                </span>
              </div>
            </div>

            {/* Image */}
            {sel.imageUrl && (
              <div>
                <h3 className="text-xs font-semibold text-ink-500 uppercase
                  tracking-wide mb-2">
                  Photo
                </h3>
                <img
                  src={sel.imageUrl}
                  alt="Waste"
                  onClick={() => setLightbox(sel.imageUrl)}
                  className="w-full h-40 object-cover rounded-xl
                    border border-ink-200 cursor-zoom-in"
                />
              </div>
            )}

            {/* Rejection reason */}
            {sel.status === 'Rejected' && sel.rejectionReason && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-xs font-semibold text-red-700 uppercase
                  tracking-wide mb-1">
                  Rejection reason
                </p>
                <p className="text-sm text-red-700">{sel.rejectionReason}</p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="text-xs font-semibold text-ink-500 uppercase
                tracking-wide mb-3">
                Status timeline
              </h3>
              <StatusTimeline
                status={sel.status}
                timeline={sel.timeline}
              />
            </div>
          </div>
        )}
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Cancel pickup request?"
        message="This pickup request will be permanently removed. This cannot be undone."
        confirmText="Yes, cancel it"
      />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center
            justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Full size"
            className="max-w-full max-h-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
