import { useState }         from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Users,
  HardHat, BarChart2, Menu, X,
  LogOut, ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const NAV = [
  { to: '/admin/dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/admin/pickup-requests', label: 'Pickup Requests', icon: ClipboardList   },
  { to: '/admin/users',           label: 'Users',           icon: Users           },
  { to: '/admin/collectors',      label: 'Collectors',      icon: HardHat         },
  { to: '/admin/analytics',       label: 'Analytics',       icon: BarChart2       },
];

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        'flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition ' +
        (isActive
          ? 'bg-purple-600 text-white'
          : 'text-purple-200 hover:bg-purple-700/50 hover:text-white')
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

function Sidebar({ onClose }) {
  const logout   = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex flex-col h-full bg-purple-900 w-64 p-4">
      {/* Brand */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600
            grid place-items-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">ScrapIt Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-purple-300
              hover:text-white hover:bg-purple-700">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 h-10 rounded-xl text-sm
          font-medium text-purple-300 hover:bg-purple-700/50
          hover:text-white transition w-full mt-4"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 lg:hidden
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="lg:hidden h-14 bg-white border-b border-ink-100
          flex items-center justify-between px-4 shrink-0">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-xl hover:bg-ink-100 text-ink-600"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-purple-600" />
            <span className="font-bold text-sm text-ink-800">ScrapIt Admin</span>
          </div>
          <div className="w-9" /> {/* spacer */}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}