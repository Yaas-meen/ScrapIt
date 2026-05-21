import { create }             from 'zustand';
import {
  rewardCatalog,
  mockRedemptionsByUser,
  mockRedemptions,
}                             from '../mock/mockRewards';
import { generateRewardCode } from '../utils/generateRewardCode';
import { useAuthStore }       from './useAuthStore';
import { shouldFallback }     from './_fallback';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function callApi(method, url, body) {
  if (USE_MOCK) throw new Error('mock-forced');
  const { default: client } = await import('../api/axiosClient');
  const { data } = await client.request({ method, url, data: body });
  return data?.data;
}

const nextRedemptionId = (list) => {
  const max = list.reduce((m, r) => {
    const n = Number(String(r.id || '').split('-')[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 100);
  return `R-${max + 1}`;
};

const getAuthUser = () => useAuthStore.getState().user;
const getUserId   = () => {
  const u = getAuthUser();
  return u?.id || u?._id || null;
};

export const useRewardStore = create((set, get) => ({
  catalog:        rewardCatalog,
  history:        [],
  isLoading:      false,
  isRedeeming:    false,
  error:          null,
  lastRedemption: null,

  fetchCatalog: async () => {
    set({ isLoading: true, error: null });
    try {
      let cat;
      try {
        cat = await callApi('get', '/rewards/catalog');
      } catch {
        cat = rewardCatalog;
      }
      set({ catalog: cat || rewardCatalog, isLoading: false });
      return cat;
    } catch (err) {
      set({ isLoading: false, error: err?.message || 'Failed to load catalog' });
      throw err;
    }
  },

  fetchHistory: async (userIdArg) => {
    set({ isLoading: true, error: null });
    try {
      let list;
      try {
        const raw = await callApi('get', '/rewards/my');
        list = raw?.rewards || (Array.isArray(raw) ? raw : []);
      } catch (err) {
        if (!shouldFallback(err)) throw err;
        const uid = userIdArg || getUserId();
        list      = uid ? mockRedemptionsByUser(uid) : [];
      }
      set({ history: Array.isArray(list) ? list : [], isLoading: false });
      return list;
    } catch (err) {
      set({ isLoading: false, error: err?.message || 'Failed to load history' });
      throw err;
    }
  },

  validateRedeem: ({ type, providerId, denomination }) => {
    const cat = get().catalog;

    if (!cat?.[type])
      return { ok: false, message: 'Unknown reward type' };

    const provider = cat[type].providers.find((p) => p.id === providerId);
    if (!provider)
      return { ok: false, message: 'Please choose a provider' };

    const denom = cat[type].denominations.find(
      (d) => d.value === Number(denomination)
    );
    if (!denom)
      return { ok: false, message: 'Please choose an amount' };

    const user    = getAuthUser();
    const balance = user?.points ?? 0;

    if (balance < cat[type].minPoints) {
      return {
        ok:      false,
        message: `You need at least ${cat[type].minPoints.toLocaleString()} pts ` +
                 `for ${type === 'airtime' ? 'airtime' : 'gift card'} redemption.`,
      };
    }

    if (balance < denom.cost) {
      return {
        ok:      false,
        message: `Insufficient points — this costs ${denom.cost.toLocaleString()} pts ` +
                 `but you have ${balance.toLocaleString()} pts.`,
      };
    }

    return { ok: true, denomination: denom, provider };
  },

  redeem: async ({ type, providerId, denomination, phone }) => {
    set({ isRedeeming: true, error: null, lastRedemption: null });
    try {
      const check = get().validateRedeem({ type, providerId, denomination });
      if (!check.ok) throw new Error(check.message);

      let record;
      try {
        const raw = await callApi('post', '/rewards/redeem', {
          type:          type === 'airtime' ? 'Airtime' : 'Gift Card',
          provider:      check.provider.label,
          pointsToSpend: check.denomination.cost,
          denomination:  type !== 'airtime' ? check.denomination.value : undefined,
        });
        record = raw?.reward || raw;
      } catch (err) {
        if (!shouldFallback(err)) throw err;

        const user = getAuthUser();
        record = {
          id:           nextRedemptionId([...mockRedemptions, ...get().history]),
          userId:       getUserId(),
          type,
          provider:     check.provider.label,
          providerId:   check.provider.id,
          value:        check.denomination.value,
          nairaValue:   check.denomination.value,
          pointsSpent:  check.denomination.cost,
          code:         generateRewardCode({ type, providerId }),
          status:       'fulfilled',
          phone:        type === 'airtime' ? phone : undefined,
          createdAt:    new Date().toISOString(),
        };

        if (user) {
          useAuthStore.setState({
            user: {
              ...user,
              points:           Math.max(0, (user.points || 0) - check.denomination.cost),
              pointsSpent:      (user.pointsSpent      || 0) + check.denomination.cost,
              totalPointsSpent: (user.totalPointsSpent || 0) + check.denomination.cost,
            },
          });
        }
      }

      set((s) => ({
        history:        [record, ...s.history],
        lastRedemption: record,
        isRedeeming:    false,
      }));

      return record;
    } catch (err) {
      set({ isRedeeming: false, error: err?.message || 'Redemption failed' });
      throw err;
    }
  },

  clearLastRedemption: () => set({ lastRedemption: null }),

  reset: () =>
    set({
      catalog:        rewardCatalog,
      history:        [],
      lastRedemption: null,
      error:          null,
    }),
}));

export default useRewardStore;