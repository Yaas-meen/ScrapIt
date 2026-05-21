import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Dropdown({
  trigger,
  items = [],
  align = 'left',
  width = 'w-48',
}) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alignCls = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-sm font-medium
          text-ink-700 hover:text-ink-900"
      >
        {trigger}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className={`absolute z-50 mt-1.5 ${alignCls} ${width}
          bg-white rounded-xl border border-ink-100 shadow-soft-lg
          overflow-hidden`}>
          {items.map((item, i) => {
            if (item.divider) {
              return <hr key={i} className="border-ink-100 my-1" />;
            }
            return (
              <button
                key={i}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-3 h-9
                  text-sm text-left transition
                  ${item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-ink-700 hover:bg-ink-50'
                  }
                  disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {item.icon && <item.icon size={14} />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}