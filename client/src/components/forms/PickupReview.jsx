import { calculatePoints } from '../../utils/calculatePoints';
import { formatDate }      from '../../utils/formatDate';

export default function PickupReview({
  wasteItems  = [],
  pickupDate,
  address,
  imagePreview,
}) {
  const validItems = wasteItems.filter((it) => it.type && Number(it.weight) > 0);
  const total      = validItems.reduce(
    (sum, it) => sum + calculatePoints(it.type, Number(it.weight)),
    0
  );

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-ink-800">Review your request</h3>

      {/* Waste items */}
      <div className="rounded-xl border border-ink-200 overflow-hidden">
        <div className="bg-ink-50 px-4 py-2 text-xs font-semibold
          text-ink-500 uppercase tracking-wide">
          Waste items
        </div>
        {validItems.map((it, i) => (
          <div key={i}
            className="flex justify-between items-center px-4 py-3
              border-t border-ink-100 text-sm">
            <span className="capitalize text-ink-700">
              {it.type} — {it.weight} kg
            </span>
            <span className="font-medium text-gold-700">
              {calculatePoints(it.type, Number(it.weight))} pts
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center px-4 py-3
          border-t border-ink-200 bg-gold-50 text-sm font-bold">
          <span className="text-ink-800">Total estimate</span>
          <span className="text-gold-700">{total} pts</span>
        </div>
      </div>

      {/* Pickup info */}
      <div className="space-y-3 text-sm">
        <Row label="Date">
          {pickupDate
            ? new Date(pickupDate).toLocaleDateString('en-NG', {
                weekday: 'long', day: 'numeric',
                month: 'long', year: 'numeric',
              })
            : '—'}
        </Row>
        <Row label="Address">{address || '—'}</Row>
        {imagePreview && (
          <div className="flex gap-3 items-start">
            <span className="text-ink-500 w-20 shrink-0 mt-1">Image</span>
            <img
              src={imagePreview}
              alt="Waste preview"
              className="w-20 h-20 object-cover rounded-xl border
                border-ink-200"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex gap-3">
      <span className="text-ink-500 w-20 shrink-0">{label}</span>
      <span className="text-ink-800 font-medium">{children}</span>
    </div>
  );
}