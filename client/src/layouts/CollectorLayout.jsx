import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardCheck, History, UserCircle2, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const AVAILABILITY = [
  { value: 'available', label: 'Available', dot: 'bg-eco-500' },
  { value: 'busy',      label: 'Busy',      dot: 'bg-orange-500' },
  { value: 'offline',   label: 'Offline',   dot: 'bg-ink-400' },
];

const TABS = [
  { to: '/collector/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/collector/assigned',  label: 'Assigned',  icon: ClipboardCheck },
  { to: '/collector/history',   label: 'History',   icon: History },
  { to: '/collector/profile',   label: 'Profile',   icon: UserCircle2 },
];

export default function CollectorLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAvailability = useAuthStore((s) => s.setAvailability);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout?.();
    navigate('/collector/login', { replace: true });
  };

  const current = user?.availability || 'available';

  return (
    <div className="min-h-screen bg-ink-50 text-ink-800 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-ink-100">
        <div className="h-16 px-4 sm:px-6 max-w-3xl mx-auto w-full flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-50 text-gold-700 grid place-items-center font-semibold text-sm shrink-0">
            {(user?.name || 'C').slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{user?.name || 'Collector'}</div>
            <div className="text-xs text-ink-500 truncate">
              {user?.zone ? `Zone · ${user.zone}` : 'ScrapIt Collector'}
            </div>
          </div>
          <AvailabilityToggle value={current} onChange={setAvailability} />
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="p-2 rounded-lg hover:bg-ink-100 text-ink-500"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 min-w-0 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <Outlet />
        </div>
      </main>

      {/* Bottom tab bar */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-ink-100"
      >
        <ul className="grid grid-cols-4 max-w-3xl mx-auto">
          {TABS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${
                    isActive ? 'text-gold-700' : 'text-ink-500'
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

function AvailabilityToggle({ value, onChange }) {
  const current = AVAILABILITY.find((o) => o.value === value) || AVAILABILITY[0];
  const cycle = () => {
    const idx = AVAILABILITY.findIndex((o) => o.value === current.value);
    const next = AVAILABILITY[(idx + 1) % AVAILABILITY.length];
    onChange?.(next.value);
  };
  return (
    <button
      type="button"
      onClick={cycle}
      title="Toggle availability"
      className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-ink-50 border border-ink-200 text-xs font-semibold text-ink-700 hover:bg-white transition"
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      {current.label}
    </button>
  );
}