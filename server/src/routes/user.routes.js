import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);


router.get('/profile', authorize('user'), getProfile);
router.patch('/profile', authorize('user'), updateProfile);
router.patch('/change-password', authorize('user', 'admin', 'collector'), changePassword);

//For Admin
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);

export default router;