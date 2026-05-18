import request from 'supertest';
import app     from '../src/app.js';

// Returns a valid access token for the given credentials
export const getToken = async (email, password, route = '/api/v1/auth/login') => {
  const res = await request(app)
    .post(route)
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(
      `getToken failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`
    );
  }

  return res.body.data.accessToken;
};

export const getUserToken      = (email, password) => getToken(email, password, '/api/v1/auth/login');
export const getAdminToken     = (email, password) => getToken(email, password, '/api/v1/auth/admin/login');
export const getCollectorToken = (email, password) => getToken(email, password, '/api/v1/auth/collector/login');