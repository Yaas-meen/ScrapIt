import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { findMockUserByEmail } from '../mock/mockUsers';
import { findMockCollectorByEmail } from '../mock/mockCollectors';
import { shouldFallback } from './_fallback';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';


function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function expiryFromToken(token) {
  const claims = decodeJwt(token);
  return claims?.exp ? claims.exp * 1000 : null;
}

function mockToken(userId) {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 15 * 60,
    mock: true,
  };
  return `mock.${btoa(JSON.stringify(payload))}.signature`;
}


async function postLogin(path, body) {
  if (USE_MOCK) throw new Error('mock-forced');
  const { default: client } = await import('../api/axiosClient');
  const { data } = await client.post(path, body);
  return data?.data;
}


export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      tokenExpiresAt: null,
      isHydrating: true,        
      isAuthenticating: false,
      error: null,

      isTokenExpired: () => {
        const exp = get().tokenExpiresAt;
        return exp != null && Date.now() >= exp;
      },
      isAuthenticated: () => !!get().user && !!get().accessToken && !get().isTokenExpired(),

      setAuth: ({ user, accessToken }) =>
        set({
          user,
          accessToken,
          tokenExpiresAt: expiryFromToken(accessToken),
          error: null,
        }),

      setAvailability: (availability) =>
        set((s) => (s.user ? { user: { ...s.user, availability } } : s)),

      setError: (error) => set({ error }),

      _login: async ({ endpoint, email, password, expectedRole, mockResolver }) => {
        set({ isAuthenticating: true, error: null });
        try {
          let data;
          try {
            data = await postLogin(endpoint, { email, password });
          } catch (err) {
            if (!shouldFallback(err)) throw err;
            // Fall back to mock resolver
            data = mockResolver({ email, password });
          }
          if (!data?.user || !data?.accessToken) {
            throw new Error('Invalid login response');
          }
          if (expectedRole && data.user.role !== expectedRole) {
            throw new Error(`This account is not a ${expectedRole}.`);
          }
          set({
            user: data.user,
            accessToken: data.accessToken,
            tokenExpiresAt: expiryFromToken(data.accessToken),
            isAuthenticating: false,
            error: null,
          });
          return data.user;
        } catch (err) {
          const message =
            err?.response?.data?.error?.message || err?.message || 'Login failed';
          set({ isAuthenticating: false, error: message });
          throw new Error(message);
        }
      },

      loginUser: async (email, password) =>
        get()._login({
          endpoint: '/auth/login',
          email,
          password,
          expectedRole: 'user',
          mockResolver: ({ email: e, password: p }) => {
            const u = findMockUserByEmail(e);
            if (!u || u.password !== p) throw new Error('Invalid email or password');
            if (u.role !== 'user') throw new Error('This account is not a user.');
            const { password: _pw, ...safe } = u;
            return { user: safe, accessToken: mockToken(u.id) };
          },
        }),

      loginAdmin: async (email, password) =>
        get()._login({
          endpoint: '/auth/admin/login',
          email,
          password,
          expectedRole: 'admin',
          mockResolver: ({ email: e, password: p }) => {
            const u = findMockUserByEmail(e);
            if (!u || u.password !== p) throw new Error('Invalid admin credentials');
            if (u.role !== 'admin') throw new Error('This account is not an admin.');
            const { password: _pw, ...safe } = u;
            return { user: safe, accessToken: mockToken(u.id) };
          },
        }),

      loginCollector: async (email, password) =>
        get()._login({
          endpoint: '/auth/collector/login',
          email,
          password,
          expectedRole: 'collector',
          mockResolver: ({ email: e, password: p }) => {
            const c = findMockCollectorByEmail(e);
            if (!c || c.password !== p) throw new Error('Invalid collector credentials');
            if (c.role !== 'collector') throw new Error('This account is not a collector.');
            const { password: _pw, ...safe } = c;
            return { user: safe, accessToken: mockToken(c.id) };
          },
        }),


      registerUser: async ({ name, email, phone, password }) => {
        set({ isAuthenticating: true, error: null });
        try {
          let data;
          try {
            if (USE_MOCK) throw new Error('mock-forced');
            const { default: client } = await import('../api/axiosClient');
            const res = await client.post('/auth/register', { name, email, phone, password });
            data = res?.data?.data;
          } catch (err) {
            if (!shouldFallback(err)) throw err;
            // Mock fallback registration
            if (findMockUserByEmail(email)) {
              throw new Error('An account with that email already exists.');
            }
            const newUser = {
              id: `u_${Math.random().toString(36).slice(2, 8)}`,
              name,
              email: String(email).toLowerCase(),
              phone,
              role: 'user',
              address: '',
              points: 0,
              pointsEarned: 0,
              pointsSpent: 0,
              profileComplete: false,
              avatar: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
              isActive: true,
              createdAt: new Date().toISOString(),
            };
            data = { user: newUser, accessToken: mockToken(newUser.id) };
          }
          if (!data?.user || !data?.accessToken) {
            throw new Error('Invalid registration response');
          }
          set({
            user: data.user,
            accessToken: data.accessToken,
            tokenExpiresAt: expiryFromToken(data.accessToken),
            isAuthenticating: false,
            error: null,
          });
          return data.user;
        } catch (err) {
          const message =
            err?.response?.data?.error?.message || err?.message || 'Registration failed';
          set({ isAuthenticating: false, error: message });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          if (!USE_MOCK) {
            const { default: client } = await import('../api/axiosClient');
            await client.post('/auth/logout').catch(() => {});
          }
        } finally {
          set({ user: null, accessToken: null, tokenExpiresAt: null, error: null });
        }
      },
    }),
    {
      name: 'scrapit-auth',
      storage: createJSONStorage(() => sessionStorage),

      // Persist user + tokenExpiresAt only. Access token stays in memory.
      
      partialize: (s) => ({ user: s.user, tokenExpiresAt: s.tokenExpiresAt }),
      onRehydrateStorage: () => (state) => {

        // After rehydrate, clear the hydration flag.
        state && (state.isHydrating = false);
      },
    },
  ),
);

export default useAuthStore;