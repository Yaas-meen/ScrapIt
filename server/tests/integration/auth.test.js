import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app     from '../../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from '../setup.js';
import { createTestUser, createTestAdmin, createTestCollector, TEST_USER, TEST_ADMIN, TEST_COLLECTOR } from '../factories.js';

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

// ─────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  it('registers a new user and returns tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName:        'New User',
        email:           'new@scrapit.com',
        phone:           '+2348099999999',
        password:        'password123',
        confirmPassword: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.email).toBe('new@scrapit.com');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects mismatched passwords', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName:        'New User',
        email:           'new@scrapit.com',
        password:        'password123',
        confirmPassword: 'different456',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects duplicate email', async () => {
    await createTestUser();

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName:        'Another User',
        email:           TEST_USER.email,
        password:        'password123',
        confirmPassword: 'password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

// ─────────────────────────────────────────────
// User login
// ─────────────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  beforeAll(createTestUser);

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.role).toBe('user');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@scrapit.com', password: 'password123' });

    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// Admin login
// ─────────────────────────────────────────────
describe('POST /api/v1/auth/admin/login', () => {
  beforeAll(createTestAdmin);

  it('logs in admin with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('admin');
  });

  it('blocks non-admin from admin login', async () => {
    await createTestUser();

    const res = await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(403);
  });
});

describe('POST /api/v1/auth/collector/login', () => {
  beforeAll(createTestCollector);

  it('logs in collector with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/collector/login')
      .send({ email: TEST_COLLECTOR.email, password: TEST_COLLECTOR.password });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('collector');
  });

  it('blocks inactive collector', async () => {
    await clearTestDB();
    await createTestCollector({ isActive: false });

    const res = await request(app)
      .post('/api/v1/auth/collector/login')
      .send({ email: TEST_COLLECTOR.email, password: TEST_COLLECTOR.password });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/deactivated/i);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns current user when authenticated', async () => {
    await createTestUser();
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    const token = login.body.data.accessToken;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(TEST_USER.email);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});