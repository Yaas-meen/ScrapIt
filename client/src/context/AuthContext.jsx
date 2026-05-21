import { createContext, useContext } from 'react';
import { useAuthStore }             from '../store/useAuthStore';
import { ROLE_HOME_PATHS }          from '../constants/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const user             = useAuthStore((s) => s.user);
  const accessToken      = useAuthStore((s) => s.accessToken);
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);
  const isHydrating      = useAuthStore((s) => s.isHydrating);
  const error            = useAuthStore((s) => s.error);
  const loginUser        = useAuthStore((s) => s.loginUser);
  const loginAdmin       = useAuthStore((s) => s.loginAdmin);
  const loginCollector   = useAuthStore((s) => s.loginCollector);
  const registerUser     = useAuthStore((s) => s.registerUser);
  const logout           = useAuthStore((s) => s.logout);
  const setError         = useAuthStore((s) => s.setError);

  const isAuthenticated = !!user && !!accessToken;
  const homePath        = ROLE_HOME_PATHS[user?.role] || '/login';

  const value = {
    user,
    accessToken,
    isAuthenticated,
    isAuthenticating,
    isHydrating,
    error,
    homePath,
    loginUser,
    loginAdmin,
    loginCollector,
    registerUser,
    logout,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
export default AuthContext;