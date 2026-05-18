import { getInitials } from '../../utils/generateBadgerColor';

const SIZE = { xs:'w-6 h-6 text-[10px]', sm:'w-8 h-8 text-xs', md:'w-10 h-10 text-sm', lg:'w-12 h-12 text-base' };
const COLS = [
  'bg-eco-100 text-eco-700', 'bg-blue-100 text-blue-700',
  'bg-gold-100 text-gold-700', 'bg-purple-100 text-purple-700',
  'bg-red-100 text-red-700',
];

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const col = COLS[name.charCodeAt(0) % COLS.length] || COLS[0];
  return (
    <div className={`rounded-full grid place-items-center font-semibold
      shrink-0 ${SIZE[size]} ${col} ${className}`} aria-hidden="true">
      {getInitials(name)}
    </div>
  );
}