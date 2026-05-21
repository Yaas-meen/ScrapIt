export const POINT_TO_NAIRA = 1; 

export const WASTE_POINT_RATES = Object.freeze({
  plastic: 10,
  glass:    8,
  metal:   20,
});

export const REDEMPTION_MINIMUMS = Object.freeze({
  airtime:  500,
  giftcard: 1000,
});

export const NAIRA_VALUE = (points) => points * POINT_TO_NAIRA;