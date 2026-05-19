import { useEffect, useState } from 'react';
import {
  MapPin, Calendar, Phone, CheckCircle2,
  Loader2, ClipboardCheck,
} from 'lucide-react';
import { useAuthStore }   from '../../store/useAuthStore';
import { usePickupStore } from '../../store/usePickupStore';
import StatusBadge   from '../../components/ui/StatusBadge';
import Modal         from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState    from '../../components/ui/EmptyState';
import Skeleton      from '../../components/ui/Skeleton';
import Button        from '../../components/ui/Button';
import { formatDate } from '../../utils/formatDate';

const TABS = ['All', 'Approved', 'In Progress', 'Completed'];

function norm(p) {
  return {
    id:         p._id || p.id,
    status:     p.status,
    address:    p.address,
    date:       p.pickupDate || p.scheduledFor,
    userPhone:  p.user?.phone || p.userPhone || null,
    userName:   p.user?.fullName || p.userName || 'User',
    weight:     p.totalWeight || p.weight || 0,
    points:     p.totalPoints || p.estimatedPoints || 0,
    wasteItems: p.wasteItems ||
      (p.wasteType ? [{ type: p.wasteType, weight: p.weight }] : []),
    imageUrl:   p.imageUrl || p.imageUrls?.[0] || null,
    notes:      p.notes || p.completionNotes || '',
  };
}

// ── Completion modal ──────────────────────────────────────────
function CompleteModal({ pickup, open, onClose }) {
  const completePickup = usePickupStore((s) => s.completePickup);

  const [weight,  setWeight]  = useState(String(pickup?.weight || ''));
  const [note,    setNote]    = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  // Reset when a new pickup is passed
  useEffect(() => {
    if (open) {
      setWeight(String(pickup?.weight || ''));
      setNote('');
      setDone(false);
    }
  }, [open, pickup?.id]);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completePickup(pickup.id, {
        verifiedWeight:  Number(weight) || undefined,
        completionNote:  note.trim() || undefined,
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDone(false);
    onClose();
  };

  if (!pickup) return null;

  // ── Success screen ─────────────────────────────────────────
  if (done) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Pickup completed!"
        size="sm"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-eco-100 text-eco-600
            grid place-items-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="font-semibold text-ink-800">
              Pickup marked as completed
            </p>
            <p className="text-sm text-ink-500 mt-1">
              The user will earn{' '}
              <strong className="text-gold-600">
                {pickup.points} pts
              </strong>
              {' '}for this pickup.
            </p>
          </div>
          <Button className="w-full" onClick={handleClose}>Done</Button>
        </div>
      </Modal>
    );
  }

  // ── Completion form ────────────────────────────────────────
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Complete pickup"
      subtitle={`${pickup.userName} · ${pickup.address}`}
      size="md"
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            loading={loading}
            className="flex-1"
          >
            Confirm completion
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Waste image preview */}
        {pickup.imageUrl && (
          <div>
            <p className="text-xs font-medium text-ink-500 uppercase
              tracking-wide mb-2">
              Waste photo
            </p>
            <img
              src={pickup.imageUrl}
              alt="Waste"
              className="w-full h-40 object-cover rounded-xl
                border border-ink-200"
            />
          </div>
        )}

        {/* Waste items */}
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase
            tracking-wide mb-2">
            Waste items
          </p>
          <div className="flex flex-wrap gap-2">
            {pickup.wasteItems.map((it, i) => (
              <span key={i}
                className="text-xs font-medium bg-ink-100 text-ink-700
                  px-2.5 py-1 rounded-full capitalize">
                {it.type} · {it.weight}kg
              </span>
            ))}
          </div>
        </div>

        {/* Verified weight */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">
            Verified weight (kg)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={`Estimated: ${pickup.weight}kg`}
            className="w-full h-11 rounded-xl border border-ink-200 px-3
              text-sm focus:border-eco-500 focus:ring-2
              focus:ring-eco-100 outline-none"
          />
        </div>

        {/* Completion note */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">
            Completion note{' '}
            <span className="text-ink-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any notes about this pickup..."
            className="w-full rounded-xl border border-ink-200 px-3 py-2.5
              text-sm focus:border-eco-500 focus:ring-2
              focus:ring-eco-100 outline-none resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Pickup card ───────────────────────────────────────────────
function PickupCard({ pickup, onStart, onComplete }) {
  const p = norm(pickup);

  return (
    <div className="bg-white rounded-2xl border border-ink-100
      shadow-sm p-4 space-y-3">

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {p.wasteItems.map((it, i) => (
            <span key={i}
              className="text-xs font-medium bg-ink-100 text-ink-700
                px-2.5 py-1 rounded-full capitalize">
              {it.type} {it.weight}kg
            </span>
          ))}
        </div>
        <StatusBadge status={p.status} />
      </div>

      {/* Info row */}
      <div className="space-y-1.5 text-xs text-ink-500">
        <div className="flex items-start gap-1.5">
          <MapPin size={12} className="shrink-0 mt-0.5" />
          <span className="line-clamp-2">{p.address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="shrink-0" />
          <span>{formatDate(p.date)}</span>
        </div>
        {p.userPhone && (
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="shrink-0" />
            <a href={`tel:${p.userPhone}`}
              className="text-eco-700 font-medium hover:underline">
              {p.userPhone}
            </a>
          </div>
        )}
      </div>

      {/* Image thumbnail */}
      {p.imageUrl && (
        <img
          src={p.imageUrl}
          alt="Waste"
          className="w-full h-24 object-cover rounded-xl
            border border-ink-200"
        />
      )}

      {/* Action button */}
      <div className="pt-1">
        {p.status === 'Approved' && (
          <button
            onClick={() => onStart(pickup)}
            className="w-full h-10 rounded-xl bg-eco-600 hover:bg-eco-700
              text-white text-sm font-semibold transition"
          >
            Start pickup
          </button>
        )}
        {p.status === 'In Progress' && (
          <button
            onClick={() => onComplete(pickup)}
            className="w-full h-10 rounded-xl bg-ink-800 hover:bg-ink-900
              text-white text-sm font-semibold transition"
          >
            Mark as completed
          </button>
        )}
        {p.status === 'Completed' && (
          <div className="w-full h-10 rounded-xl bg-ink-50 border
            border-ink-200 text-ink-400 text-sm font-medium
            grid place-items-center">
            Completed
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AssignedPickups({ defaultFilter = 'All' }) {
  const user                 = useAuthStore((s) => s.user);
  const assignedPickups      = usePickupStore((s) => s.assignedPickups);
  const fetchAssignedPickups = usePickupStore((s) => s.fetchAssignedPickups);
  const startPickup          = usePickupStore((s) => s.startPickup);
  const isLoading            = usePickupStore((s) => s.isLoading);

  const [tab,        setTab]        = useState(defaultFilter);
  const [starting,   setStarting]   = useState(null); // pickup being started
  const [completing, setCompleting] = useState(null); // pickup being completed
  const [startBusy,  setStartBusy]  = useState(false);

  useEffect(() => {
    if (user?.id) fetchAssignedPickups(user.id);
  }, [user?.id]);

  // Sync tab when defaultFilter prop changes (history vs assigned route)
  useEffect(() => { setTab(defaultFilter); }, [defaultFilter]);

  const filtered = assignedPickups.filter(
    (p) => tab === 'All' || p.status === tab
  );

  const handleStart = async () => {
    if (!starting) return;
    setStartBusy(true);
    try {
      await startPickup(starting._id || starting.id);
      setStarting(null);
    } finally {
      setStartBusy(false);
    }
  };

  const title = defaultFilter === 'Completed'
    ? 'Pickup history'
    : 'Assigned pickups';

  const subtitle = defaultFilter === 'Completed'
    ? 'All pickups you have completed.'
    : 'Pickups assigned to you — start and complete them here.';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-800">{title}</h1>
        <p className="text-sm text-ink-500 mt-1">{subtitle}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-ink-100 rounded-xl w-fit">
        {TABS.map((t) => {
          const count = t === 'All'
            ? assignedPickups.length
            : assignedPickups.filter((p) => p.status === t).length;

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
                  ? 'bg-gold-100 text-gold-700'
                  : 'bg-ink-200 text-ink-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={`No ${tab === 'All' ? '' : tab.toLowerCase()} pickups`}
          message="Your assigned pickups will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <PickupCard
              key={p._id || p.id}
              pickup={p}
              onStart={setStarting}
              onComplete={setCompleting}
            />
          ))}
        </div>
      )}

      {/* Start confirm dialog */}
      <ConfirmDialog
        open={!!starting}
        onClose={() => setStarting(null)}
        onConfirm={handleStart}
        loading={startBusy}
        danger={false}
        title="Start this pickup?"
        message="This will mark the pickup as In Progress. The user will be notified."
        confirmText="Yes, start it"
      />

      {/* Complete modal */}
      <CompleteModal
        pickup={completing ? norm(completing) : null}
        open={!!completing}
        onClose={() => setCompleting(null)}
      />
    </div>
  );
}