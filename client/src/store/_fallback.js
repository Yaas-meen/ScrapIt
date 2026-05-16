const DEV = import.meta.env.DEV;
const SOFT_STATUSES = new Set([404, 502, 503]);

export function shouldFallback(err) {
  if (!err) return false;
  if (err.message === 'mock-forced') return true;
  if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') return true;
  if (err.response == null) return true;
  
// dev only soft fallback
  if (DEV && SOFT_STATUSES.has(err.response?.status)) return true;
  return false;
}

export default shouldFallback;