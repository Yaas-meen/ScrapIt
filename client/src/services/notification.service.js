import client from '../api/axiosClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

const notificationService = {
  getAll:    (params = {}) =>
    client.get('/notifications/my', { params }).then(unwrap),

  markRead:  (id) =>
    client.patch(`/notifications/${id}/read`).then(unwrap),

  markAllRead: () =>
    client.patch('/notifications/read-all').then(unwrap),

  delete:    (id) =>
    client.delete(`/notifications/${id}`).then(unwrap),
};

export default notificationService;