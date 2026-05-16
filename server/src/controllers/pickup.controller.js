import Pickup from '../models/Pickup.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { calculatePickupPoints, awardPointsToUser } from '../services/points.service.js';
import { createStatusNotification } from '../services/notification.service.js';
import cloudinary from '../config/cloudinary.js';


export const createPickup = asyncHandler(async (req, res) => {
    let wasteItems;

  try {
    wasteItems =
      typeof req.body.wasteItems === 'string'
        ? JSON.parse(req.body.wasteItems)
        : req.body.wasteItems;
  } catch (err) {
    return errorResponse(res, 400, 'Invalid wasteItems format');
  }
    
  const {pickupDate, address } = req.body;

  if (!wasteItems || !Array.isArray(wasteItems) || wasteItems.length === 0) {
    return errorResponse(res, 400, 'At least one waste item is required');
  }


  const { enrichedItems, totalPoints, totalWeight } = calculatePickupPoints(wasteItems);

  // Initial status log entry
  const statusLog = [
    {
      status: 'Pending',
      changedBy: req.user._id,
      changedByModel: 'User',
      note: 'Pickup request created by user',
    },
  ];

  const pickup = await Pickup.create({
    user: req.user._id,
    wasteItems: enrichedItems,
    totalWeight,
    totalPoints,
    pickupDate: new Date(pickupDate),
    address: address || req.user.defaultAddress,
    imageUrl: req.file?.path || null,
    imagePublicId: req.file?.filename || null,
    statusLog,
  });

  return successResponse(res, 201, 'Pickup request created successfully', pickup);
});

//For User
export const getMyPickups = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { user: req.user._id };
  if (status && status !== 'All') {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [pickups, total] = await Promise.all([
    Pickup.find(filter)
      .populate('assignedCollector', 'fullName phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Pickup.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'Pickups retrieved', {
    pickups,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// For Admin
export const getAllPickups = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 10, startDate, endDate } = req.query;

  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  let query = Pickup.find(filter)
    .populate('user', 'fullName email phone')
    .populate('assignedCollector', 'fullName phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Search by user name requires a different approach — populate first
  // For now we support search by request ID suffix
  if (search) {
    filter.$or = [
      { address: { $regex: search, $options: 'i' } },
    ];
  }

  const [pickups, total] = await Promise.all([
    query,
    Pickup.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'All pickups retrieved', {
    pickups,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});


export const getPickupById = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id)
    .populate('user', 'fullName email phone defaultAddress')
    .populate('assignedCollector', 'fullName phone email');

  if (!pickup) {
    return errorResponse(res, 404, 'Pickup not found');
  }

  // Users can only see their own pickups
  if (
    req.user.role === 'user' &&
    pickup.user._id.toString() !== req.user._id.toString()
  ) {
    return errorResponse(res, 403, 'Not authorised to view this pickup');
  }

  return successResponse(res, 200, 'Pickup retrieved', pickup);
});


export const updatePickupStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason, completionNotes } = req.body;

  const validTransitions = {
    Pending: ['Approved', 'Rejected'],
    Approved: ['In Progress', 'Rejected'],
    'In Progress': ['Completed'],
  };

  const pickup = await Pickup.findById(req.params.id);

  if (!pickup) {
    return errorResponse(res, 404, 'Pickup not found');
  }

  const allowedNext = validTransitions[pickup.status];

  if (!allowedNext || !allowedNext.includes(status)) {
    return errorResponse(
      res,
      400,
      `Cannot transition from '${pickup.status}' to '${status}'`
    );
  }

  // Rejection requires a reason
  if (status === 'Rejected' && !rejectionReason) {
    return errorResponse(res, 400, 'Rejection reason is required');
  }

  pickup.status = status;

  if (status === 'Rejected') {
    pickup.rejectionReason = rejectionReason;
  }

  if (status === 'Completed') {
    pickup.completionNotes = completionNotes || null;
  }

  pickup.statusLog.push({
    status,
    changedBy: req.user._id,
    changedByModel: req.user.role === 'collector' ? 'Collector' : 'Admin',
    note: rejectionReason || completionNotes || null,
  });

  await pickup.save();


  if (status === 'Completed' && !pickup.pointsAwarded) {
    await awardPointsToUser(pickup.user, pickup.totalPoints);
    pickup.pointsAwarded = true;
    await pickup.save();
  }


  await createStatusNotification(
    pickup.user,
    pickup._id,
    status,
    {
      pointsEarned: status === 'Completed' ? pickup.totalPoints : 0,
      rejectionReason: rejectionReason || '',
    }
  );

  const updated = await Pickup.findById(pickup._id)
    .populate('user', 'fullName email phone')
    .populate('assignedCollector', 'fullName phone');

  return successResponse(res, 200, `Pickup status updated to ${status}`, updated);
});


export const assignCollector = asyncHandler(async (req, res) => {
  const { collectorId } = req.body;

  if (!collectorId) {
    return errorResponse(res, 400, 'Collector ID is required');
  }

  const pickup = await Pickup.findById(req.params.id);

  if (!pickup) {
    return errorResponse(res, 404, 'Pickup not found');
  }

  if (pickup.status !== 'Approved') {
    return errorResponse(res, 400, 'Can only assign a collector to an Approved pickup');
  }

  pickup.assignedCollector = collectorId;

  pickup.statusLog.push({
    status: pickup.status,
    changedBy: req.user._id,
    changedByModel: 'Admin',
    note: `Collector assigned by admin`,
  });

  await pickup.save();

  const updated = await Pickup.findById(pickup._id)
    .populate('user', 'fullName email phone')
    .populate('assignedCollector', 'fullName phone email');

  return successResponse(res, 200, 'Collector assigned successfully', updated);
});

//For User
export const deletePickup = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id);

  if (!pickup) {
    return errorResponse(res, 404, 'Pickup not found');
  }

  if (pickup.user.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorised to delete this pickup');
  }

  //only pending pickups can be deleted
  if (pickup.status !== 'Pending') {
    return errorResponse(res, 400, 'Only pending pickups can be deleted');
  }


  if (pickup.imagePublicId) {
    await cloudinary.uploader.destroy(pickup.imagePublicId);
  }

  await pickup.deleteOne();

  return successResponse(res, 200, 'Pickup deleted successfully');
});

//For Collctor
export const getAssignedPickups = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = { assignedCollector: req.user._id };

  if (status && status !== 'All') {
    filter.status = status;
  }

  const pickups = await Pickup.find(filter)
    .populate('user', 'fullName phone address')
    .sort({ pickupDate: 1 });

  return successResponse(res, 200, 'Assigned pickups retrieved', pickups);
});