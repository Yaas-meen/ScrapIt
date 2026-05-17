import express from 'express';
import {
  redeemReward,
  getMyRewards,
  revealRewardCode,
  getAllRewards,
} from '../controllers/reward.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

//user
router.post('/redeem', authorize('user'), redeemReward);
router.get('/my', authorize('user'), getMyRewards);
router.get('/:id/reveal', authorize('user'), revealRewardCode);

//admin
router.get('/', authorize('admin'), getAllRewards);

export default router;