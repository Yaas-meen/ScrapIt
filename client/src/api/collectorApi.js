import client from './axiosClient';

export const collectorApi = {
  list: async (params = {}) => {
    const { data } = await client.get('/collectors', { params });
    return data?.data?.collectors ?? data?.data ?? [];
  },

  create: async (form) => {
    const { data } = await client.post('/collectors', {
      fullName:        form.fullName,
      email:           form.email,
      phone:           form.phone,
      password:        form.password,
      confirmPassword: form.password,
    });
    return data?.data?.collector ?? data?.data ?? data;
  },

  update: async (id, patch) => {
    const { data } = await client.patch(`/collectors/${id}/status`, patch);
    return data?.data?.collector ?? data?.data ?? data;
  },

  remove: async (id) => {
    const { data } = await client.delete(`/collectors/${id}`);
    return data;
  },

  getById: async (id) => {
    const { data } = await client.get(`/collectors/${id}`);
    return data?.data?.collector ?? data?.data ?? data;
  },
};
export default collectorApi;