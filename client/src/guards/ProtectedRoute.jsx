import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({
  allowedRoles = null,           // e.g. ['admin'], ['collector'], ['user']
  loginPath = '/login',          // where to redirect when unauthenticated
  fallback = null,               // optional element to render while hydrating
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

  // While the store is rehydrating from storage, render the fallback (or null).
  if (isHydrating) return fallback;

  // No token at all → bounce to login.
  if (!accessToken || !user) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  // Token expired → clear and bounce.
  if (typeof isTokenExpired === 'function' && isTokenExpired()) {
    logout?.();
    return <Navigate to={loginPath} replace state={{ from: location, reason: 'expired' }} />;
  }

  // Role mismatch → also bounce (do NOT silently render a wrong-role page).
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={loginPath} replace state={{ from: location, reason: 'role' }} />;
  }

  return <Outlet />;
}
