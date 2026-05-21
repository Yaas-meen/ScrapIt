import { Plus, Trash2 } from 'lucide-react';
import { WASTE_TYPES }  from '../../constants/wasteTypes';
import { calculatePoints } from '../../utils/calculatePoints';

export default function WasteItemFields({ items, onChange }) {
  const add = () =>
    onChange([...items, { type: '', weight: '' }]);

  const remove = (i) =>
    onChange(items.filter((_, idx) => idx !== i));

  const update = (i, field, value) =>
    onChange(items.map((item, idx) =>
      idx === i ? { ...item, [field]: value } : item
    ));

  const totalPts = items.reduce((sum, it) => {
    if (!it.type || !it.weight) return sum;
    return sum + calculatePoints(it.type, Number(it.weight));
  }, 0);

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 items-start">
          {/* Type */}
          <div className="flex-1">
            {i === 0 && (
              <label className="block text-xs font-medium text-ink-600 mb-1">
                Waste type
              </label>
            )}
            <select
              value={item.type}
              onChange={(e) => update(i, 'type', e.target.value)}
              className="w-full h-11 rounded-xl border border-ink-200 px-3
                text-sm bg-white focus:border-eco-500 focus:ring-2
                focus:ring-eco-100 outline-none"
            >
              <option value="">Select type</option>
              {WASTE_TYPES.map((w) => (
                <option key={w.key} value={w.key}>
                  {w.icon} {w.type} — {w.rate} pts/kg
                </option>
              ))}
            </select>
          </div>

          {/* Weight */}
          <div className="w-28">
            {i === 0 && (
              <label className="block text-xs font-medium text-ink-600 mb-1">
                Weight (kg)
              </label>
            )}
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={item.weight}
              onChange={(e) => update(i, 'weight', e.target.value)}
              placeholder="0.0"
              className="w-full h-11 rounded-xl border border-ink-200 px-3
                text-sm focus:border-eco-500 focus:ring-2
                focus:ring-eco-100 outline-none"
            />
          </div>

          {/* Remove */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className={`p-2.5 rounded-xl border border-red-200
                text-red-600 hover:bg-red-50 ${i === 0 ? 'mt-5' : ''}`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-sm font-medium
          text-eco-700 hover:text-eco-800"
      >
        <Plus size={16} />
        Add another item
      </button>

      {/* Live points summary */}
      {totalPts > 0 && (
        <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
          <p className="text-xs font-semibold text-gold-700 uppercase
            tracking-wide mb-2">
            Estimated reward
          </p>
          {items
            .filter((it) => it.type && it.weight)
            .map((it, i) => {
              const pts = calculatePoints(it.type, Number(it.weight));
              return (
                <div key={i}
                  className="flex justify-between text-sm text-ink-700 mb-1">
                  <span className="capitalize">
                    {it.type} — {it.weight} kg
                  </span>
                  <span className="font-medium text-gold-700">{pts} pts</span>
                </div>
              );
            })}
          <div className="border-t border-gold-200 mt-2 pt-2 flex
            justify-between font-bold text-ink-800">
            <span>Total</span>
            <span className="text-gold-700">{totalPts} pts</span>
          </div>
        </div>
      )}
    </div>
  );
}