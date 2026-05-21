export default function Tabs({ tabs = [], value, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 p-1 bg-ink-100 rounded-xl w-fit ${className}`}>
      {tabs.map((tab) => {
        const active = value === tab.value;
        return (
          <button key={tab.value} onClick={() => onChange(tab.value)}
            className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-lg
              text-xs font-semibold transition
              ${active ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}>
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 rounded-full
                ${active ? 'bg-eco-100 text-eco-700' : 'bg-ink-200 text-ink-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}