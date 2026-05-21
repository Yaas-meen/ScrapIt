import { useEffect } from 'react';
import {
  CheckCircle2, AlertCircle,
  Info, AlertTriangle, X,
} from 'lucide-react';

const ICONS = {
  success: { icon: CheckCircle2, cls: 'text-eco-600 bg-eco-50'   },
  error:   { icon: AlertCircle,  cls: 'text-red-600 bg-red-50'   },
  info:    { icon: Info,         cls: 'text-blue-600 bg-blue-50' },
  warning: { icon: AlertTriangle,cls: 'text-gold-600 bg-gold-50' },
};

export function Toast({
  id,
  type    = 'info',
  message,
  title,
  duration = 4000,
  onDismiss,
}) {
  const cfg = ICONS[type] || ICONS.info;

  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => onDismiss?.(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onDismiss]);

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl border
      border-ink-100 shadow-soft-lg flex items-start gap-3 p-4">
      <div className={`w-8 h-8 rounded-xl grid place-items-center
        shrink-0 ${cfg.cls}`}>
        <cfg.icon size={16} />
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-ink-800">{title}</p>
        )}
        <p className={`text-sm text-ink-600 ${title ? 'mt-0.5' : ''}`}>
          {message}
        </p>
      </div>

      <button
        onClick={() => onDismiss?.(id)}
        aria-label="Dismiss"
        className="p-1 rounded-lg hover:bg-ink-100 text-ink-400 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts = [], onDismiss }) {
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50
      flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default Toast;