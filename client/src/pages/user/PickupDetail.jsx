import { MapPin, Calendar, Weight, User, Package } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import Lightbox    from '../../components/ui/Lightbox';
import { useState } from 'react';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { STATUS_TIMELINE }            from '../../constants/statusList';

function TimelineRow({ status, entry, isActive, isDone, isRejected }) {
  return (
    <div className="flex gap-3 items-start">
      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0
        flex items-center justify-center text-[10px] font-bold
        ${isDone
          ? 'bg-eco-600 border-eco-600 text-white'
          : isRejected && status === 'Rejected'
            ? 'bg-red-600 border-red-600 text-white'
            : 'bg-white border-ink-300 text-ink-400'}`}>
        {isDone ? '✓' : isRejected && status === 'Rejected' ? '✕' : ''}
      </div>
      <div>
        <p className={`text-sm font-medium
          ${isActive ? 'text-eco-700' : isDone ? 'text-ink-700' : 'text-ink-400'}`}>
          {status}
        </p>
        {entry?.at && (
          <p className="text-xs text-ink-400 mt-0.5">
            {formatDateTime(entry.at)}
            {entry.by ? ` · ${entry.by}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PickupDetail({ pickup }) {
  const [lightbox, setLightbox] = useState(null);

  if (!pickup) return null;

  const id       = pickup._id || pickup.id;
  const date     = pickup.pickupDate || pickup.scheduledFor;
  const weight   = pickup.totalWeight || pickup.weight || 0;
  const points   = pickup.totalPoints || pickup.estimatedPoints || 0;
  const items    = pickup.wasteItems ||
    (pickup.wasteType ? [{ type: pickup.wasteType, weight: pickup.weight }] : []);
  const timeline = pickup.statusLog || pickup.timeline || [];
  const imgUrl   = pickup.imageUrl || pickup.imageUrls?.[0] || null;
  const collector = pickup.assignedCollector?.fullName || null;
  const isRejected = pickup.status === 'Rejected';
  const currentIdx = STATUS_TIMELINE.indexOf(pickup.status);

  return (
    <div className="space-y-6">
      <StatusBadge status={pickup.status} size="md" />

      {/* Waste items */}
      <section>
        <h4 className="text-xs font-semibold text-ink-500 uppercase
          tracking-wide mb-3">
          Waste items
        </h4>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i}
              className="flex justify-between text-sm border-b
                border-ink-100 py-2 last:border-0">
              <span className="capitalize text-ink-700">{it.type}</span>
              <span className="text-ink-600">
                {it.weight} kg
                {it.pointsEarned != null && (
                  <span className="ml-2 text-gold-600 font-medium">
                    +{it.pointsEarned} pts
                  </span>
                )}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold pt-1">
            <span>Total</span>
            <span>
              {weight} kg
              {pickup.status === 'Completed' && (
                <span className="ml-2 text-gold-600">+{points} pts</span>
              )}
            </span>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="space-y-2 text-sm">
        {[
          { icon: Calendar, label: 'Date',      val: formatDate(date)   },
          { icon: MapPin,    label: 'Address',   val: pickup.address     },
          { icon: User,      label: 'Collector', val: collector          },
        ].filter((r) => r.val).map(({ icon: Icon, label, val }) => (
          <div key={label} className="flex gap-3">
            <span className="flex items-center gap-1 text-ink-500 w-24 shrink-0">
              <Icon size={12} />
              {label}
            </span>
            <span className="text-ink-800">{val}</span>
          </div>
        ))}
      </section>

      {/* Image */}
      {imgUrl && (
        <section>
          <h4 className="text-xs font-semibold text-ink-500 uppercase
            tracking-wide mb-2">
            Photo
          </h4>
          <img
            src={imgUrl}
            alt="Waste"
            onClick={() => setLightbox(imgUrl)}
            className="w-full h-40 object-cover rounded-xl border
              border-ink-200 cursor-zoom-in"
          />
        </section>
      )}

      {/* Rejection reason */}
      {isRejected && pickup.rejectionReason && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-xs font-semibold text-red-700 uppercase
            tracking-wide mb-1">
            Rejection reason
          </p>
          <p className="text-sm text-red-700">{pickup.rejectionReason}</p>
        </div>
      )}

      {/* Timeline */}
      <section>
        <h4 className="text-xs font-semibold text-ink-500 uppercase
          tracking-wide mb-3">
          Status timeline
        </h4>
        <div className="space-y-3">
          {STATUS_TIMELINE.map((step, i) => {
            const entry = timeline.find((t) => t.status === step);
            return (
              <TimelineRow
                key={step}
                status={step}
                entry={entry}
                isActive={!isRejected && i === currentIdx}
                isDone={!isRejected && i <= currentIdx}
                isRejected={isRejected}
              />
            );
          })}
          {isRejected && (
            <TimelineRow
              status="Rejected"
              entry={timeline.find((t) => t.status === 'Rejected')}
              isDone={false}
              isActive={false}
              isRejected
            />
          )}
        </div>
      </section>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}