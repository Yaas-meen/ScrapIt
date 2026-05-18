import client from './axiosClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const collectorApi = {
  // Self
  me: () => client.get('/collectors/me').then(unwrap),
  updateMe: (body) => client.patch('/collectors/me', body).then(unwrap),

  // Admin scope
  list: (params = {}) => client.get('/collectors', { params }).then(unwrap),
  create: (body) => client.post('/collectors', body).then(unwrap),
  update: (id, body) => client.patch(`/collectors/${id}`, body).then(unwrap),
  deactivate: (id) => client.delete(`/collectors/${id}`),
};

export default collectorApi;