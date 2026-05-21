import { useState }         from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarPlus, Package,
  Gift, Bell, UserCircle2,
  Menu, X, Recycle, LogOut,
} from 'lucide-react';
import { useAuthStore }         from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';

const NAV = [
  { to: '/dashboard',     label: 'Dashboard', icon: LayoutDashboard },
  { to: '/schedule',      label: 'Schedule',  icon: CalendarPlus    },
  { to: '/pickups',       label: 'Pickups',   icon: Package         },
  { to: '/rewards',       label: 'Rewards',   icon: Gift            },
  { to: '/notifications', label: 'Alerts',    icon: Bell            },
];

const BOTTOM = [
  { to: '/dashboard',     label: 'Home',      icon: LayoutDashboard },
  { to: '/schedule',      label: 'Schedule',  icon: CalendarPlus    },
  { to: '/pickups',       label: 'Pickups',   icon: Package         },
  { to: '/rewards',       label: 'Rewards',   icon: Gift            },
  { to: '/profile',       label: 'Profile',   icon: UserCircle2     },
];

export default function UserLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user       = useAuthStore((s) => s.user);
  const logout     = useAuthStore((s) => s.logout);
  const unread     = useNotificationStore((s) => s.meta.unreadCount);
  const navigate   = useNavigate();

  const name = user?.fullName || user?.name || '';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r
        border-ink-100 shrink-0 p-4">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-eco-100 text-eco-700
            grid place-items-center">
            <Recycle size={18} />
          </div>
          <span className="font-bold text-ink-800">ScrapIt</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                'flex items-center gap-3 px-3 h-10 rounded-xl text-sm ' +
                'font-medium transition relative ' +
                (isActive
                  ? 'bg-eco-50 text-eco-700'
                  : 'text-ink-500 hover:bg-ink-100 hover:text-ink-700')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} />
                  {label}
                  {to === '/notifications' && unread > 0 && (
                    <span className="ml-auto bg-eco-600 text-white text-[10px]
                      font-bold w-5 h-5 rounded-full grid place-items-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile + logout */}
        <div className="border-t border-ink-100 pt-4 space-y-1">
          <NavLink to="/profile"
            className={({ isActive }) =>
              'flex items-center gap-3 px-3 h-10 rounded-xl text-sm ' +
              'font-medium transition ' +
              (isActive
                ? 'bg-eco-50 text-eco-700'
                : 'text-ink-500 hover:bg-ink-100 hover:text-ink-700')
            }
          >
            <UserCircle2 size={16} />
            Profile
          </NavLink>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 h-10 rounded-xl
              text-sm font-medium text-ink-500 hover:bg-red-50
              hover:text-red-600 transition w-full">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white
        border-r border-ink-100 flex flex-col p-4 lg:hidden
        transition-transform duration-300
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="flex items-center gap-2"
            onClick={() => setDrawerOpen(false)}>
            <div className="w-8 h-8 rounded-xl bg-eco-100 text-eco-700
              grid place-items-center">
              <Recycle size={18} />
            </div>
            <span className="font-bold text-ink-800">ScrapIt</span>
          </Link>
          <button onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-400">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {[...NAV, { to: '/profile', label: 'Profile', icon: UserCircle2 }]
            .map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  'flex items-center gap-3 px-3 h-11 rounded-xl text-sm ' +
                  'font-medium transition ' +
                  (isActive
                    ? 'bg-eco-50 text-eco-700'
                    : 'text-ink-500 hover:bg-ink-100 hover:text-ink-700')
                }
              >
                <Icon size={16} />{label}
              </NavLink>
            ))
          }
        </nav>

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 h-10 rounded-xl
            text-sm font-medium text-red-600 hover:bg-red-50
            transition w-full mt-4">
          <LogOut size={16} />
          Sign out
        </button>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile header */}
        <header className="lg:hidden h-14 bg-white border-b border-ink-100
          flex items-center justify-between px-4 shrink-0">
          <button onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-xl hover:bg-ink-100 text-ink-600">
            <Menu size={20} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Recycle size={16} className="text-eco-600" />
            <span className="font-bold text-sm text-ink-800">ScrapIt</span>
          </Link>
          <NavLink to="/notifications"
            className="relative p-2 rounded-xl hover:bg-ink-100 text-ink-600">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full
                bg-eco-600 text-white text-[9px] font-bold
                grid place-items-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6
          pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* Bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-white
          border-t border-ink-100 grid grid-cols-5 z-20">
          {BOTTOM.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                'flex flex-col items-center justify-center gap-0.5 ' +
                'text-[10px] font-semibold transition min-h-[44px] ' +
                (isActive
                  ? 'text-eco-600'
                  : 'text-ink-400 hover:text-ink-600')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
