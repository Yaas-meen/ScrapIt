export default function StatsChartCard({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-ink-100 shadow-sm p-5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-ink-800">{title}</h3>
          {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
