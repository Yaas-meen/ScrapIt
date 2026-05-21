import { useCallback, useEffect, useState } from 'react';
import { pickupApi } from '../api/pickupApi';

export function usePickups({
  scope   = 'user',
  filters = {},
  page    = 1,
  limit   = 10,
} = {}) {
  const [items, setItems]           = useState([]);
  const [pagination, setPagination] = useState({ page, limit, total: 0, pages: 0 });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, page, limit };
      let data;
      if (scope === 'admin')          data = await pickupApi.listAll(params);
      else if (scope === 'collector') data = await pickupApi.listAssigned(params);
      else                            data = await pickupApi.listMine(params);

      const list = Array.isArray(data) ? data : data?.pickups ?? [];
      const meta = data?.pagination ?? { page, limit, total: list.length, pages: 1 };
      setItems(list);
      setPagination(meta);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [scope, JSON.stringify(filters), page, limit]);

  useEffect(() => { load(); }, [load]);

  return { items, pagination, loading, error, reload: load, setItems };
}

export default usePickups;