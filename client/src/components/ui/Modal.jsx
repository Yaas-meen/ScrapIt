import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  const overlayRef = useRef(null);

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
    <div ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === overlayRef.current && onClose?.()}>
      <div className="absolute inset-0 bg-ink-900/50" />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-t-2xl
        sm:rounded-2xl shadow-xl flex flex-col max-h-[90dvh]`}>
        <div className="flex items-start justify-between p-5 border-b border-ink-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-ink-800">{title}</h2>
            {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close modal"
            className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-400 -mt-0.5 -mr-0.5">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="p-4 border-t border-ink-100 shrink-0 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}