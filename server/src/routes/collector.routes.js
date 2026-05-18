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
import validate from '../middleware/validate.middleware.js';
import { createCollectorSchema } from '../validators/collector.validators.js';
import { changePasswordSchema } from '../validators/auth.validators.js';

const router = express.Router();

router.use(protect);

//collector
router.get('/profile', authorize('collector'), getCollectorProfile);
router.patch(
  '/change-password',
  authorize('collector'),
  validate(changePasswordSchema),
  changeCollectorPassword
);
//admin
router.post('/', authorize('admin'), validate(createCollectorSchema), createCollector);
router.get('/', authorize('admin'), getAllCollectors);
router.get('/:id', authorize('admin'), getCollectorById);
router.patch('/:id/status', authorize('admin'), toggleCollectorStatus);

export default router;