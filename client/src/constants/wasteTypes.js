export const WASTE_TYPES = [
  {
    type: 'Plastic',
    key:  'plastic',
    icon: '♻️',
    rate: 10,
    unit: 'pts/kg',
    description: 'Bottles, containers, packaging',
  },
  {
    type: 'Glass',
    key:  'glass',
    icon: '🫙',
    rate: 8,
    unit: 'pts/kg',
    description: 'Bottles, jars, windows',
  },
  {
    type: 'Metal',
    key:  'metal',
    icon: '⚙️',
    rate: 20,
    unit: 'pts/kg',
    description: 'Cans, pipes, appliances',
  },
];

export const WASTE_TYPE_OPTIONS = WASTE_TYPES.map((w) => w.type);