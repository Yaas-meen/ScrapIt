import { useState }    from 'react';
import { usePickupStore } from '../../store/usePickupStore';
import Button    from '../../components/ui/Button';
import Lightbox  from '../../components/ui/Lightbox';
import { formatDate } from '../../utils/formatDate';
import { MapPin, Calendar, Phone, Weight } from 'lucide-react';

export default function CollectorPickupDetail({ pickup, onClose }) {
  const startPickup    = usePickupStore((s) => s.startPickup);
  const completePickup = usePickupStore((s) => s.completePickup);

  const [weight,  setWeight]  = useState(String(pickup?.weight || ''));
  const [note,    setNote]    = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [busy,    setBusy]    = useState(false);
  const [done,    setDone]    = useState(false);

  if (!pickup) return null;

  const id      = pickup._id || pickup.id;
  const imgUrl  = pickup.imageUrl || pickup.imageUrls?.[0] || null;
  const items   = pickup.wasteItems ||
    (pickup.wasteType ? [{ type: pickup.wasteType, weight: pickup.weight }] : []);

  const handle = async (fn) => {
    setBusy(true);
    try {
      await fn();
      if (fn === 'complete') setDone(true);
      else onClose?.();
    } catch (err) {
      alert(err?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="w-14 h-14 rounded-full bg-eco-100 text-eco-700
          grid place-items-center mx-auto text-2xl">
          ✓
        </div>
        <p className="font-semibold text-ink-800">Pickup completed!</p>
        <Button className="w-full" onClick={onClose}>Done</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* User info */}
      <div className="flex flex-col gap-1.5 text-sm">
        {[
          { icon: MapPin,    label: pickup.address },
          { icon: Calendar,  label: formatDate(pickup.pickupDate || pickup.scheduledFor) },
          { icon: Phone,     label: pickup.user?.phone || pickup.userPhone },
        ].filter((r) => r.label).map(({ icon: Icon, label }, i) => (
          <div key={i} className="flex items-center gap-2 text-ink-600">
            <Icon size={14} className="shrink-0 text-ink-400" />
            {label}
          </div>
        ))}
      </div>

      {/* Waste items */}
      <div>
        <p className="text-xs font-semibold text-ink-500 uppercase
          tracking-wide mb-2">
          Waste items
        </p>
        <div className="flex flex-wrap gap-2">
          {items.map((it, i) => (
            <span key={i}
              className="text-xs font-medium bg-ink-100 text-ink-700
                px-2.5 py-1 rounded-full capitalize">
              {it.type} · {it.weight}kg
            </span>
          ))}
        </div>
      </div>

      {/* Image */}
      {imgUrl && (
        <img
          src={imgUrl}
          alt="Waste"
          onClick={() => setLightbox(imgUrl)}
          className="w-full h-36 object-cover rounded-xl border
            border-ink-200 cursor-zoom-in"
        />
      )}

      {/* Actions */}
      {pickup.status === 'Approved' && (
        <Button className="w-full" loading={busy}
          onClick={() => handle(() => startPickup(id).then(onClose))}>
          Start pickup
        </Button>
      )}

      {pickup.status === 'In Progress' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">
              Verified weight (kg)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full h-11 rounded-xl border border-ink-200 px-3
                text-sm focus:border-eco-500 focus:ring-2 focus:ring-eco-100
                outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">
              Notes <span className="text-ink-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any notes about this pickup…"
              className="w-full rounded-xl border border-ink-200 px-3 py-2.5
                text-sm focus:border-eco-500 focus:ring-2 focus:ring-eco-100
                outline-none resize-none"
            />
          </div>
          <Button className="w-full" loading={busy}
            onClick={() =>
              completePickup(id, {
                verifiedWeight:  Number(weight) || undefined,
                completionNote:  note.trim() || undefined,
              }).then(() => setDone(true))
            }>
            Mark as completed
          </Button>
        </div>
      )}

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
