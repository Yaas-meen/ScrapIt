import {
  describe, it, expect,
  beforeAll, afterAll, afterEach, beforeEach,
} from '@jest/globals';
import request from 'supertest';
import app     from '../../src/app.js';
import {
  connectTestDB, clearTestDB, closeTestDB,
} from '../setup.js';
import {
  createTestUser, createTestAdmin, createTestCollector,
  createTestPickup,
  TEST_USER, TEST_ADMIN, TEST_COLLECTOR,
} from '../factories.js';
import { getUserToken, getAdminToken, getCollectorToken } from '../authHelper.js';

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);


describe('POST /api/v1/pickups', () => {
  let token;
  let user;

  beforeEach(async () => {
    user  = await createTestUser();
    token = await getUserToken(TEST_USER.email, TEST_USER.password);
  });

  it('creates a pickup and calculates points correctly', async () => {
    const res = await request(app)
      .post('/api/v1/pickups')
      .set('Authorization', `Bearer ${token}`)
      .field('wasteItems', JSON.stringify([
        { type: 'Plastic', weight: 2.5 },
        { type: 'Metal',   weight: 1   },
      ]))
      .field('pickupDate', new Date(Date.now() + 86_400_000).toISOString())
      .field('address', '14 Admiralty Way, Lekki, Lagos');

    expect(res.status).toBe(201);
    expect(res.body.data.totalPoints).toBe(45);
    expect(res.body.data.status).toBe('Pending');
    expect(res.body.data.wasteItems).toHaveLength(2);
  });

  it('rejects empty waste items', async () => {
    const res = await request(app)
      .post('/api/v1/pickups')
      .set('Authorization', `Bearer ${token}`)
      .field('wasteItems', JSON.stringify([]))
      .field('pickupDate', new Date(Date.now() + 86_400_000).toISOString())
      .field('address', 'Test Address');

    expect(res.status).toBe(400);
  });

  it('blocks unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/v1/pickups')
      .field('wasteItems', JSON.stringify([{ type: 'Plastic', weight: 1 }]))
      .field('pickupDate', new Date().toISOString())
      .field('address', 'Test Address');

    expect(res.status).toBe(401);
  });
});


describe('GET /api/v1/pickups/my', () => {
  it('returns only the logged-in user\'s pickups', async () => {
    const user1 = await createTestUser({ email: 'user1@test.com' });
    const user2 = await createTestUser({ email: 'user2@test.com', fullName: 'User Two' });

    await createTestPickup(user1._id);
    await createTestPickup(user1._id);
    await createTestPickup(user2._id);

    const token = await getUserToken('user1@test.com', TEST_USER.password);

    const res = await request(app)
      .get('/api/v1/pickups/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pickups).toHaveLength(2);
  });

  it('filters by status', async () => {
    const user = await createTestUser();

    await createTestPickup(user._id, { status: 'Pending' });
    await createTestPickup(user._id, { status: 'Completed', pointsAwarded: true });

    const token = await getUserToken(TEST_USER.email, TEST_USER.password);

    const res = await request(app)
      .get('/api/v1/pickups/my?status=Pending')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pickups).toHaveLength(1);
    expect(res.body.data.pickups[0].status).toBe('Pending');
  });
});



describe('PATCH /api/v1/pickups/:id/status', () => {
  let user, adminToken, pickup;

  beforeEach(async () => {
    user       = await createTestUser();
    await createTestAdmin();
    adminToken = await getAdminToken(TEST_ADMIN.email, TEST_ADMIN.password);
    pickup     = await createTestPickup(user._id);
  });

  it('admin approves a pending pickup', async () => {
    const res = await request(app)
      .patch(`/api/v1/pickups/${pickup._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Approved' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Approved');
    expect(res.body.data.statusLog).toHaveLength(2);
  });

  it('admin rejects with a reason', async () => {
    const res = await request(app)
      .patch(`/api/v1/pickups/${pickup._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status:          'Rejected',
        rejectionReason: 'Image unclear',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Rejected');
    expect(res.body.data.rejectionReason).toBe('Image unclear');
  });

  it('rejects without a reason', async () => {
    const res = await request(app)
      .patch(`/api/v1/pickups/${pickup._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Rejected' });

    expect(res.status).toBe(400);
  });

  it('blocks invalid status transitions', async () => {
    // Pending to Completed is not allowed
    const res = await request(app)
      .patch(`/api/v1/pickups/${pickup._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Completed' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Cannot transition/i);
  });

  it('blocks user from updating status', async () => {
    const userToken = await getUserToken(TEST_USER.email, TEST_USER.password);

    const res = await request(app)
      .patch(`/api/v1/pickups/${pickup._id}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'Approved' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/v1/pickups/:id', () => {
  it('user deletes their own pending pickup', async () => {
    const user    = await createTestUser();
    const token   = await getUserToken(TEST_USER.email, TEST_USER.password);
    const pickup  = await createTestPickup(user._id);

    const res = await request(app)
      .delete(`/api/v1/pickups/${pickup._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('blocks deletion of non-pending pickup', async () => {
    const user   = await createTestUser();
    const token  = await getUserToken(TEST_USER.email, TEST_USER.password);
    const pickup = await createTestPickup(user._id, { status: 'Approved' });

    const res = await request(app)
      .delete(`/api/v1/pickups/${pickup._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only pending/i);
  });
});