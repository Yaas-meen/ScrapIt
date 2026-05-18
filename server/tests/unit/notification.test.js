import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { connectTestDB, clearTestDB, closeTestDB } from '../setup.js';
import { createStatusNotification } from '../../src/services/notification.service.js';
import Notification from '../../src/models/Notification.model.js';
import mongoose from 'mongoose';

beforeAll(connectTestDB);
afterEach(clearTestDB);
afterAll(closeTestDB);

const fakeId = () => new mongoose.Types.ObjectId();

describe('createStatusNotification', () => {
  it('creates a notification when status is Approved', async () => {
    const userId   = fakeId();
    const pickupId = fakeId();

    const notif = await createStatusNotification(userId, pickupId, 'Approved');

    expect(notif).toBeTruthy();
    expect(notif.type).toBe('Approved');
    expect(notif.user.toString()).toBe(userId.toString());
  });

  it('creates a Rejected notification with reason in message', async () => {
    const userId   = fakeId();
    const pickupId = fakeId();

    const notif = await createStatusNotification(
      userId, pickupId, 'Rejected',
      { rejectionReason: 'Image unclear' }
    );

    expect(notif.type).toBe('Rejected');
    expect(notif.message).toContain('Image unclear');
  });

  it('creates a Completed notification with points', async () => {
    const userId   = fakeId();
    const pickupId = fakeId();

    const notif = await createStatusNotification(
      userId, pickupId, 'Completed',
      { pointsEarned: 45 }
    );

    expect(notif.type).toBe('Completed');
    expect(notif.message).toContain('45');
  });

  it('returns null for Pending status — no notification needed', async () => {
    const result = await createStatusNotification(fakeId(), fakeId(), 'Pending');
    expect(result).toBeNull();
  });
});