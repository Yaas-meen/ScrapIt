const COLS = {
  green:'bg-eco-100 text-eco-700', gray:'bg-ink-100 text-ink-600',
  blue:'bg-blue-100 text-blue-700', amber:'bg-gold-100 text-gold-700',
  red:'bg-red-100 text-red-700', purple:'bg-purple-100 text-purple-700',
  orange:'bg-orange-100 text-orange-700',
};

export default function Badge({ color = 'gray', children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
      text-xs font-semibold ${COLS[color] || COLS.gray} ${className}`}>
      {children}
    </span>
  );
}