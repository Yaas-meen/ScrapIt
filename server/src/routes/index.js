import express from 'express';
import pickupRoutes from './pickup.routes.js';

const router = express.Router();

// Mount routers
// Auth routes will be added by Dev B: router.use('/auth', authRoutes);
// User routes will be added by Dev B: router.use('/users', userRoutes);
// Collector routes will be added by Dev B: router.use('/collectors', collectorRoutes);
// Reward routes will be added in Sprint 2: router.use('/rewards', rewardRoutes);
// Notification routes will be added in Sprint 2: router.use('/notifications', notificationRoutes);

router.use('/pickups', pickupRoutes);

export default router;