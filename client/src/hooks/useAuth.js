import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function useAuth() {
  const navigate = useNavigate();

  const user             = useAuthStore((s) => s.user);
  const accessToken      = useAuthStore((s) => s.accessToken);
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);
  const isHydrating      = useAuthStore((s) => s.isHydrating);
  const error            = useAuthStore((s) => s.error);
  const setError         = useAuthStore((s) => s.setError);

  const loginUser      = useAuthStore((s) => s.loginUser);
  const loginAdmin     = useAuthStore((s) => s.loginAdmin);
  const loginCollector = useAuthStore((s) => s.loginCollector);
  const registerUser   = useAuthStore((s) => s.registerUser);
  const logout         = useAuthStore((s) => s.logout);
  const refreshUser    = useAuthStore((s) => s.refreshUser);

  const isAuthenticated =
    !!user && !!accessToken;

  const isUser      = isAuthenticated && user?.role === 'user';
  const isAdmin     = isAuthenticated && user?.role === 'admin';
  const isCollector = isAuthenticated && user?.role === 'collector';

  const signInUser = useCallback(
    async (email, password, redirectTo = '/dashboard') => {
      await loginUser(email, password);
      navigate(redirectTo, { replace: true });
    },
    [loginUser, navigate]
  );

  const signInAdmin = useCallback(
    async (email, password, redirectTo = '/admin/dashboard') => {
      await loginAdmin(email, password);
      navigate(redirectTo, { replace: true });
    },
    [loginAdmin, navigate]
  );

  const signInCollector = useCallback(
    async (email, password, redirectTo = '/collector/dashboard') => {
      await loginCollector(email, password);
      navigate(redirectTo, { replace: true });
    },
    [loginCollector, navigate]
  );

  const signOut = useCallback(
    async (redirectTo) => {
      await logout();
      const path =
        redirectTo ||
        (isAdmin     ? '/admin/login'
        : isCollector ? '/collector/login'
        : '/login');
      navigate(path, { replace: true });
    },
    [logout, navigate, isAdmin, isCollector]
  );

  const register = useCallback(
    async (payload, redirectTo = '/dashboard') => {
      await registerUser(payload);
      navigate(redirectTo, { replace: true });
    },
    [registerUser, navigate]
  );

  const clearError = useCallback(() => setError(null), [setError]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isAuthenticating,
    isHydrating,
    error,
    isUser,
    isAdmin,
    isCollector,

    loginUser,
    loginAdmin,
    loginCollector,
    registerUser,
    logout,
    refreshUser,

    signInUser,
    signInAdmin,
    signInCollector,
    signOut,
    register,
    clearError,
  };
}
export default useAuth;