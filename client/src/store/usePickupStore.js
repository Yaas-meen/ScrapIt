import { create }            from 'zustand';
import {
  mockPickups,
  mockPickupsByUser,
  mockPickupsByCollector,
}                            from '../mock/mockPickups';
import { calculatePoints }   from '../utils/calculatePoints';
import { shouldFallback }    from './_fallback';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function callApi(method, url, body, params) {
  if (USE_MOCK) throw new Error('mock-forced');
  const { default: client } = await import('../api/axiosClient');
  const { data } = await client.request({ method, url, data: body, params });
  return data?.data;
}

function normalizePickup(p) {
  if (!p) return p;

  const assignedCol = p.assignedCollector;
  const collectorId =
    p.collectorId ||
    (assignedCol && typeof assignedCol === 'object' ? String(assignedCol._id) : null) ||
    (typeof assignedCol === 'string' ? assignedCol : null) ||
    null;

  const collectorName =
    p.collectorName ||
    (assignedCol && typeof assignedCol === 'object' ? assignedCol.fullName : null) ||
    null;

  const userObj = p.user;
  const userName  = p.userName  || (userObj && typeof userObj === 'object' ? userObj.fullName : null) || 'Unknown';
  const userPhone = p.userPhone || (userObj && typeof userObj === 'object' ? userObj.phone   : null) || '';

  return {
    ...p,
    collectorId,
    collectorName,
    userName,
    userPhone,
  };
}

const normalizeList = (list) =>
  Array.isArray(list) ? list.map(normalizePickup) : [];

const nextMockId = (list) => {
  const max = list.reduce((m, p) => {
    const n = Number(String(p.id || '').split('-')[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 2000);
  return `PCK-${max + 1}`;
};

const now = () => new Date().toISOString();

export const usePickupStore = create((set, get) => ({
  pickups:         [...mockPickups],
  myPickups:       [],
  assignedPickups: [],
  selected:        null,
  filters:         { status: null, search: '', from: null, to: null },
  pagination:      { page: 1, limit: 20, total: 0 },
  isLoading:       false,
  error:           null,

  setFilter:     (patch)  => set((s) => ({ filters: { ...s.filters, ...patch } })),
  setPage:       (page)   => set((s) => ({ pagination: { ...s.pagination, page } })),
  setSelected:   (pickup) => set({ selected: pickup }),
  clearSelected: ()       => set({ selected: null }),

  fetchMyPickups: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      let list;
      try {
        const raw = await callApi('get', '/pickups/my');
        list = normalizeList(raw?.pickups || (Array.isArray(raw) ? raw : []));
      } catch (err) {
        if (!shouldFallback(err)) throw err;
        list = mockPickupsByUser(userId);
      }
      set({ myPickups: list, isLoading: false });
      return list;
    } catch (err) {
      set({ isLoading: false, error: err?.message || 'Failed to load pickups' });
      throw err;
    }
  },

  fetchPickupById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      let pickup;
      try {
        const raw = await callApi('get', `/pickups/${id}`);
        pickup = normalizePickup(raw);
      } catch (err) {
        if (!shouldFallback(err)) throw err;
        pickup = get().pickups.find((p) => p._id === id || p.id === id) || null;
      }
      set({ selected: pickup, isLoading: false });
      return pickup;
    } catch (err) {
      set({ isLoading: false, error: err?.message || 'Failed to load pickup' });
      throw err;
    }
  },

  createPickup: async (input) => {
    set({ isLoading: true, error: null });
    try {
      let created;
      try {
        if (USE_MOCK) throw new Error('mock-forced');
        const { pickupApi } = await import('../api/pickupApi');
        const raw = await pickupApi.create({
          wasteItems: input.wasteItems,
          pickupDate: input.pickupDate || input.scheduledFor,
          address:    input.address,
          imageFile:  input.imageFile,
        });
        created = normalizePickup(raw);
      } catch (err) {
        if (!shouldFallback(err)) throw err;
        const id    = nextMockId(get().pickups);
        const wType = input.wasteType || input.wasteItems?.[0]?.type || 'plastic';
        const wKg   = Number(input.weight || input.wasteItems?.[0]?.weight || 0);
        created = {
          id,
          userId:          input.userId,
          userName:        input.userName || 'Me',
          userPhone:       input.userPhone || '',
          wasteType:       wType,
          weight:          wKg,
          verifiedWeight:  null,
          estimatedPoints: input.estimatedPoints || calculatePoints(wType, wKg),
          pointsAwarded:   0,
          scheduledFor:    input.pickupDate || input.scheduledFor,
          createdAt:       now(),
          status:          'Pending',
          collectorId:     null,
          collectorName:   null,
          address:         input.address,
          imageUrls:       input.imageUrls || [],
          notes:           input.notes || '',
          rejectionReason: null,
          timeline:        [{ status: 'Pending', by: 'System', at: now() }],
        };
      }
      set((s) => ({
        pickups:   [created, ...s.pickups],
        myPickups: [created, ...s.myPickups],
        isLoading: false,
      }));
      return created;
    } catch (err) {
      set({ isLoading: false, error: err?.message || 'Failed to create pickup' });
      throw err;
    }
  },

  cancelPickup: async (id) => {
    try {
      try {
        if (USE_MOCK) throw new Error('mock-forced');
        const { default: client } = await import('../api/axiosClient');
        await client.delete(`/pickups/${id}`);
        set((s) => ({
          pickups:   s.pickups.filter((p) => (p._id || p.id) !== id),
          myPickups: s.myPickups.filter((p) => (p._id || p.id) !== id),
        }));
        return;
      } catch (err) {
        if (!shouldFallback(err)) throw err;
      }
      _patch(set, get, id, { status: 'Cancelled' });
    } catch (err) {
      set({ error: err?.message || 'Failed to cancel pickup' });
      throw err;
    }
  },

  fetchAllPickups: async () => {
    set({ isLoading: true, error: null });
    try {
      let list;
      try {
        const raw = await callApi('get', '/pickups', null, get().filters);
        list = normalizeList(raw?.pickups || (Array.isArray(raw) ? raw : []));
      } catch (err) {
        if (!shouldFallback(err)) throw err;
        list = [...mockPickups];
      }
      set({ pickups: list, isLoading: false });
      return list;
    } catch (err) {
      set({ isLoading: false, error: err?.message || 'Failed to load pickups' });
      throw err;
    }
  },

  approvePickup: async (id, { collectorId } = {}) => {
    try {
      try {
        await callApi('patch', `/pickups/${id}/status`, { status: 'Approved' });
        if (collectorId) {
          await callApi('patch', `/pickups/${id}/assign`, { collectorId });
        }
      } catch (err) {
        if (!shouldFallback(err)) throw err;
      }
      _patch(set, get, id, {
        status:        'Approved',
        collectorId:   collectorId ?? null,
        timeline:      _timeline(get(), id, 'Approved', 'Admin'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to approve' });
      throw err;
    }
  },

  rejectPickup: async (id, reason) => {
    try {
      try {
        await callApi('patch', `/pickups/${id}/status`, {
          status:          'Rejected',
          rejectionReason: reason || 'Rejected by admin',
        });
      } catch (err) {
        if (!shouldFallback(err)) throw err;
      }
      _patch(set, get, id, {
        status:          'Rejected',
        rejectionReason: reason || 'Rejected by admin',
        timeline:        _timeline(get(), id, 'Rejected', 'Admin'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to reject' });
      throw err;
    }
  },

  assignCollector: async (id, collectorId) => {
    try {
      try {
        await callApi('patch', `/pickups/${id}/assign`, { collectorId });
      } catch (err) {
        if (!shouldFallback(err)) throw err;
      }
      _patch(set, get, id, { collectorId });
    } catch (err) {
      set({ error: err?.message || 'Failed to assign collector' });
      throw err;
    }
  },

  fetchAssignedPickups: async (collectorId) => {
    set({ isLoading: true, error: null });
    try {
      let list;
      try {
        const raw = await callApi('get', '/pickups/assigned');
        list = normalizeList(Array.isArray(raw) ? raw : raw?.pickups || []);
      } catch (err) {
        if (!shouldFallback(err)) throw err;
        list = mockPickupsByCollector(collectorId);
      }
      set({ assignedPickups: list, isLoading: false });
      return list;
    } catch (err) {
      set({ isLoading: false, error: err?.message || 'Failed to load assigned pickups' });
      throw err;
    }
  },

  startPickup: async (id) => {
    try {
      try {
        await callApi('patch', `/pickups/${id}/status`, { status: 'In Progress' });
      } catch (err) {
        if (!shouldFallback(err)) throw err;
      }
      _patch(set, get, id, {
        status:   'In Progress',
        timeline: _timeline(get(), id, 'In Progress', 'Collector'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to start pickup' });
      throw err;
    }
  },

  completePickup: async (id, { verifiedWeight, completionNote } = {}) => {
    try {
      try {
        await callApi('patch', `/pickups/${id}/status`, {
          status:          'Completed',
          completionNotes: completionNote || undefined,
        });
      } catch (err) {
        if (!shouldFallback(err)) throw err;
      }
      const p   = get().pickups.find((x) => x._id === id || x.id === id);
      const pts = p && verifiedWeight != null
        ? calculatePoints(p.wasteType, verifiedWeight)
        : p?.estimatedPoints || 0;

      _patch(set, get, id, {
        status:         'Completed',
        verifiedWeight: verifiedWeight ?? p?.weight ?? null,
        pointsAwarded:  pts,
        notes:          completionNote || p?.notes || '',
        timeline:       _timeline(get(), id, 'Completed', 'Collector'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to complete pickup' });
      throw err;
    }
  },

  reset: () =>
    set({
      pickups:         [...mockPickups],
      myPickups:       [],
      assignedPickups: [],
      selected:        null,
      error:           null,
      filters:         { status: null, search: '', from: null, to: null },
    }),
}));

function _patch(set, get, id, patch) {
  const matches = (p) => p._id === id || p.id === id;
  const apply   = (list) => list.map((p) => (matches(p) ? { ...p, ...patch } : p));
  set((s) => ({
    pickups:         apply(s.pickups),
    myPickups:       apply(s.myPickups),
    assignedPickups: apply(s.assignedPickups),
    selected: s.selected && matches(s.selected) ? { ...s.selected, ...patch } : s.selected,
  }));
}

function _timeline(state, id, status, by) {
  const p = state.pickups.find((x) => x._id === id || x.id === id);
  return [...(p?.timeline || p?.statusLog || []), { status, by, at: new Date().toISOString() }];
}
export default usePickupStore;