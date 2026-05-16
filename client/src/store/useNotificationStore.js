import { create } from 'zustand';
import { mockNotificationsByUser, unreadCount as mockUnreadCount } from '../mock/mockNotifications';
import { useAuthStore } from './useAuthStore';
import { shouldFallback } from './_fallback';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function callApi(method, url, body, opts = {}) {
  if (USE_MOCK) throw new Error('mock-forced');
  const { default: client } = await import('../api/axiosClient');
  const { data } = await client.request({
    method,
    url,
    data: body,
    params: opts.params,
  });
  return data;
}

const isNetworkError = shouldFallback;

export const useNotificationStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  meta: { unreadCount: 0, page: 1, limit: 20, total: 0 },

  unread: () => get().items.filter((n) => !n.readAt),
  read: () => get().items.filter((n) => !!n.readAt),

  fetch: async ({ unreadOnly = false, page = 1, limit = 20 } = {}) => {
    set({ isLoading: true, error: null });
    try {
      let items;
      let meta;
      try {
        const res = await callApi('get', '/notifications/me', null, {
          params: { unread: unreadOnly || undefined, page, limit },
        });
        items = res?.data || [];
        meta = res?.meta || {};
      } catch (err) {
        if (!isNetworkError(err)) throw err;
        const userId = useAuthStore.getState().user?.id;
        items = mockNotificationsByUser(userId);
        if (unreadOnly) items = items.filter((n) => !n.readAt);
        meta = {
          page: 1,
          limit: items.length,
          total: items.length,
          unreadCount: mockUnreadCount(userId),
        };
      }
      items = [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      set({
        items,
        meta: { ...get().meta, ...meta, unreadCount: meta.unreadCount ?? items.filter((n) => !n.readAt).length },
        isLoading: false,
      });
      return items;
    } catch (err) {
      set({ isLoading: false, error: err?.message || 'Failed to load notifications' });
      throw err;
    }
  },

  markRead: async (id) => {
    const now = new Date().toISOString();
    set((s) => ({
      items: s.items.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: now } : n)),
      meta: { ...s.meta, unreadCount: Math.max(0, (s.meta.unreadCount || 0) - 1) },
    }));
    try {
      await callApi('patch', `/notifications/${id}/read`);
    } catch (err) {
      if (!isNetworkError(err)) {
        set((s) => ({
          items: s.items.map((n) => (n.id === id ? { ...n, readAt: null } : n)),
          meta: { ...s.meta, unreadCount: (s.meta.unreadCount || 0) + 1 },
          error: err?.message || 'Failed to mark as read',
        }));
        throw err;
      }
    }
  },

  markAllRead: async () => {
    const now = new Date().toISOString();
    const previous = get().items;
    set((s) => ({
      items: s.items.map((n) => (n.readAt ? n : { ...n, readAt: now })),
      meta: { ...s.meta, unreadCount: 0 },
    }));
    try {
      await callApi('patch', '/notifications/read-all');
    } catch (err) {
      if (!isNetworkError(err)) {
        set({ items: previous, error: err?.message || 'Failed to mark all as read' });
        throw err;
      }
    }
  },

  push: (notif) =>
    set((s) => ({
      items: [{ ...notif, id: notif.id || `n_${Date.now()}`, readAt: null }, ...s.items],
      meta: { ...s.meta, unreadCount: (s.meta.unreadCount || 0) + 1 },
    })),

  reset: () =>
    set({
      items: [],
      meta: { unreadCount: 0, page: 1, limit: 20, total: 0 },
      error: null,
    }),
}));

export default useNotificationStore;