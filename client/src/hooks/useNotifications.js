import { useCallback, useEffect } from 'react';
import { useNotificationStore }   from '../store/useNotificationStore';

export function useNotifications({ autoFetch = true } = {}) {
  const items      = useNotificationStore((s) => s.items);
  const isLoading  = useNotificationStore((s) => s.isLoading);
  const error      = useNotificationStore((s) => s.error);
  const meta       = useNotificationStore((s) => s.meta);
  const fetch      = useNotificationStore((s) => s.fetch);
  const markRead   = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const push       = useNotificationStore((s) => s.push);
  const reset      = useNotificationStore((s) => s.reset);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch]);

  const refresh = useCallback(
    (opts) => fetch(opts),
    [fetch]
  );

  const unread = items.filter((n) => !n.readAt && !n.isRead);
  const read   = items.filter((n) =>  n.readAt ||  n.isRead);

  return {
    notifications: items,
    unread,
    read,
    unreadCount:   meta.unreadCount,
    isLoading,
    error,
    meta,
    refresh,
    markRead,
    markAllRead,
    push,
    reset,
  };
}
export default useNotifications;