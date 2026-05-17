import Reward from '../models/Reward.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import {
  validateRedemption,
  processRedemption,
} from '../services/reward.service.js';


export const redeemReward = asyncHandler(async (req, res) => {
  const { type, provider, pointsToSpend, denomination } = req.body;

  if (!type || !provider || !pointsToSpend) {
    return errorResponse(res, 400, 'Type, provider and pointsToSpend are required');
  }

  const points = Number(pointsToSpend);

  if (isNaN(points) || points <= 0) {
    return errorResponse(res, 400, 'pointsToSpend must be a positive number');
  }


  const validation = validateRedemption(
    type,
    provider,
    points,
    denomination,
    req.user.points
  );

  if (!validation.valid) {
    return errorResponse(res, 400, validation.message);
  }

  const reward = await processRedemption({
    userId: req.user._id,
    type,
    provider,
    pointsToSpend: points,
    denomination,
  });


  return successResponse(res, 201, 'Redemption successful', {
    _id: reward._id,
    type: reward.type,
    provider: reward.provider,
    pointsSpent: reward.pointsSpent,
    nairaValue: reward.nairaValue,
    denomination: reward.denomination,
    createdAt: reward.createdAt,
  });
});


export const getMyRewards = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;

  const filter = { user: req.user._id };
  if (type && ['Airtime', 'Gift Card'].includes(type)) {
    filter.type = type;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [rewards, total] = await Promise.all([
    Reward.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Reward.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'Rewards retrieved', {
    rewards,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});


export const revealRewardCode = asyncHandler(async (req, res) => {
 
  const reward = await Reward.findById(req.params.id).select('+code');

  if (!reward) {
    return errorResponse(res, 404, 'Reward not found');
  }

  // Users can only reveal their own codes
  if (reward.user.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorised to view this reward code');
  }


  if (!reward.isCodeRevealed) {
    reward.isCodeRevealed = true;
    await reward.save();
  }

  return successResponse(res, 200, 'Code revealed', {
    _id: reward._id,
    code: reward.code,
    type: reward.type,
    provider: reward.provider,
    nairaValue: reward.nairaValue,
  });
});


export const getAllRewards = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (type && ['Airtime', 'Gift Card'].includes(type)) {
    filter.type = type;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [rewards, total] = await Promise.all([
    Reward.find(filter)
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Reward.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'All rewards retrieved', {
    rewards,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});