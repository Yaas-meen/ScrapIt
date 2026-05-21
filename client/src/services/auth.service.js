import client from '../api/axiosClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

const authService = {
  login:          (email, password) =>
    client.post('/auth/login', { email, password }).then(unwrap),

  loginAdmin:     (email, password) =>
    client.post('/auth/admin/login', { email, password }).then(unwrap),

  loginCollector: (email, password) =>
    client.post('/auth/collector/login', { email, password }).then(unwrap),

  register:       (payload) =>
    client.post('/auth/register', {
      fullName:        payload.name || payload.fullName,
      email:           payload.email,
      phone:           payload.phone,
      password:        payload.password,
      confirmPassword: payload.confirmPassword || payload.password,
    }).then(unwrap),

  refresh:        () =>
    client.post('/auth/refresh').then(unwrap),

  logout:         () =>
    client.post('/auth/logout').then(unwrap),

  me:             () =>
    client.get('/auth/me').then(unwrap),
};
export default authService;