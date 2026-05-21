import client from '../api/axiosClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

const rewardService = {
  redeem:     (payload) =>
    client.post('/rewards/redeem', payload).then(unwrap),

  getHistory: (params = {}) =>
    client.get('/rewards/my', { params }).then(unwrap),

  getAll:     (params = {}) =>
    client.get('/rewards', { params }).then(unwrap),

  revealCode: (id) =>
    client.get(`/rewards/${id}/reveal`).then(unwrap),
};

export default rewardService;