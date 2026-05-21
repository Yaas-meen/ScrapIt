import { Link }           from 'react-router-dom';
import { Bell, Menu }     from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import Logo from './Logo';

export default function Navbar({ onMenuOpen }) {
  const unread = useNotificationStore((s) => s.meta.unreadCount);

  return (
    <header className="h-14 bg-white border-b border-ink-100
      flex items-center justify-between px-4 shrink-0 lg:hidden z-10">
      <button
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
        className="p-2 rounded-xl hover:bg-ink-100 text-ink-600"
      >
        <Menu size={20} />
      </button>

      <Logo size="sm" />

      <Link
        to="/notifications"
        className="relative p-2 rounded-xl hover:bg-ink-100 text-ink-600"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full
            bg-eco-600 text-white text-[9px] font-bold
            grid place-items-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Link>
    </header>
  );
}