const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

const PROVIDER_PREFIX = {
  mtn: 'MTN', airtel: 'ATL', glo: 'GLO', '9mobile': 'NMB',
  gplay: 'GP', apple: 'APL', amazon: 'AMZ',
};

function randomGroup(len = 4) {
  let out = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(len);
    crypto.getRandomValues(buf);
    for (let i = 0; i < len; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  } else {
    for (let i = 0; i < len; i++)
      out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function generateRewardCode({ type, providerId } = {}) {
  const prefix = PROVIDER_PREFIX[String(providerId || '').toLowerCase()] || 'RWD';
  const groups = type === 'giftcard' ? 3 : 2;
  const parts  = [prefix];
  for (let i = 0; i < groups; i++) parts.push(randomGroup(4));
  return parts.join('-');
}

export function isValidRewardCode(code) {
  if (typeof code !== 'string') return false;
  return /^([A-Z]{2,3})(?:-[A-Z2-9]{4}){2,3}$/.test(code);
}
export default generateRewardCode;