const variants = {
  default: 'bg-white border border-ink-100 shadow-sm',
  flat:    'bg-white border border-ink-100',
  ghost:   'bg-ink-50 border border-ink-100',
  accent:  'bg-eco-50 border border-eco-200',
};

export default function Card({
  children,
  variant   = 'default',
  padding   = 'p-5',
  className = '',
  onClick,
}) {
  const Tag       = onClick ? 'button' : 'div';
  const clickable = onClick
    ? 'cursor-pointer hover:shadow-md hover:border-eco-200 transition-shadow'
    : '';

  return (
    <Tag
      onClick={onClick}
      className={`rounded-2xl ${variants[variant]} ${padding}
        ${clickable} ${className}`}
    >
      {children}
    </Tag>
  );
}