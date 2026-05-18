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
import validate from '../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
} from '../validators/auth.validators.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/admin/login', validate(loginSchema), loginAdmin);
router.post('/collector/login', validate(loginSchema), loginCollector);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Protected — requires valid access token
router.get('/me', protect, getMe);

export default router;