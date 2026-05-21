export default function SectionHeader({
  title,
  subtitle,
  action,
  className = '',
}) {
  return (
    <div className={`flex items-start justify-between gap-4
      flex-wrap ${className}`}>
      <div>
        <h2 className="text-lg font-semibold text-ink-800">{title}</h2>
        {subtitle && (
          <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2 shrink-0">{action}</div>
      )}
    </div>
  );
}