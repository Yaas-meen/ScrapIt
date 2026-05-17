import Pickup from '../models/Pickup.model.js';
import cloudinary from '../config/cloudinary.js';
import { calculatePickupPoints, awardPointsToUser } from './points.service.js';
import { createStatusNotification } from './notification.service.js';

export const STATUS_TRANSITIONS = {
  Pending: ['Approved', 'Rejected'],
  Approved: ['In Progress', 'Rejected'],
  'In Progress': ['Completed'],
};

export const createPickupRequest = async ({
  userId,
  wasteItems,
  pickupDate,
  address,
  file,
}) => {
  const { enrichedItems, totalPoints, totalWeight } = calculatePickupPoints(wasteItems);

  const pickup = await Pickup.create({
    user: userId,
    wasteItems: enrichedItems,
    totalWeight,
    totalPoints,
    pickupDate: new Date(pickupDate),
    address,
    imageUrl: file?.path || null,
    imagePublicId: file?.filename || null,
    statusLog: [
      {
        status: 'Pending',
        changedBy: userId,
        changedByModel: 'User',
        note: 'Pickup request created by user',
      },
    ],
  });

  return pickup;
};

export const getUserPickups = async ({ userId, status, page = 1, limit = 10 }) => {
  const filter = { user: userId };
  if (status && status !== 'All') filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [pickups, total] = await Promise.all([
    Pickup.find(filter)
      .populate('assignedCollector', 'fullName phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Pickup.countDocuments(filter),
  ]);

  return {
    pickups,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getAllPickupsFiltered = async ({
  status,
  search,
  startDate,
  endDate,
  page = 1,
  limit = 10,
}) => {
  const filter = {};

  if (status && status !== 'All') filter.status = status;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }


  if (search) {
    filter.$or = [{ address: { $regex: search, $options: 'i' } }];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [pickups, total] = await Promise.all([
    Pickup.find(filter)
      .populate('user', 'fullName email phone')
      .populate('assignedCollector', 'fullName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Pickup.countDocuments(filter),
  ]);

  return {
    pickups,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const findPickupById = async (pickupId, requestingUser) => {
  const pickup = await Pickup.findById(pickupId)
    .populate('user', 'fullName email phone defaultAddress')
    .populate('assignedCollector', 'fullName phone email');

  if (!pickup) {
    const err = new Error('Pickup not found');
    err.statusCode = 404;
    throw err;
  }

  if (
    requestingUser.role === 'user' &&
    pickup.user._id.toString() !== requestingUser._id.toString()
  ) {
    const err = new Error('Not authorised to view this pickup');
    err.statusCode = 403;
    throw err;
  }

  return pickup;
};

export const transitionPickupStatus = async ({
  pickupId,
  newStatus,
  changedBy,
  changedByModel,
  rejectionReason,
  completionNotes,
}) => {
  const pickup = await Pickup.findById(pickupId);

  if (!pickup) {
    const err = new Error('Pickup not found');
    err.statusCode = 404;
    throw err;
  }

  const allowedNext = STATUS_TRANSITIONS[pickup.status];

  if (!allowedNext || !allowedNext.includes(newStatus)) {
    const err = new Error(
      `Cannot transition from '${pickup.status}' to '${newStatus}'`
    );
    err.statusCode = 400;
    throw err;
  }

  if (newStatus === 'Rejected' && !rejectionReason) {
    const err = new Error('Rejection reason is required');
    err.statusCode = 400;
    throw err;
  }

  pickup.status = newStatus;
  if (newStatus === 'Rejected') pickup.rejectionReason = rejectionReason;
  if (newStatus === 'Completed') pickup.completionNotes = completionNotes || null;

  pickup.statusLog.push({
    status: newStatus,
    changedBy,
    changedByModel,
    note: rejectionReason || completionNotes || null,
  });

  await pickup.save();

  if (newStatus === 'Completed' && !pickup.pointsAwarded) {
    await awardPointsToUser(pickup.user, pickup.totalPoints);
    pickup.pointsAwarded = true;
    await pickup.save();
  }

  await createStatusNotification(pickup.user, pickup._id, newStatus, {
    pointsEarned: newStatus === 'Completed' ? pickup.totalPoints : 0,
    rejectionReason: rejectionReason || '',
  });

  return await Pickup.findById(pickup._id)
    .populate('user', 'fullName email phone')
    .populate('assignedCollector', 'fullName phone');
};

export const assignCollectorToPickup = async ({ pickupId, collectorId, adminId }) => {
  const pickup = await Pickup.findById(pickupId);

  if (!pickup) {
    const err = new Error('Pickup not found');
    err.statusCode = 404;
    throw err;
  }

  if (pickup.status !== 'Approved') {
    const err = new Error('Can only assign a collector to an Approved pickup');
    err.statusCode = 400;
    throw err;
  }

  pickup.assignedCollector = collectorId;

  pickup.statusLog.push({
    status: pickup.status,
    changedBy: adminId,
    changedByModel: 'Admin',
    note: 'Collector assigned by admin',
  });

  await pickup.save();

  return await Pickup.findById(pickup._id)
    .populate('user', 'fullName email phone')
    .populate('assignedCollector', 'fullName phone email');
};

export const deletePickupRequest = async ({ pickupId, userId }) => {
  const pickup = await Pickup.findById(pickupId);

  if (!pickup) {
    const err = new Error('Pickup not found');
    err.statusCode = 404;
    throw err;
  }

  if (pickup.user.toString() !== userId.toString()) {
    const err = new Error('Not authorised to delete this pickup');
    err.statusCode = 403;
    throw err;
  }

  if (pickup.status !== 'Pending') {
    const err = new Error('Only pending pickups can be deleted');
    err.statusCode = 400;
    throw err;
  }

  if (pickup.imagePublicId) {
    await cloudinary.uploader.destroy(pickup.imagePublicId);
  }

  await pickup.deleteOne();
};

export const getCollectorAssignedPickups = async ({ collectorId, status }) => {
  const filter = { assignedCollector: collectorId };
  if (status && status !== 'All') filter.status = status;

  return await Pickup.find(filter)
    .populate('user', 'fullName phone defaultAddress')
    .sort({ pickupDate: 1 });
};