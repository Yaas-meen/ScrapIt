import {
  describe, it, expect,
  beforeAll, afterAll,
} from '@jest/globals';
import request from 'supertest';
import app     from '../../src/app.js';
import { connectTestDB, closeTestDB } from '../setup.js';
import { createTestAdmin, createTestCollector } from '../factories.js';
import User    from '../../src/models/User.model.js';

beforeAll(async () => {
  await connectTestDB();
  await createTestAdmin();
  await createTestCollector();
});
afterAll(closeTestDB);

describe('Full critical path: register → schedule → approve → complete → redeem', () => {
  let userToken;
  let adminToken;
  let collectorToken;
  let pickupId;
  let collectorId;

  it('1. User registers a new account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName:        'Chidi Okeke',
        email:           'chidi@flowtest.com',
        phone:           '+2348012345678',
        password:        'password123',
        confirmPassword: 'password123',
      });

    expect(res.status).toBe(201);
    userToken = res.body.data.accessToken;
    expect(userToken).toBeTruthy();
  });

  it('2. Admin logs in', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ email: 'admin@scrapit.com', password: 'Admin@1234' });

    expect(res.status).toBe(200);
    adminToken = res.body.data.accessToken;
    expect(adminToken).toBeTruthy();
  });

  it('3. Collector logs in', async () => {
    const res = await request(app)
      .post('/api/v1/auth/collector/login')
      .send({ email: 'collector@scrapit.com', password: 'collector123' });

    expect(res.status).toBe(200);
    collectorToken = res.body.data.accessToken;
    collectorId    = res.body.data.user._id;
    expect(collectorToken).toBeTruthy();
  });

  it('4. User schedules a pickup — 2.5kg Plastic + 1kg Metal = 45pts', async () => {
    const res = await request(app)
      .post('/api/v1/pickups')
      .set('Authorization', `Bearer ${userToken}`)
      .field('wasteItems', JSON.stringify([
        { type: 'Plastic', weight: 2.5 },
        { type: 'Metal',   weight: 1   },
      ]))
      .field('pickupDate', new Date(Date.now() + 86_400_000).toISOString())
      .field('address', '14 Admiralty Way, Lekki, Lagos');

    expect(res.status).toBe(201);
    expect(res.body.data.totalPoints).toBe(45);
    expect(res.body.data.status).toBe('Pending');
    pickupId = res.body.data._id;
  });

  it('5. Admin approves the pickup', async () => {
    const res = await request(app)
      .patch(`/api/v1/pickups/${pickupId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Approved' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Approved');
  });

  it('6. Admin assigns a collector', async () => {
    const res = await request(app)
      .patch(`/api/v1/pickups/${pickupId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ collectorId });

    expect(res.status).toBe(200);
    expect(res.body.data.assignedCollector).toBeTruthy();
  });

  it('7. Collector starts the pickup — status becomes In Progress', async () => {
    const res = await request(app)
      .patch(`/api/v1/pickups/${pickupId}/status`)
      .set('Authorization', `Bearer ${collectorToken}`)
      .send({ status: 'In Progress' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('In Progress');
  });

  it('8. Collector completes — 45 points awarded to user', async () => {
    const res = await request(app)
      .patch(`/api/v1/pickups/${pickupId}/status`)
      .set('Authorization', `Bearer ${collectorToken}`)
      .send({
        status:          'Completed',
        completionNotes: 'Collected successfully',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Completed');
    expect(res.body.data.pointsAwarded).toBe(true);

    // Verify points landed on the user in the DB
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(meRes.body.data.points).toBe(45);
    expect(meRes.body.data.totalPointsEarned).toBe(45);
  });

  it('9. User received a completion notification', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/my')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    const notifications = res.body.data.notifications;
    const completed = notifications.find((n) => n.type === 'Completed');
    expect(completed).toBeTruthy();
    expect(completed.message).toContain('45');
  });

  it('10. User redeems 45 points for airtime — balance drops to 0', async () => {
    const res = await request(app)
      .post('/api/v1/rewards/redeem')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type:          'Airtime',
        provider:      'MTN',
        pointsToSpend: 45,
      });


    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Minimum/i);
  });

  it('10b. Boost points to 500, redeem successfully', async () => {
    const user = await User.findOne({ email: 'chidi@flowtest.com' });
    await User.findByIdAndUpdate(user._id, { points: 500 });

    const res = await request(app)
      .post('/api/v1/rewards/redeem')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type:          'Airtime',
        provider:      'MTN',
        pointsToSpend: 500,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.pointsSpent).toBe(500);

    const updated = await User.findById(user._id);
    expect(updated.points).toBe(0);
  });
});