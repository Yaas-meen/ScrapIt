import { useState }    from 'react';
import { usePickupStore } from '../../store/usePickupStore';
import { mockCollectors } from '../../mock/mockCollectors';
import StatusBadge from '../../components/ui/StatusBadge';
import Button      from '../../components/ui/Button';
import Lightbox    from '../../components/ui/Lightbox';
import { formatDate, formatDateTime } from '../../utils/formatDate';

export default function AdminPickupDetail({ pickup, onClose }) {
  const approvePickup  = usePickupStore((s) => s.approvePickup);
  const rejectPickup   = usePickupStore((s) => s.rejectPickup);
  const assignCollector = usePickupStore((s) => s.assignCollector);

  const [rejReason,    setRejReason]    = useState('');
  const [showReject,   setShowReject]   = useState(false);
  const [selectedCol,  setSelectedCol]  = useState('');
  const [lightbox,     setLightbox]     = useState(null);
  const [busy,         setBusy]         = useState(false);

  if (!pickup) return null;

  const id       = pickup._id || pickup.id;
  const items    = pickup.wasteItems ||
    (pickup.wasteType ? [{ type: pickup.wasteType, weight: pickup.weight }] : []);
  const weight   = pickup.totalWeight || pickup.weight || 0;
  const points   = pickup.totalPoints || pickup.estimatedPoints || 0;
  const imgUrl   = pickup.imageUrl || pickup.imageUrls?.[0] || null;
  const userName = pickup.user?.fullName || pickup.userName || '—';
  const userPhone = pickup.user?.phone || pickup.userPhone || '—';

  const handle = async (fn) => {
    setBusy(true);
    try { await fn(); onClose?.(); }
    catch (err) { alert(err?.message || 'Action failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-ink-800">{userName}</p>
          <p className="text-sm text-ink-500">{userPhone}</p>
        </div>
        <StatusBadge status={pickup.status} size="md" />
      </div>

      {/* Waste items */}
      <div className="rounded-xl border border-ink-200 overflow-hidden">
        <div className="bg-ink-50 px-4 py-2 text-xs font-semibold
          text-ink-500 uppercase tracking-wide">
          Waste items
        </div>
        {items.map((it, i) => (
          <div key={i}
            className="flex justify-between px-4 py-3 border-t
              border-ink-100 text-sm">
            <span className="capitalize">{it.type} — {it.weight} kg</span>
            {it.pointsEarned != null && (
              <span className="text-gold-600 font-medium">
                +{it.pointsEarned} pts
              </span>
            )}
          </div>
        ))}
        <div className="flex justify-between px-4 py-3 border-t
          border-ink-200 bg-gold-50 font-bold text-sm">
          <span>Total</span>
          <span>{weight} kg · {points} pts</span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm">
        {[
          { label: 'Date',    val: formatDate(pickup.pickupDate || pickup.scheduledFor) },
          { label: 'Address', val: pickup.address },
        ].map(({ label, val }) => val && (
          <div key={label} className="flex gap-3">
            <span className="text-ink-500 w-20 shrink-0">{label}</span>
            <span className="text-ink-800">{val}</span>
          </div>
        ))}
      </div>

      {/* Image */}
      {imgUrl && (
        <img
          src={imgUrl}
          alt="Waste"
          onClick={() => setLightbox(imgUrl)}
          className="w-full h-40 object-cover rounded-xl border
            border-ink-200 cursor-zoom-in"
        />
      )}

      {/* Rejection reason shown if already rejected */}
      {pickup.status === 'Rejected' && pickup.rejectionReason && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm
          text-red-700">
          <p className="font-semibold text-xs uppercase tracking-wide mb-1">
            Rejection reason
          </p>
          {pickup.rejectionReason}
        </div>
      )}

      {/* Actions — Pending */}
      {pickup.status === 'Pending' && (
        <div className="space-y-3">
          {/* Assign & approve */}
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">
              Assign collector (optional)
            </label>
            <select
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
              className="w-full h-11 rounded-xl border border-ink-200 px-3
                text-sm bg-white focus:border-eco-500 focus:ring-2
                focus:ring-eco-100 outline-none"
            >
              <option value="">No collector yet</option>
              {mockCollectors.filter((c) => c.isActive).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Button
            className="w-full"
            loading={busy}
            onClick={() =>
              handle(() => approvePickup(id, selectedCol ? { collectorId: selectedCol } : {}))
            }
          >
            Approve pickup
          </Button>

          {/* Reject */}
          {!showReject ? (
            <Button variant="danger" className="w-full"
              onClick={() => setShowReject(true)}>
              Reject
            </Button>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={2}
                value={rejReason}
                onChange={(e) => setRejReason(e.target.value)}
                placeholder="Reason for rejection…"
                className="w-full rounded-xl border border-ink-200 px-3
                  py-2.5 text-sm focus:border-red-400 focus:ring-2
                  focus:ring-red-100 outline-none resize-none"
              />
              <Button variant="danger" className="w-full"
                disabled={!rejReason.trim()} loading={busy}
                onClick={() => handle(() => rejectPickup(id, rejReason))}>
                Confirm rejection
              </Button>
              <Button variant="secondary" className="w-full"
                onClick={() => setShowReject(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Assign collector to Approved pickup */}
      {pickup.status === 'Approved' && !pickup.assignedCollector && (
        <div className="space-y-3">
          <select
            value={selectedCol}
            onChange={(e) => setSelectedCol(e.target.value)}
            className="w-full h-11 rounded-xl border border-ink-200 px-3
              text-sm bg-white focus:border-eco-500 focus:ring-2
              focus:ring-eco-100 outline-none"
          >
            <option value="">Choose collector</option>
            {mockCollectors.filter((c) => c.isActive).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button className="w-full" disabled={!selectedCol} loading={busy}
            onClick={() => handle(() => assignCollector(id, selectedCol))}>
            Assign collector
          </Button>
        </div>
      )}

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}