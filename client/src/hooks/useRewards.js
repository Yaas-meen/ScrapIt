import { useCallback, useEffect } from 'react';
import { useRewardStore }         from '../store/useRewardStore';
import { useAuthStore }           from '../store/useAuthStore';

export function useRewards() {
  const user         = useAuthStore((s) => s.user);
  const catalog      = useRewardStore((s) => s.catalog);
  const history      = useRewardStore((s) => s.history);
  const isLoading    = useRewardStore((s) => s.isLoading);
  const isRedeeming  = useRewardStore((s) => s.isRedeeming);
  const error        = useRewardStore((s) => s.error);
  const lastRedemption     = useRewardStore((s) => s.lastRedemption);
  const fetchHistory       = useRewardStore((s) => s.fetchHistory);
  const redeem             = useRewardStore((s) => s.redeem);
  const validateRedeem     = useRewardStore((s) => s.validateRedeem);
  const clearLastRedemption = useRewardStore((s) => s.clearLastRedemption);

  const uid = user?.id || user?._id;

  useEffect(() => {
    if (uid) fetchHistory(uid);
  }, [uid]);

  const redeemReward = useCallback(
    async (payload) => {
      return redeem(payload);
    },
    [redeem]
  );

  return {
    catalog,
    history,
    isLoading,
    isRedeeming,
    error,
    lastRedemption,
    redeemReward,
    validateRedeem,
    clearLastRedemption,
    balance:       user?.points || 0,
    totalEarned:   user?.totalPointsEarned || user?.pointsEarned || 0,
    totalRedeemed: user?.totalPointsSpent  || user?.pointsSpent  || 0,
  };
}

export default useRewards;