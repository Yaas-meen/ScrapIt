import { generateBadgeColor, getInitials } from '../../utils/generateBadgerColor';

export default function Avatar({ name = '', src, size = 'md', className: extraClass = '' }) {
  const SIZE = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const badge   = generateBadgeColor(name);
  const bgClass = typeof badge === 'object' ? badge.className : 'bg-ink-100 text-ink-700';
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${SIZE[size] ?? SIZE.md} rounded-full object-cover flex-shrink-0 ${extraClass}`}
      />
    );
  }

  return (
    <div
      className={`
        ${SIZE[size] ?? SIZE.md}
        ${bgClass}
        rounded-full flex items-center justify-center
        font-semibold flex-shrink-0 select-none ${extraClass}
      `}
    >
      {initials}
    </div>
  );
}