export const POINT_RATES = Object.freeze({
  plastic: 10,
  glass:   8,
  metal:   20,
});

export const WASTE_TYPES = Object.freeze(['plastic', 'glass', 'metal']);

export function calculatePoints(wasteType, weightKg) {
  if (!wasteType || typeof wasteType !== 'string') return 0;
  const rate = POINT_RATES[wasteType.toLowerCase()];
  if (!rate) return 0;
  const w = Number(weightKg);
  if (!Number.isFinite(w) || w <= 0) return 0;
  return Math.floor(w * rate);
}

export function rateLabel(wasteType) {
  const rate = POINT_RATES[String(wasteType).toLowerCase()];
  return rate ? `${rate} pts/kg` : '—';
}
export function calculateTotalPoints(wasteItems = []) {
  return wasteItems.reduce((total, item) => {
    if (!item.type || !item.weight) return total;
    return total + calculatePoints(item.type, item.weight);
  }, 0);
}

export function calculateTotalWeight(wasteItems = []) {
  return wasteItems.reduce((total, item) => {
    return total + (parseFloat(item.weight) || 0);
  }, 0);
}
export default calculatePoints;