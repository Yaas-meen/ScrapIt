import { NavLink }    from 'react-router-dom';
import { LogOut, X }  from 'lucide-react';
import Logo from './Logo';

export default function Sidebar({
  navItems  = [],
  onLogout,
  onClose,
  accentColor = 'eco',
  role        = 'user',
}) {
  const active = {
    eco:    'bg-eco-50 text-eco-700',
    purple: 'bg-purple-50 text-purple-700',
    gold:   'bg-gold-50 text-gold-700',
  }[accentColor] || 'bg-eco-50 text-eco-700';

  return (
    <div className="flex flex-col h-full bg-white w-64 border-r
      border-ink-100 p-4">
      <div className="flex items-center justify-between mb-8">
        <Logo size="md" />
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-ink-100
              text-ink-400"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              'flex items-center gap-3 px-3 h-10 rounded-xl text-sm ' +
              'font-medium transition ' +
              (isActive
                ? active
                : 'text-ink-500 hover:bg-ink-50 hover:text-ink-700')
            }
          >
            {Icon && <Icon size={16} />}
            <span className="flex-1">{label}</span>
            {badge != null && badge > 0 && (
              <span className="text-[10px] font-bold bg-eco-600 text-white
                w-5 h-5 rounded-full grid place-items-center">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-100 pt-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 h-10 rounded-xl
            text-sm font-medium text-ink-500 hover:bg-red-50
            hover:text-red-600 transition w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}