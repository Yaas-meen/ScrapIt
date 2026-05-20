import client from './axiosClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const userApi = {
  // Own profile 
  profile: () =>
    client.get('/users/profile').then(unwrap),

  updateProfile: (payload) =>
    client.patch('/users/profile', payload).then(unwrap),

  changePassword: (payload) =>
    client.patch('/users/change-password', payload).then(unwrap),

  //  Admin: list all users 
  list: (params = {}) =>
    client.get('/users', { params }).then(unwrap),

  //  Admin: get single user 
  getById: (id) =>
    client.get(`/users/${id}`).then(unwrap),
};

export default userApi;