import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    type       = 'text',
    size       = 'md',
    prefix,
    suffix,
    className  = '',
    id,
    ...props
  },
  ref
) {
  const sizes = {
    sm: 'h-9  text-xs px-2.5',
    md: 'h-11 text-sm px-3',
    lg: 'h-12 text-base px-4',
  };

  const baseInput =
    'w-full rounded-xl border bg-white outline-none transition ' +
    'focus:border-eco-500 focus:ring-2 focus:ring-eco-100 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed ' +
    (error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100 '
      : 'border-ink-200 ') +
    sizes[size] +
    (prefix ? ' pl-9 '  : ' ') +
    (suffix ? ' pr-9 '  : ' ') +
    className;

  const inputEl = (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2
          text-ink-400 pointer-events-none">
          {prefix}
        </span>
      )}

      <input
        ref={ref}
        id={id}
        type={type}
        className={baseInput}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        {...props}
      />

      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2
          text-ink-400">
          {suffix}
        </span>
      )}
    </div>
  );

  // If no label just return the raw input
  if (!label && !hint && !error) return inputEl;

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-baseline justify-between mb-1.5">
          <label
            htmlFor={id}
            className="text-sm font-medium text-ink-800"
          >
            {label}
          </label>
          {hint && (
            <span id={`${id}-hint`} className="text-xs text-ink-400">
              {hint}
            </span>
          )}
        </div>
      )}

      {inputEl}

      {error && (
        <p id={`${id}-error`}
          className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;