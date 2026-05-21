import { create }        from 'zustand';
import {
  mockNotificationsByUser,
  unreadCount as mockUnreadCount,
} from '../mock/mockNotifications';
import { useAuthStore }  from './useAuthStore';
import { shouldFallback } from './_fallback';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function callApi(method, url, body, params) {
  if (USE_MOCK) throw new Error('mock-forced');
  const { default: client } = await import('../api/axiosClient');
  const { data } = await client.request({
    method,
    url,
    data:   body,
    params: params,
  });
  return data;
}

const getCurrentUserId = () => {
  const u = useAuthStore.getState().user;
  return u?.id || u?._id || null;
};

export const useNotificationStore = create((set, get) => ({
  items:     [],
  isLoading: false,
  error:     null,
  meta: {
    unreadCount: 0,
    page:        1,
    limit:       20,
    total:       0,
  },

  unread: () => get().items.filter((n) => !n.readAt && !n.isRead),
  read:   () => get().items.filter((n) =>  n.readAt ||  n.isRead),

  fetch: async ({ unreadOnly = false, page = 1, limit = 20 } = {}) => {
    set({ isLoading: true, error: null });
    try {
      let items;
      let meta;

      try {
        const res = await callApi('get', '/notifications/my', null, {
          unread: unreadOnly || undefined,
          page,
          limit,
        });

        const body = res?.data ?? res;
        items = body?.notifications || body?.data || [];
        meta  = body?.meta || body?.pagination || {};

      } catch (err) {
        if (!shouldFallback(err)) throw err;

        const uid = getCurrentUserId();
        items = uid ? mockNotificationsByUser(uid) : [];
        if (unreadOnly) items = items.filter((n) => !n.readAt && !n.isRead);
        meta = {
          page:        1,
          limit:       items.length,
          total:       items.length,
          unreadCount: uid ? mockUnreadCount(uid) : 0,
        };
      }

      items = [...items].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const unreadCount =
        meta.unreadCount ??
        items.filter((n) => !n.readAt && !n.isRead).length;

      set({
        items,
        meta: { ...get().meta, ...meta, unreadCount },
        isLoading: false,
      });

      return items;
    } catch (err) {
      set({
        isLoading: false,
        error: err?.message || 'Failed to load notifications',
      });
      throw err;
    }
  },

  markRead: async (id) => {
    const now = new Date().toISOString();

    set((s) => ({
      items: s.items.map((n) =>
        (n.id === id || n._id === id) && !n.readAt
          ? { ...n, readAt: now, isRead: true }
          : n
      ),
      meta: {
        ...s.meta,
        unreadCount: Math.max(0, (s.meta.unreadCount || 0) - 1),
      },
    }));

    try {
      await callApi('patch', `/notifications/${id}/read`);
    } catch (err) {
      if (!shouldFallback(err)) {
        set((s) => ({
          items: s.items.map((n) =>
            (n.id === id || n._id === id)
              ? { ...n, readAt: null, isRead: false }
              : n
          ),
          meta: {
            ...s.meta,
            unreadCount: (s.meta.unreadCount || 0) + 1,
          },
          error: err?.message || 'Failed to mark as read',
        }));
        throw err;
      }
    }
  },

  markAllRead: async () => {
    const now      = new Date().toISOString();
    const previous = get().items;

    set((s) => ({
      items: s.items.map((n) =>
        n.readAt ? n : { ...n, readAt: now, isRead: true }
      ),
      meta: { ...s.meta, unreadCount: 0 },
    }));

    try {
      await callApi('patch', '/notifications/read-all');
    } catch (err) {
      if (!shouldFallback(err)) {
        set({
          items: previous,
          error: err?.message || 'Failed to mark all as read',
        });
        throw err;
      }
    }
  },

  push: (notif) =>
    set((s) => ({
      items: [
        { ...notif, id: notif.id || `n_${Date.now()}`, readAt: null, isRead: false },
        ...s.items,
      ],
      meta: {
        ...s.meta,
        unreadCount: (s.meta.unreadCount || 0) + 1,
      },
    })),

  reset: () =>
    set({
      items:     [],
      meta:      { unreadCount: 0, page: 1, limit: 20, total: 0 },
      error:     null,
      isLoading: false,
    }),
}));

export default useNotificationStore;