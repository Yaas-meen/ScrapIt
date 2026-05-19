fetch: async ({ unreadOnly = false, page = 1, limit = 20 } = {}) => {
  set({ isLoading: true, error: null });
  try {
    let items;
    let meta;
    try {
      const res = await callApi('get', '/notifications/my', null, {
        params: { unread: unreadOnly || undefined, page, limit },
      });
      items = res?.notifications || res?.data || res || [];
      meta  = res?.meta || res?.pagination || {};
    } catch (err) {
      if (!isNetworkError(err)) throw err;
      const userId = useAuthStore.getState().user?.id;
      items = mockNotificationsByUser(userId);
      if (unreadOnly) items = items.filter((n) => !n.readAt);
      meta = {
        page:        1,
        limit:       items.length,
        total:       items.length,
        unreadCount: mockUnreadCount(userId),
      };
    }
    items = [...items].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    set({
      items,
      meta: {
        ...get().meta,
        ...meta,
        unreadCount:
          meta.unreadCount ??
          items.filter((n) => !n.readAt && !n.isRead).length,
      },
      isLoading: false,
    });
    return items;
  } catch (err) {
    set({ isLoading: false, error: err?.message || 'Failed to load notifications' });
    throw err;
  }
}