import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  {
    label,
    hint,
    error,
    rows = 3,
    className = '',
    id,
    ...props
  },
  ref
) {
  const baseCls =
    'w-full rounded-xl border bg-white px-3 py-2.5 text-sm ' +
    'outline-none transition resize-none ' +
    'disabled:opacity-50 disabled:cursor-not-allowed ' +
    (error
      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 '
      : 'border-ink-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-100 ') +
    className;

  if (!label && !hint && !error) {
    return <textarea ref={ref} id={id} rows={rows} className={baseCls} {...props} />;
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-baseline justify-between mb-1.5">
          <label htmlFor={id} className="text-sm font-medium text-ink-800">
            {label}
          </label>
          {hint && <span className="text-xs text-ink-400">{hint}</span>}
        </div>
      )}
      <textarea ref={ref} id={id} rows={rows} className={baseCls} {...props} />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
});

export default Textarea;