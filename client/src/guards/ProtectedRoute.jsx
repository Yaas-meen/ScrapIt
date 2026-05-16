import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({
  allowedRoles = null,           
  loginPath = '/login',          
  fallback = null,             
}) {
  const location = useLocation();
  const { user, accessToken, isHydrating, isTokenExpired, logout } = useAuthStore(
    (s) => ({
      user: s.user,
      accessToken: s.accessToken,
      isHydrating: s.isHydrating,
      isTokenExpired: s.isTokenExpired,
      logout: s.logout,
    }),
  );

  if (isHydrating) return fallback;
  if (!accessToken || !user) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }
  if (typeof isTokenExpired === 'function' && isTokenExpired()) {
    logout?.();
    return <Navigate to={loginPath} replace state={{ from: location, reason: 'expired' }} />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={loginPath} replace state={{ from: location, reason: 'role' }} />;
  }
  return <Outlet />;
}