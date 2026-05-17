import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import collectorRoutes from './collector.routes.js';
import pickupRoutes from './pickup.routes.js';
import rewardRoutes from './reward.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/collectors', collectorRoutes);
router.use('/pickups', pickupRoutes);
router.use('/rewards', rewardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;