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
import { uploadPickupImage, handleUploadError } from '../middleware/upload.middleware.js';

const router = express.Router();

// All pickup routes require authentication
router.use(protect);

//User Routes
router.post(
  '/',
  uploadPickupImage,
  handleUploadError,
  authorize('user'),
  createPickup
);

router.get('/my', authorize('user'), getMyPickups);

router.delete('/:id', authorize('user'), deletePickup);

//Collector Routes
router.get('/assigned', authorize('collector'), getAssignedPickups);

// Admin Routes
router.get('/', authorize('admin'), getAllPickups);

router.patch('/:id/status', authorize('admin', 'collector'), updatePickupStatus);

router.patch('/:id/assign', authorize('admin'), assignCollector);

//Shared routes for all
router.get('/:id', authorize('user', 'admin', 'collector'), getPickupById);

export default router;