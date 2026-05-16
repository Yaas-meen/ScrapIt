import express from 'express';
import {
  registerUser,
  loginUser,
  loginAdmin,
  loginCollector,
  refreshToken,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.post('/collector/login', loginCollector);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Protected — requires valid access token
router.get('/me', protect, getMe);

export default router;