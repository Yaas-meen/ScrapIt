const now        = new Date();
const daysAgo    = (n) => new Date(now - n * 86_400_000).toISOString();
const daysFuture = (n) => new Date(now.getTime() + n * 86_400_000).toISOString();

export const mockPickups = [
  {
    id: 'PCK-2001', userId: 'u-001', userName: 'Chidi Okeke',
    userPhone: '+2348012345678', wasteType: 'plastic',
    weight: 2.5, verifiedWeight: 2.5,
    estimatedPoints: 25, pointsAwarded: 25,
    scheduledFor: daysAgo(10), createdAt: daysAgo(12),
    status: 'Completed', collectorId: 'col-001',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    imageUrls: [], notes: '', rejectionReason: null,
    timeline: [
      { status: 'Pending',     by: 'System',   at: daysAgo(12) },
      { status: 'Approved',    by: 'Admin',    at: daysAgo(11) },
      { status: 'In Progress', by: 'Collector',at: daysAgo(10) },
      { status: 'Completed',   by: 'Collector',at: daysAgo(10) },
    ],
  },
  {
    id: 'PCK-2002', userId: 'u-002', userName: 'Amaka Osei',
    userPhone: '+2348023456789', wasteType: 'metal',
    weight: 3, verifiedWeight: 3,
    estimatedPoints: 60, pointsAwarded: 60,
    scheduledFor: daysAgo(8), createdAt: daysAgo(10),
    status: 'Completed', collectorId: 'col-002',
    address: '7 Adeola Odeku Street, Victoria Island, Lagos',
    imageUrls: [], notes: '', rejectionReason: null,
    timeline: [
      { status: 'Pending',     by: 'System',   at: daysAgo(10) },
      { status: 'Approved',    by: 'Admin',    at: daysAgo(9)  },
      { status: 'In Progress', by: 'Collector',at: daysAgo(8)  },
      { status: 'Completed',   by: 'Collector',at: daysAgo(8)  },
    ],
  },
  {
    id: 'PCK-2003', userId: 'u-001', userName: 'Chidi Okeke',
    userPhone: '+2348012345678', wasteType: 'glass',
    weight: 4, verifiedWeight: null,
    estimatedPoints: 32, pointsAwarded: 0,
    scheduledFor: daysAgo(1), createdAt: daysAgo(3),
    status: 'In Progress', collectorId: 'col-001',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    imageUrls: [], notes: '', rejectionReason: null,
    timeline: [
      { status: 'Pending',     by: 'System',   at: daysAgo(3) },
      { status: 'Approved',    by: 'Admin',    at: daysAgo(2) },
      { status: 'In Progress', by: 'Collector',at: daysAgo(1) },
    ],
  },
  {
    id: 'PCK-2004', userId: 'u-002', userName: 'Amaka Osei',
    userPhone: '+2348023456789', wasteType: 'plastic',
    weight: 6, verifiedWeight: null,
    estimatedPoints: 60, pointsAwarded: 0,
    scheduledFor: daysFuture(1), createdAt: daysAgo(2),
    status: 'Approved', collectorId: 'col-002',
    address: '7 Adeola Odeku Street, Victoria Island, Lagos',
    imageUrls: [], notes: '', rejectionReason: null,
    timeline: [
      { status: 'Pending',  by: 'System', at: daysAgo(2) },
      { status: 'Approved', by: 'Admin',  at: daysAgo(1) },
    ],
  },
  {
    id: 'PCK-2005', userId: 'u-003', userName: 'Bola Adeyemi',
    userPhone: '+2348034567890', wasteType: 'plastic',
    weight: 5, verifiedWeight: null,
    estimatedPoints: 50, pointsAwarded: 0,
    scheduledFor: daysFuture(2), createdAt: daysAgo(1),
    status: 'Pending', collectorId: null,
    address: '22 Allen Avenue, Ikeja, Lagos',
    imageUrls: [], notes: '', rejectionReason: null,
    timeline: [{ status: 'Pending', by: 'System', at: daysAgo(1) }],
  },
  {
    id: 'PCK-2006', userId: 'u-001', userName: 'Chidi Okeke',
    userPhone: '+2348012345678', wasteType: 'metal',
    weight: 0.5, verifiedWeight: null,
    estimatedPoints: 10, pointsAwarded: 0,
    scheduledFor: daysAgo(3), createdAt: daysAgo(5),
    status: 'Rejected', collectorId: null,
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    imageUrls: [], notes: '',
    rejectionReason: 'Image was too blurry. Please resubmit.',
    timeline: [
      { status: 'Pending',  by: 'System', at: daysAgo(5) },
      { status: 'Rejected', by: 'Admin',  at: daysAgo(4) },
    ],
  },
];

export const mockPickupsByUser      = (userId)      => mockPickups.filter((p) => p.userId      === userId);
export const mockPickupsByCollector = (collectorId) => mockPickups.filter((p) => p.collectorId === collectorId);

export default mockPickups;