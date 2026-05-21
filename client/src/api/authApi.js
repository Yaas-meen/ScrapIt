import client from './axiosClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const authApi = {
  register: (body) => client.post('/auth/register', body).then(unwrap),
  login: (body) => client.post('/auth/login', body).then(unwrap),
  adminLogin: (body) => client.post('/auth/admin/login', body).then(unwrap),
  collectorLogin: (body) => client.post('/auth/collector/login', body).then(unwrap),
  refresh: () => client.post('/auth/refresh').then(unwrap),
  logout: () => client.post('/auth/logout'),
  me: () => client.get('/auth/me').then(unwrap),
};
export default authApi;