import { NavLink } from 'react-router-dom';

export default function BottomNav({ tabs = [] }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-white border-t
      border-ink-100 grid z-20 lg:hidden"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map(({ to, label, icon: Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            'flex flex-col items-center justify-center gap-0.5 ' +
            'text-[10px] font-semibold transition relative min-h-[44px] ' +
            (isActive ? 'text-eco-600' : 'text-ink-400 hover:text-ink-600')
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4
                    rounded-full bg-eco-600 text-white text-[9px]
                    font-bold grid place-items-center leading-none">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}