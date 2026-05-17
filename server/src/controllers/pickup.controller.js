import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import {
  createPickupRequest,
  getUserPickups,
  getAllPickupsFiltered,
  findPickupById,
  transitionPickupStatus,
  assignCollectorToPickup,
  deletePickupRequest,
  getCollectorAssignedPickups,
} from '../services/pickup.service.js';


export const createPickup = asyncHandler(async (req, res) => {
  let wasteItems;

  try {
    wasteItems =
      typeof req.body.wasteItems === 'string'
        ? JSON.parse(req.body.wasteItems)
        : req.body.wasteItems;
  } catch {
    return errorResponse(res, 400, 'Invalid wasteItems format — must be a JSON array');
  }

  if (!wasteItems || !Array.isArray(wasteItems) || wasteItems.length === 0) {
    return errorResponse(res, 400, 'At least one waste item is required');
  }

  if (!req.body.pickupDate) {
    return errorResponse(res, 400, 'Pickup date is required');
  }

  const pickup = await createPickupRequest({
    userId: req.user._id,
    wasteItems,
    pickupDate: req.body.pickupDate,
    address: req.body.address || req.user.defaultAddress,
    file: req.file,
  });

  return successResponse(res, 201, 'Pickup request created successfully', pickup);
});


export const getMyPickups = asyncHandler(async (req, res) => {
  const result = await getUserPickups({
    userId: req.user._id,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });

  return successResponse(res, 200, 'Pickups retrieved', result);
});


export const getAllPickups = asyncHandler(async (req, res) => {
  const result = await getAllPickupsFiltered(req.query);
  return successResponse(res, 200, 'All pickups retrieved', result);
});


export const getPickupById = asyncHandler(async (req, res) => {
  const pickup = await findPickupById(req.params.id, req.user);
  return successResponse(res, 200, 'Pickup retrieved', pickup);
});


export const updatePickupStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason, completionNotes } = req.body;

  if (!status) {
    return errorResponse(res, 400, 'Status is required');
  }

  const updated = await transitionPickupStatus({
    pickupId: req.params.id,
    newStatus: status,
    changedBy: req.user._id,
    changedByModel: req.user.role === 'collector' ? 'Collector' : 'Admin',
    rejectionReason,
    completionNotes,
  });

  return successResponse(res, 200, `Pickup status updated to ${status}`, updated);
});


export const assignCollector = asyncHandler(async (req, res) => {
  const { collectorId } = req.body;

  if (!collectorId) {
    return errorResponse(res, 400, 'Collector ID is required');
  }

  const updated = await assignCollectorToPickup({
    pickupId: req.params.id,
    collectorId,
    adminId: req.user._id,
  });

  return successResponse(res, 200, 'Collector assigned successfully', updated);
});


export const deletePickup = asyncHandler(async (req, res) => {
  await deletePickupRequest({
    pickupId: req.params.id,
    userId: req.user._id,
  });

  return successResponse(res, 200, 'Pickup deleted successfully');
});


export const getAssignedPickups = asyncHandler(async (req, res) => {
  const pickups = await getCollectorAssignedPickups({
    collectorId: req.user._id,
    status: req.query.status,
  });

  return successResponse(res, 200, 'Assigned pickups retrieved', pickups);
});