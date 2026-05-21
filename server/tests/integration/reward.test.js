import {
  describe, it, expect,
  beforeAll, afterAll, afterEach, beforeEach,
} from '@jest/globals';
import request from 'supertest';
import app     from '../../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from '../setup.js';
import {
  createTestUser, TEST_USER,
} from '../factories.js';
import { getUserToken } from '../authHelper.js';
import User from '../../src/models/User.model.js';

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

describe('POST /api/v1/rewards/redeem', () => {
  let token;
  let user;

  beforeEach(async () => {
    user  = await createTestUser({ points: 2000 });
    token = await getUserToken(TEST_USER.email, TEST_USER.password);
  });

  it('redeems airtime and deducts points', async () => {
    const res = await request(app)
      .post('/api/v1/rewards/redeem')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type:         'Airtime',
        provider:     'MTN',
        pointsToSpend: 500,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.pointsSpent).toBe(500);

    // Verify points were actually deducted in the DB
    const updated = await User.findById(user._id);
    expect(updated.points).toBe(1500);
    expect(updated.totalPointsSpent).toBe(500);
  });

  it('redeems gift card with denomination', async () => {
    const res = await request(app)
      .post('/api/v1/rewards/redeem')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type:         'Gift Card',
        provider:     'Google Play',
        pointsToSpend: 1000,
        denomination:  1000,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.nairaValue).toBe(1000);
  });

  it('rejects redemption with insufficient points', async () => {
    await User.findByIdAndUpdate(user._id, { points: 100 });

    const res = await request(app)
      .post('/api/v1/rewards/redeem')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type:          'Airtime',
        provider:      'MTN',
        pointsToSpend: 500,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Insufficient/i);
  });

  it('rejects below minimum points', async () => {
    const res = await request(app)
      .post('/api/v1/rewards/redeem')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type:          'Airtime',
        provider:      'MTN',
        pointsToSpend: 100,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Minimum/i);
  });

  it('reward code is hidden in the redeem response', async () => {
    const res = await request(app)
      .post('/api/v1/rewards/redeem')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type:          'Airtime',
        provider:      'MTN',
        pointsToSpend: 500,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBeUndefined();
  });
});

describe('GET /api/v1/rewards/:id/reveal', () => {
  it('reveals code on explicit request', async () => {
    const user  = await createTestUser({ points: 2000 });
    const token = await getUserToken(TEST_USER.email, TEST_USER.password);

    // Create a reward
    const redeem = await request(app)
      .post('/api/v1/rewards/redeem')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'Airtime', provider: 'MTN', pointsToSpend: 500 });

    const rewardId = redeem.body.data._id;

    const reveal = await request(app)
      .get(`/api/v1/rewards/${rewardId}/reveal`)
      .set('Authorization', `Bearer ${token}`);

    expect(reveal.status).toBe(200);
    expect(reveal.body.data.code).toBeTruthy();
    expect(typeof reveal.body.data.code).toBe('string');
  });
});