export const STATUSES = [
  'All', 'Pending', 'Approved', 'In Progress', 'Completed', 'Rejected',
];

export const STATUS_COLORS = {
  Pending:      { bg: 'bg-ink-100',    text: 'text-ink-600',    dot: 'bg-ink-400'    },
  Approved:     { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  'In Progress':{ bg: 'bg-gold-100',   text: 'text-gold-700',   dot: 'bg-gold-500'   },
  Completed:    { bg: 'bg-eco-100',    text: 'text-eco-700',    dot: 'bg-eco-500'    },
  Rejected:     { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
};

export const STATUS_TIMELINE = ['Pending', 'Approved', 'In Progress', 'Completed'];