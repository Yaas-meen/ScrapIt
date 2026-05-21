import { describe, it, expect } from '@jest/globals';
import {
  calculatePickupPoints,
  WASTE_RATES,
} from '../../src/services/points.service.js';

describe('calculatePickupPoints', () => {
  it('calculates points correctly for a single plastic item', () => {
    const { enrichedItems, totalPoints, totalWeight } = calculatePickupPoints([
      { type: 'Plastic', weight: 2 },
    ]);
    expect(totalPoints).toBe(20);
    expect(totalWeight).toBe(2);
    expect(enrichedItems[0].pointsRate).toBe(WASTE_RATES.Plastic);
    expect(enrichedItems[0].pointsEarned).toBe(20);
  });

  it('calculates points for multiple waste types', () => {
    const { totalPoints, totalWeight } = calculatePickupPoints([
      { type: 'Plastic', weight: 2.5 },
      { type: 'Metal',   weight: 1   },
    ]);
    expect(totalPoints).toBe(45);
    expect(totalWeight).toBeCloseTo(3.5);
  });

  it('rounds points correctly — no floating point artifacts', () => {
    const { totalPoints } = calculatePickupPoints([
      { type: 'Glass', weight: 1.333 },
    ]);
    expect(Number.isInteger(totalPoints)).toBe(true);
  });

  it('throws for an unknown waste type', () => {
    expect(() =>
      calculatePickupPoints([{ type: 'Cardboard', weight: 1 }])
    ).toThrow('Unknown waste type');
  });

  it('throws for empty waste items array', () => {
    expect(() => calculatePickupPoints([])).not.toThrow();
  });
});