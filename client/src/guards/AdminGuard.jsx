import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore }     from '../store/useAuthStore';

export default function AdminGuard() {
  const user        = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500
          border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user)               return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}