import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  Truck,
  Gift,
  Bell,
  UserCircle2,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/schedule',   label: 'Schedule',   icon: CalendarPlus },
  { to: '/pickups',    label: 'My Pickups', icon: Truck },
  { to: '/rewards',    label: 'Rewards',    icon: Gift },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile',    label: 'Profile',    icon: UserCircle2 },
];

// Bottom nav shows a compact subset to keep mobile chrome breathable.
const BOTTOM_NAV = NAV.filter((n) =>
  ['/dashboard', '/schedule', '/pickups', '/rewards', '/profile'].includes(n.to),
);

export default function UserLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout?.();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-800">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-ink-100">
        <button
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-lg hover:bg-ink-100"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={20} />
        </button>
        <Link to="/dashboard" className="font-extrabold tracking-tight text-base">
          ScrapIt
        </Link>
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="p-2 -mr-2 rounded-lg hover:bg-ink-100"
        >
          <Bell size={18} />
        </Link>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:flex-col w-64 shrink-0 min-h-screen bg-white border-r border-ink-100 sticky top-0">
          <div className="h-16 flex items-center px-6 border-b border-ink-100">
            <Link to="/dashboard" className="font-extrabold text-lg tracking-tight">
              ScrapIt
            </Link>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <SidebarLink key={to} to={to} label={label} Icon={Icon} />
            ))}
          </nav>
          <div className="p-3 border-t border-ink-100">
            <UserCard user={user} onLogout={handleLogout} />
          </div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <button
              aria-label="Close menu backdrop"
              className="absolute inset-0 bg-ink-900/40"
              onClick={() => setDrawerOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
              <div className="h-14 flex items-center justify-between px-4 border-b border-ink-100">
                <span className="font-extrabold text-base tracking-tight">ScrapIt</span>
                <button
                  aria-label="Close menu"
                  className="p-2 -mr-2 rounded-lg hover:bg-ink-100"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1" onClick={() => setDrawerOpen(false)}>
                {NAV.map(({ to, label, icon: Icon }) => (
                  <SidebarLink key={to} to={to} label={label} Icon={Icon} />
                ))}
              </nav>
              <div className="p-3 border-t border-ink-100">
                <UserCard user={user} onLogout={handleLogout} />
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Primary"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-ink-100"
      >
        <ul className="grid grid-cols-5">
          {BOTTOM_NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${
                    isActive ? 'text-eco-700' : 'text-ink-500'
                  }`
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function SidebarLink({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
          isActive
            ? 'bg-eco-50 text-eco-700'
            : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800'
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function UserCard({ user, onLogout }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl">
      <div className="w-9 h-9 rounded-full bg-eco-100 text-eco-700 grid place-items-center font-semibold text-sm">
        {(user?.name || 'U').slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{user?.name || 'Guest'}</div>
        <div className="text-xs text-ink-500 truncate">{user?.email || '—'}</div>
      </div>
      <button
        onClick={onLogout}
        aria-label="Log out"
        className="p-2 rounded-lg hover:bg-ink-100 text-ink-500"
        title="Log out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}