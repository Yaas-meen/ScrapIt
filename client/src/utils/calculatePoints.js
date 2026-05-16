export const POINT_RATES = Object.freeze(
    {
        plastic: 10,
        glass: 8,
        metal: 20,
    });

export const WASTE_TYPES = Object.freeze(['plastic','glass','metal']);
/**
 * @param {'plastic'|'glass'|'metal'} wasteType
 * @param {number} weightKg  
 * @returns {number} 
 */
export function calculatePoints(wasteType, weightKg){
    if (!wasteType || typeof wasteType !== 'string') return 0;
    const rate =  POINT_RATES[wasteType.toLowerCase()];
    if (!rate) return 0;
    const w = Number(weightKg);
    if (!Number.isFinite(w) || w <= 0 ) return 0;
    return Math.floor(w * rate);
}

export function rateLabel(wasteType) {
  const rate = POINT_RATES[String(wasteType).toLowerCase()];
  return rate ? `${rate} pts/kg` : '—';
}
 
export default calculatePoints;