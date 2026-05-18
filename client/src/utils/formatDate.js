const DEFAULT_LOCALE = 'en-NG';

const toDate = (d) => (d instanceof Date ? d : new Date(d));

export function formatDate(date, locale = DEFAULT_LOCALE) {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(date, locale = DEFAULT_LOCALE) {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatTime(date, locale = DEFAULT_LOCALE) {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export function formatTimeAgo(date) {
  const d    = toDate(date);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 0) {
    const ahead = Math.abs(diff);
    if (ahead < 60)    return 'in a moment';
    if (ahead < 3600)  return `in ${Math.floor(ahead / 60)}m`;
    if (ahead < 86400) return `in ${Math.floor(ahead / 3600)}h`;
    return `in ${Math.floor(ahead / 86400)}d`;
  }
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function toDateInputValue(date = new Date()) {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return '';
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const todayISO = () => toDateInputValue(new Date());

export function isPastDate(date) {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export default formatDate;