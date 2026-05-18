import client from './axiosClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const adminApi = {
  dashboard:   ()         => client.get('/admin/dashboard').then(unwrap),
  statusChart: ()         => client.get('/admin/charts/status').then(unwrap),
  activity:    (limit=20) => client.get('/admin/activity', { params: { limit } }).then(unwrap),
  userSummary: (id)       => client.get(`/admin/users/${id}/summary`).then(unwrap),
};

export default adminApi;