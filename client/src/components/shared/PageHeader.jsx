export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-800">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 flex-wrap">{action}</div>}
    </div>
  );
}