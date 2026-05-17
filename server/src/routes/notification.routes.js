import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// All notification routes are user-only
router.get('/my', authorize('user'), getMyNotifications);
router.patch('/read-all', authorize('user'), markAllAsRead); 
router.patch('/:id/read', authorize('user'), markAsRead);
router.delete('/:id', authorize('user'), deleteNotification);

export default router;