import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2
        text-ink-400 pointer-events-none" />
      <input type="search" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-3 rounded-xl border border-ink-200 bg-white
          text-sm focus:border-eco-500 focus:ring-2 focus:ring-eco-100
          outline-none transition" />
    </div>
  );
}