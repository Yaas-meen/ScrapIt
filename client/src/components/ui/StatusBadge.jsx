import { STATUS_COLORS } from '../../constants/statusList';

const sizes = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS['Pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold
      rounded-full ${c.bg} ${c.text} ${sizes[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}