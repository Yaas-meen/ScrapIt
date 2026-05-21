import { useState }         from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck,
  History, UserCircle2, LogOut, Recycle,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const TABS = [
  { to: '/collector/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/collector/assigned',  label: 'Assigned',  icon: ClipboardCheck  },
  { to: '/collector/history',   label: 'History',   icon: History         },
  { to: '/collector/profile',   label: 'Profile',   icon: UserCircle2     },
];

const AVAILABILITY = ['Available', 'Busy', 'Offline'];

const AVAIL_STYLES = {
  Available: 'bg-eco-100 text-eco-700   border-eco-200',
  Busy:      'bg-gold-100 text-gold-700  border-gold-200',
  Offline:   'bg-ink-100  text-ink-500   border-ink-200',
};

export default function CollectorLayout() {
  const user     = useAuthStore((s) => s.user);
  const logout   = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [avail, setAvail] = useState('Available');

  const cycleAvail = () =>
    setAvail((v) => AVAILABILITY[(AVAILABILITY.indexOf(v) + 1) % AVAILABILITY.length]);

  const handleLogout = async () => {
    await logout();
    navigate('/collector/login', { replace: true });
  };

  const name = user?.fullName || user?.name || 'Collector';

  return (
    <div className="flex flex-col h-screen bg-ink-50">

      {/* Top header */}
      <header className="h-14 bg-white border-b border-ink-100 flex
        items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-eco-100 text-eco-700
            grid place-items-center">
            <Recycle size={14} />
          </div>
          <span className="font-bold text-sm text-ink-800">ScrapIt</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Availability pill */}
          <button
            onClick={cycleAvail}
            className={`text-xs font-semibold px-3 h-7 rounded-full
              border transition ${AVAIL_STYLES[avail]}`}
          >
            {avail}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            className="p-2 rounded-xl hover:bg-ink-100 text-ink-500
              hover:text-ink-700"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 py-4 sm:px-6">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-white border-t
        border-ink-100 grid grid-cols-4 z-20">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'flex flex-col items-center justify-center gap-0.5 text-[10px] ' +
              'font-semibold transition min-h-[44px] ' +
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
  );
}
