const DEFAULT_LOCALE   = 'en-NG';
const DEFAULT_CURRENCY = 'NGN';

export function formatCurrency(
  amount,
  { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE, fractionDigits = 0 } = {}
) {
  if (amount == null) return '—';
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  try {
    return new Intl.NumberFormat(locale, {
      style:                 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString(locale)}`;
  }
}

export function formatNumber(value, locale = DEFAULT_LOCALE) {
  if (value == null) return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(locale);
}

export function formatPoints(value) {
  if (value == null) return '—';
  return `${formatNumber(value)} pts`;
}

export function formatWeight(value) {
  if (value == null) return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${Number.isInteger(n) ? n : n.toFixed(1)} kg`;
}

export function formatPercent(value, { fromFraction = false, digits = 0 } = {}) {
  if (value == null) return '—';
  let n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (fromFraction) n = n * 100;
  return `${n.toFixed(digits)}%`;
}

export default formatCurrency;