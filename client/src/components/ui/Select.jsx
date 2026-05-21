import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    label,
    hint,
    error,
    options = [],
    placeholder = 'Select an option',
    className   = '',
    id,
    ...props
  },
  ref
) {
  const selectCls =
    'w-full h-11 rounded-xl border bg-white pl-3 pr-9 text-sm ' +
    'outline-none transition appearance-none cursor-pointer ' +
    'disabled:opacity-50 disabled:cursor-not-allowed ' +
    (error
      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 '
      : 'border-ink-200 focus:border-eco-500 focus:ring-2 focus:ring-eco-100 ') +
    className;

  const selectEl = (
    <div className="relative">
      <select ref={ref} id={id} className={selectCls} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value ?? opt}
            value={opt.value ?? opt}
            disabled={opt.disabled}
          >
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2
          text-ink-400 pointer-events-none"
      />
    </div>
  );

  if (!label && !hint && !error) return selectEl;

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
      {selectEl}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Select;