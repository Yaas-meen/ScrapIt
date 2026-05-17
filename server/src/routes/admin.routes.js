import express from 'express';
import {
  getDashboardStats,
  getStatusChartData,
  getActivityLog,
  getUserSummary,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/charts/status', getStatusChartData);
router.get('/activity', getActivityLog);
router.get('/users/:id/summary', getUserSummary);

export default router;