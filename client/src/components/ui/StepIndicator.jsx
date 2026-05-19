import { Check } from 'lucide-react';

export default function StepIndicator({ steps = [], current = 0 }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                text-xs font-semibold transition-colors
                ${done
                  ? 'bg-eco-600 text-white'
                  : active
                    ? 'bg-eco-600 text-white ring-4 ring-eco-100'
                    : 'bg-ink-100 text-ink-400'}`}>
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span className={`mt-1.5 text-[10px] font-medium whitespace-nowrap
                ${active ? 'text-eco-700' : done ? 'text-ink-600' : 'text-ink-400'}`}>
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 rounded
                ${i < current ? 'bg-eco-500' : 'bg-ink-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}