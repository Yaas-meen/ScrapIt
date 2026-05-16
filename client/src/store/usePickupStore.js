import { create } from 'zustand';
import { mockPickups, mockPickupsByUser, mockPickupsByCollector } from '../mock/mockPickups';
import { calculatePoints } from '../utils/calculatePoints';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function callApi(method, url, body, params) {
  if (USE_MOCK) throw new Error('mock-forced');
  const { default: client } = await import('../api/axiosClient');
  const { data } = await client.request({ method, url, data: body, params });
  return data?.data;
}

const nextMockId = (list) => {
  const max = list.reduce((m, p) => {
    const n = Number(String(p.id).split('-')[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 2000);
  return `PCK-${max + 1}`;
};

const todayIso = () => new Date().toISOString();

export const usePickupStore = create((set, get) => ({
  // State 
  pickups: [...mockPickups],         
  myPickups: [],                    
  assignedPickups: [],               
  selected: null,
  filters: { status: null, search: '', from: null, to: null },
  pagination: { page: 1, limit: 20, total: 0 },
  isLoading: false,
  error: null,

  // Filters / selection 
  setFilter: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  setPage: (page) => set((s) => ({ pagination: { ...s.pagination, page } })),
  setSelected: (pickup) => set({ selected: pickup }),
  clearSelected: () => set({ selected: null }),

  fetchMyPickups: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      let list;
      try {
        list = await callApi('get', '/pickups/me');
      } catch {
        list = mockPickupsByUser(userId);
      }
      set({ myPickups: list || [], isLoading: false });
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
        pickup = await callApi('get', `/pickups/${id}`);
      } catch {
        pickup = get().pickups.find((p) => p.id === id) || null;
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
        created = await callApi('post', '/pickups', input);
      } catch {
        const id = nextMockId(get().pickups);
        created = {
          id,
          userId: input.userId,
          userName: input.userName || 'Me',
          userPhone: input.userPhone || '',
          wasteType: input.wasteType,
          weight: Number(input.weight),
          verifiedWeight: null,
          estimatedPoints: calculatePoints(input.wasteType, input.weight),
          pointsAwarded: 0,
          scheduledFor: input.scheduledFor,
          createdAt: todayIso(),
          status: 'Pending',
          collectorId: null,
          address: input.address,
          imageUrls: input.imageUrls || [],
          notes: input.notes || '',
          rejectionReason: null,
          timeline: [{ status: 'Pending', by: 'System', at: todayIso() }],
        };
      }
      set((s) => ({
        pickups: [created, ...s.pickups],
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
        await callApi('patch', `/pickups/${id}/cancel`);
      } catch {/* mock noop */}
      _patchPickup(set, get, id, { status: 'Cancelled' });
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
        list = await callApi('get', '/admin/pickups', null, get().filters);
      } catch {
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
        await callApi('patch', `/admin/pickups/${id}/approve`, { collectorId });
      } catch {/* mock noop */}
      _patchPickup(set, get, id, {
        status: 'Approved',
        collectorId: collectorId ?? null,
        timeline: _appendTimeline(get(), id, 'Approved', 'Admin'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to approve pickup' });
      throw err;
    }
  },

  rejectPickup: async (id, reason) => {
    try {
      try {
        await callApi('patch', `/admin/pickups/${id}/reject`, { reason });
      } catch {/* mock noop */}
      _patchPickup(set, get, id, {
        status: 'Rejected',
        rejectionReason: reason || 'Rejected by admin',
        timeline: _appendTimeline(get(), id, 'Rejected', 'Admin'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to reject pickup' });
      throw err;
    }
  },

  assignCollector: async (id, collectorId) => {
    try {
      try {
        await callApi('patch', `/admin/pickups/${id}/assign`, { collectorId });
      } catch {/* mock noop */}
      _patchPickup(set, get, id, { collectorId });
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
        list = await callApi('get', '/collector/pickups');
      } catch {
        list = mockPickupsByCollector(collectorId);
      }
      set({ assignedPickups: list || [], isLoading: false });
      return list;
    } catch (err) {
      set({ isLoading: false, error: err?.message || 'Failed to load assigned pickups' });
      throw err;
    }
  },

  startPickup: async (id) => {
    try {
      try {
        await callApi('patch', `/collector/pickups/${id}/start`);
      } catch {/* mock noop */}
      _patchPickup(set, get, id, {
        status: 'In Progress',
        timeline: _appendTimeline(get(), id, 'In Progress', 'Collector'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to start pickup' });
      throw err;
    }
  },

  completePickup: async (id, { verifiedWeight, completionNote } = {}) => {
    try {
      try {
        await callApi('patch', `/collector/pickups/${id}/complete`, { verifiedWeight, completionNote });
      } catch {/* mock noop */}
      const pickup = get().pickups.find((p) => p.id === id);
      const pointsAwarded =
        pickup && verifiedWeight != null
          ? calculatePoints(pickup.wasteType, verifiedWeight)
          : pickup?.estimatedPoints || 0;
      _patchPickup(set, get, id, {
        status: 'Completed',
        verifiedWeight: verifiedWeight ?? pickup?.weight ?? null,
        pointsAwarded,
        notes: completionNote || pickup?.notes || '',
        timeline: _appendTimeline(get(), id, 'Completed', 'Collector'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to complete pickup' });
      throw err;
    }
  },

  reset: () =>
    set({
      pickups: [...mockPickups],
      myPickups: [],
      assignedPickups: [],
      selected: null,
      error: null,
      filters: { status: null, search: '', from: null, to: null },
    }),
}));

//internal helpers

function _patchPickup(set, get, id, patch) {
  const apply = (list) =>
    list.map((p) => (p.id === id ? { ...p, ...patch } : p));
  set((s) => ({
    pickups: apply(s.pickups),
    myPickups: apply(s.myPickups),
    assignedPickups: apply(s.assignedPickups),
    selected: s.selected?.id === id ? { ...s.selected, ...patch } : s.selected,
  }));
}

function _appendTimeline(state, id, status, by) {
  const p = state.pickups.find((x) => x.id === id);
  const existing = p?.timeline || [];
  return [...existing, { status, by, at: new Date().toISOString() }];
}

export default usePickupStore;