import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import collectorRoutes from './collector.routes.js';
import pickupRoutes from './pickup.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/collectors', collectorRoutes);
router.use('/pickups', pickupRoutes);

// Reward + notification routes will be added in Sprint 2
// router.use('/rewards', rewardRoutes);
// router.use('/notifications', notificationRoutes);

export default router;