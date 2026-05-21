import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500
        grid place-items-center mb-3">
        <AlertTriangle size={22} />
      </div>
      <p className="text-sm font-medium text-ink-700 mb-1">
        Failed to load
      </p>
      <p className="text-xs text-ink-400 max-w-xs mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-sm font-semibold
            text-eco-700 hover:text-eco-800 border border-eco-200
            hover:border-eco-300 bg-eco-50 px-4 h-9 rounded-xl transition"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}