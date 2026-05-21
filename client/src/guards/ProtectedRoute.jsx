import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore }     from '../store/useAuthStore';

export default function ProtectedRoute({
  allowedRoles = [],
  redirectTo   = '/login',
}) {
  const user        = useAuthStore((s) => s.user);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-eco-500
          border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to={redirectTo} replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
