import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Truck,
  BarChart3,
  Menu,
  X,
  Search,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const NAV = [
  { to: '/admin/dashboard',        label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/admin/pickup-requests',  label: 'Pickup Requests',  icon: ClipboardList },
  { to: '/admin/users',            label: 'Users',            icon: Users },
  { to: '/admin/collectors',       label: 'Collectors',       icon: Truck },
  { to: '/admin/analytics',        label: 'Analytics',        icon: BarChart3 },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout?.();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-800 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 min-h-screen bg-white border-r border-ink-100 sticky top-0">
        <SidebarHeader />
        <SidebarNav />
        <div className="p-3 border-t border-ink-100">
          <AdminChip user={user} onLogout={handleLogout} />
        </div>
      </aside>

      {/* Drawer for < lg */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <button
            aria-label="Close menu backdrop"
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
            <SidebarHeader onClose={() => setDrawerOpen(false)} />
            <div onClick={() => setDrawerOpen(false)}>
              <SidebarNav />
            </div>
            <div className="p-3 border-t border-ink-100">
              <AdminChip user={user} onLogout={handleLogout} />
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top utility bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-ink-100">
          <div className="h-16 px-4 sm:px-6 flex items-center gap-3">
            <button
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-ink-100"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  type="search"
                  placeholder="Search pickups, users, collectors…"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-ink-200 bg-ink-50 text-sm focus:bg-white focus:border-eco-500 focus:ring-2 focus:ring-eco-100 outline-none"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">
                <ShieldCheck size={14} /> Admin
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-ink-100 text-ink-500"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarHeader({ onClose } = {}) {
  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-ink-100">
      <Link to="/admin/dashboard" className="font-extrabold text-lg tracking-tight">
        ScrapIt <span className="text-ink-400 font-medium text-sm">Admin</span>
      </Link>
      {onClose && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="p-2 -mr-2 rounded-lg hover:bg-ink-100"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

function SidebarNav() {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
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
      ))}
    </nav>
  );
}

function AdminChip({ user, onLogout }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl">
      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 grid place-items-center font-semibold text-sm">
        {(user?.name || 'A').slice(0, 1).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{user?.name || 'Admin'}</div>
        <div className="text-xs text-ink-500 truncate">{user?.email || '—'}</div>
      </div>
      <button
        onClick={onLogout}
        aria-label="Log out"
        className="p-2 rounded-lg hover:bg-ink-100 text-ink-500"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}