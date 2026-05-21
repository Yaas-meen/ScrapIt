const ACC = {
  eco:'bg-eco-50 text-eco-600', blue:'bg-blue-50 text-blue-600',
  orange:'bg-orange-50 text-orange-600', red:'bg-red-50 text-red-600',
  purple:'bg-purple-50 text-purple-600', gold:'bg-gold-50 text-gold-600',
  gray:'bg-ink-50 text-ink-500',
};

export default function StatCard({ label, value, icon: Icon, accent = 'gray' }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-4 flex items-center gap-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0
          ${ACC[accent] || ACC.gray}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[11px] font-medium text-ink-500 uppercase tracking-wide truncate">
          {label}
        </div>
        <div className="text-2xl font-bold text-ink-800 tabular-nums leading-tight">
          {value}
        </div>
      </div>
    </div>
  );
}