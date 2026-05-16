import express from 'express';
import {
  createCollector,
  getAllCollectors,
  getCollectorById,
  toggleCollectorStatus,
  getCollectorProfile,
  changeCollectorPassword,
} from '../controllers/collector.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

//collector
router.get('/profile', authorize('collector'), getCollectorProfile);
router.patch('/change-password', authorize('collector'), changeCollectorPassword);

//admin
router.post('/', authorize('admin'), createCollector);
router.get('/', authorize('admin'), getAllCollectors);
router.get('/:id', authorize('admin'), getCollectorById);
router.patch('/:id/status', authorize('admin'), toggleCollectorStatus);

export default router;