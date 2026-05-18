import express from 'express';
import {
  createPickup,
  getMyPickups,
  getAllPickups,
  getPickupById,
  updatePickupStatus,
  assignCollector,
  deletePickup,
  getAssignedPickups,
} from '../controllers/pickup.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  uploadPickupImage,
  handleUploadError,
} from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  updateStatusSchema,
  assignCollectorSchema,
} from '../validators/pickup.validators.js';

const router = express.Router();

router.use(protect);

router.get('/my', authorize('user'), getMyPickups);
router.get('/assigned', authorize('collector'), getAssignedPickups);
router.get('/', authorize('admin'), getAllPickups);


router.post(
  '/',
  authorize('user'),
  uploadPickupImage,
  handleUploadError,
  createPickup
);

router.get('/:id', authorize('user', 'admin', 'collector'), getPickupById);
router.patch(
  '/:id/status',
  authorize('admin', 'collector'),
  validate(updateStatusSchema),
  updatePickupStatus
);
router.patch(
  '/:id/assign',
  authorize('admin'),
  validate(assignCollectorSchema),
  assignCollector
);
router.delete('/:id', authorize('user'), deletePickup);

export default router;