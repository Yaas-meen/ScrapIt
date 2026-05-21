import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-lg',
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-900/40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative w-full ${width} bg-white shadow-xl
          flex flex-col h-full`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5
          border-b border-ink-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-ink-800">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="p-1.5 rounded-lg hover:bg-ink-100
              text-ink-400 -mt-0.5 -mr-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-ink-100 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}