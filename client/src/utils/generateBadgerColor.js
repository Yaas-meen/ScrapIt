const STATUS_COLOR = {
  Pending:      { color: 'gray',   className: 'bg-ink-100 text-ink-700'      },
  Approved:     { color: 'blue',   className: 'bg-blue-50 text-blue-700'     },
  'In Progress':{ color: 'orange', className: 'bg-orange-50 text-orange-700' },
  Completed:    { color: 'green',  className: 'bg-eco-50 text-eco-700'       },
  Rejected:     { color: 'red',    className: 'bg-red-50 text-red-700'       },
  Cancelled:    { color: 'gray',   className: 'bg-ink-100 text-ink-500'      },
};

const WASTE_COLOR = {
  plastic: { color: 'blue',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
  glass:   { color: 'green', className: 'bg-eco-50 text-eco-700 border-eco-200'    },
  metal:   { color: 'gray',  className: 'bg-ink-100 text-ink-700 border-ink-300'   },
};

const ROLE_COLOR = {
  user:      { color: 'blue',   className: 'bg-blue-50 text-blue-700'     },
  admin:     { color: 'purple', className: 'bg-purple-50 text-purple-700' },
  collector: { color: 'gold',   className: 'bg-gold-50 text-gold-700'     },
};

const REWARD_COLOR = {
  airtime:  { color: 'blue', className: 'bg-blue-50 text-blue-700' },
  giftcard: { color: 'gold', className: 'bg-gold-50 text-gold-700' },
};

const FALLBACK_PALETTE = [
  { color: 'eco',    className: 'bg-eco-100 text-eco-700'      },
  { color: 'blue',   className: 'bg-blue-50 text-blue-700'     },
  { color: 'gold',   className: 'bg-gold-50 text-gold-700'     },
  { color: 'orange', className: 'bg-orange-50 text-orange-700' },
  { color: 'purple', className: 'bg-purple-50 text-purple-700' },
  { color: 'red',    className: 'bg-red-50 text-red-700'       },
];

const NEUTRAL = { color: 'gray', className: 'bg-ink-100 text-ink-700' };

function hashString(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function generateBadgeColor(value, kind = 'auto') {
  if (value == null) return NEUTRAL;
  const v = String(value);
  if (kind === 'status' || (kind === 'auto' && STATUS_COLOR[v]))
    return STATUS_COLOR[v] || NEUTRAL;
  if (kind === 'waste' || (kind === 'auto' && WASTE_COLOR[v.toLowerCase()]))
    return WASTE_COLOR[v.toLowerCase()] || NEUTRAL;
  if (kind === 'role' || (kind === 'auto' && ROLE_COLOR[v.toLowerCase()]))
    return ROLE_COLOR[v.toLowerCase()] || NEUTRAL;
  if (kind === 'reward' || (kind === 'auto' && REWARD_COLOR[v.toLowerCase()]))
    return REWARD_COLOR[v.toLowerCase()] || NEUTRAL;
  return FALLBACK_PALETTE[hashString(v) % FALLBACK_PALETTE.length];
}

// Used by the Avatar component
export function getInitials(name = '') {
  return (
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  );
}

export default generateBadgeColor;