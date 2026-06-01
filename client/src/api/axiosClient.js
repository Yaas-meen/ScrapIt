import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const client = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20_000,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;

async function performRefresh() {
  const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
  const newToken = res?.data?.data?.accessToken;
  if (!newToken) throw new Error('Refresh failed');
  useAuthStore.setState({ accessToken: newToken });
  return newToken;
}

client.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.includes('/auth/refresh');

    if (status !== 401 || original?._retried || isAuthEndpoint) {
      return Promise.reject(error);
    }
    original._retried = true;

    try {
      refreshing = refreshing || performRefresh();
      const newToken = await refreshing;
      refreshing = null;
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return client.request(original);
    } catch (refreshErr) {
      refreshing = null;
      try { await useAuthStore.getState().logout?.(); } catch { /* ignore */ }
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        const role = useAuthStore.getState().user?.role;
        const target =
          role === 'admin' ? '/admin/login'
          : role === 'collector' ? '/collector/login'
          : '/login';
        window.location.replace(`${target}?reason=expired`);
      }
      return Promise.reject(refreshErr);
    }
  },
);
export default client;
