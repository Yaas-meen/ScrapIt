import { create } from 'zustand';
import {
  mockPickups,
  mockPickupsByUser,
  mockPickupsByCollector,
} from '../mock/mockPickups';
import { calculatePoints } from '../utils/calculatePoints';
import { shouldFallback }  from './_fallback';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ── Internal API helper ───────────────────────────────────────
async function callApi(method, url, body, params) {
  if (USE_MOCK) throw new Error('mock-forced');
  const { default: client } = await import('../api/axiosClient');
  const { data } = await client.request({ method, url, data: body, params });
  return data?.data;
}

// ── Mock helpers ──────────────────────────────────────────────
const nextMockId = (list) => {
  const max = list.reduce((m, p) => {
    const n = Number(String(p.id).split('-')[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 2000);
  return `PCK-${max + 1}`;
};

const todayIso = () => new Date().toISOString();

// ── Store ─────────────────────────────────────────────────────
export const usePickupStore = create((set, get) => ({
  pickups:          [...mockPickups],
  myPickups:        [],
  assignedPickups:  [],
  selected:         null,
  filters:          { status: null, search: '', from: null, to: null },
  pagination:       { page: 1, limit: 20, total: 0 },
  isLoading:        false,
  error:            null,

  setFilter:    (patch)  => set((s) => ({ filters: { ...s.filters, ...patch } })),
  setPage:      (page)   => set((s) => ({ pagination: { ...s.pagination, page } })),
  setSelected:  (pickup) => set({ selected: pickup }),
  clearSelected: ()      => set({ selected: null }),

  // ── USER: fetch own pickups ─────────────────────────────────
  fetchMyPickups: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      let list;
      try {
        // Fixed: was /pickups/me → real API is /pickups/my
        list = await callApi('get', '/pickups/my');
        // API returns { pickups, pagination }
        list = list?.pickups || list || [];
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

  // ── USER: get single pickup ─────────────────────────────────
  fetchPickupById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      let pickup;
      try {
        pickup = await callApi('get', `/pickups/${id}`);
      } catch (err) {
        if (!shouldFallback(err)) throw err;
        pickup = get().pickups.find((p) => p.id === id) || null;
      }
      set({ selected: pickup, isLoading: false });
      return pickup;
    } catch (err) {
      set({ isLoading: false, error: err?.message || 'Failed to load pickup' });
      throw err;
    }
  },

  // ── USER: create a new pickup ───────────────────────────────
  createPickup: async (input) => {
    set({ isLoading: true, error: null });
    try {
      let created;
      try {
        if (USE_MOCK) throw new Error('mock-forced');
        // Use pickupApi which correctly builds FormData for image upload
        const { pickupApi } = await import('../api/pickupApi');
        created = await pickupApi.create({
          wasteItems: input.wasteItems,
          pickupDate: input.pickupDate || input.scheduledFor,
          address:    input.address,
          imageFile:  input.imageFile,
        });
      } catch (err) {
        if (!shouldFallback(err)) throw err;
        // Mock fallback
        const id = nextMockId(get().pickups);
        created = {
          id,
          userId:          input.userId,
          userName:        input.userName || 'Me',
          userPhone:       input.userPhone || '',
          wasteType:       input.wasteType || input.wasteItems?.[0]?.type || 'plastic',
          weight:          Number(input.weight || input.wasteItems?.[0]?.weight || 0),
          verifiedWeight:  null,
          estimatedPoints: input.estimatedPoints ||
            calculatePoints(
              input.wasteType || input.wasteItems?.[0]?.type,
              input.weight    || input.wasteItems?.[0]?.weight
            ),
          pointsAwarded:   0,
          scheduledFor:    input.pickupDate || input.scheduledFor,
          createdAt:       todayIso(),
          status:          'Pending',
          collectorId:     null,
          address:         input.address,
          imageUrls:       input.imageUrls || [],
          notes:           input.notes || '',
          rejectionReason: null,
          timeline:        [{ status: 'Pending', by: 'System', at: todayIso() }],
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

  // ── USER: cancel (delete) a pending pickup ──────────────────
  cancelPickup: async (id) => {
    try {
      try {
        if (USE_MOCK) throw new Error('mock-forced');
        // Fixed: real API uses DELETE, not PATCH /cancel
        const { default: client } = await import('../api/axiosClient');
        await client.delete(`/pickups/${id}`);
        // Remove from store on successful delete
        set((s) => ({
          pickups:   s.pickups.filter((p) => (p._id || p.id) !== id),
          myPickups: s.myPickups.filter((p) => (p._id || p.id) !== id),
        }));
        return;
      } catch (err) {
        if (!shouldFallback(err)) throw err;
      }
      // Mock: patch to Cancelled status
      _patchPickup(set, get, id, { status: 'Cancelled' });
    } catch (err) {
      set({ error: err?.message || 'Failed to cancel pickup' });
      throw err;
    }
  },

  // ── ADMIN: fetch all pickups ────────────────────────────────
  fetchAllPickups: async () => {
    set({ isLoading: true, error: null });
    try {
      let list;
      try {
        // Fixed: was /admin/pickups → real API is /pickups
        const raw  = await callApi('get', '/pickups', null, get().filters);
        list = raw?.pickups || raw || [];
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

  // ── ADMIN: approve a pickup ─────────────────────────────────
  approvePickup: async (id, { collectorId } = {}) => {
    try {
      try {
        // Fixed: was /admin/pickups/:id/approve
        // Real API: PATCH /pickups/:id/status then optionally PATCH /pickups/:id/assign
        await callApi('patch', `/pickups/${id}/status`, { status: 'Approved' });
        if (collectorId) {
          await callApi('patch', `/pickups/${id}/assign`, { collectorId });
        }
      } catch {/* mock noop */}

      _patchPickup(set, get, id, {
        status:      'Approved',
        collectorId: collectorId ?? null,
        timeline:    _appendTimeline(get(), id, 'Approved', 'Admin'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to approve pickup' });
      throw err;
    }
  },

  // ── ADMIN: reject a pickup ──────────────────────────────────
  rejectPickup: async (id, reason) => {
    try {
      try {
        // Fixed: was /admin/pickups/:id/reject
        // Real API: PATCH /pickups/:id/status with rejectionReason
        await callApi('patch', `/pickups/${id}/status`, {
          status:          'Rejected',
          rejectionReason: reason || 'Rejected by admin',
        });
      } catch {/* mock noop */}

      _patchPickup(set, get, id, {
        status:          'Rejected',
        rejectionReason: reason || 'Rejected by admin',
        timeline:        _appendTimeline(get(), id, 'Rejected', 'Admin'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to reject pickup' });
      throw err;
    }
  },

  // ── ADMIN: assign collector ─────────────────────────────────
  assignCollector: async (id, collectorId) => {
    try {
      try {
        // Endpoint was already correct: PATCH /pickups/:id/assign
        await callApi('patch', `/pickups/${id}/assign`, { collectorId });
      } catch {/* mock noop */}
      _patchPickup(set, get, id, { collectorId });
    } catch (err) {
      set({ error: err?.message || 'Failed to assign collector' });
      throw err;
    }
  },

  // ── COLLECTOR: fetch assigned pickups ───────────────────────
  fetchAssignedPickups: async (collectorId) => {
    set({ isLoading: true, error: null });
    try {
      let list;
      try {
        // Fixed: was /collector/pickups → real API is /pickups/assigned
        list = await callApi('get', '/pickups/assigned');
        list = list || [];
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

  // ── COLLECTOR: start a pickup (Approved → In Progress) ──────
  startPickup: async (id) => {
    try {
      try {
        // Fixed: was /collector/pickups/:id/start
        // Real API: PATCH /pickups/:id/status
        await callApi('patch', `/pickups/${id}/status`, {
          status: 'In Progress',
        });
      } catch {/* mock noop */}

      _patchPickup(set, get, id, {
        status:   'In Progress',
        timeline: _appendTimeline(get(), id, 'In Progress', 'Collector'),
      });
    } catch (err) {
      set({ error: err?.message || 'Failed to start pickup' });
      throw err;
    }
  },

  // ── COLLECTOR: complete a pickup (In Progress → Completed) ──
  completePickup: async (id, { verifiedWeight, completionNote } = {}) => {
    try {
      try {
        // Fixed: was /collector/pickups/:id/complete
        // Real API: PATCH /pickups/:id/status
        await callApi('patch', `/pickups/${id}/status`, {
          status:          'Completed',
          completionNotes: completionNote || undefined,
        });
      } catch {/* mock noop */}

      const pickup       = get().pickups.find((p) =>
        (p._id || p.id) === id
      );
      const pointsAwarded =
        pickup && verifiedWeight != null
          ? calculatePoints(pickup.wasteType, verifiedWeight)
          : pickup?.estimatedPoints || pickup?.totalPoints || 0;

      _patchPickup(set, get, id, {
        status:          'Completed',
        verifiedWeight:  verifiedWeight ?? pickup?.weight ?? null,
        pointsAwarded,
        notes:           completionNote || pickup?.notes || '',
        timeline:        _appendTimeline(get(), id, 'Completed', 'Collector'),
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

// ── Internal helpers ──────────────────────────────────────────

// Fixed: now handles both mock .id and real API ._id
function _patchPickup(set, get, id, patch) {
  const matches = (p) => p._id === id || p.id === id;
  const apply   = (list) =>
    list.map((p) => (matches(p) ? { ...p, ...patch } : p));

  set((s) => ({
    pickups:         apply(s.pickups),
    myPickups:       apply(s.myPickups),
    assignedPickups: apply(s.assignedPickups),
    selected:
      s.selected && matches(s.selected)
        ? { ...s.selected, ...patch }
        : s.selected,
  }));
}

function _appendTimeline(state, id, status, by) {
  const p        = state.pickups.find((x) => x._id === id || x.id === id);
  const existing = p?.timeline || p?.statusLog || [];
  return [...existing, { status, by, at: new Date().toISOString() }];
}

export default usePickupStore;