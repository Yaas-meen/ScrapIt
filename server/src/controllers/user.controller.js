import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';


export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  return successResponse(res, 200, 'Profile retrieved', user);
});


export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, defaultAddress } = req.body;

 
  const updates = {};
  if (fullName) updates.fullName = fullName;
  if (phone) updates.phone = phone;
  if (defaultAddress) updates.defaultAddress = defaultAddress;

  if (Object.keys(updates).length === 0) {
    return errorResponse(res, 400, 'No valid fields provided for update');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  return successResponse(res, 200, 'Profile updated successfully', user);
});


export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return errorResponse(res, 400, 'All password fields are required');
  }

  if (newPassword !== confirmPassword) {
    return errorResponse(res, 400, 'New passwords do not match');
  }

  if (newPassword.length < 6) {
    return errorResponse(res, 400, 'New password must be at least 6 characters');
  }

  if (currentPassword === newPassword) {
    return errorResponse(res, 400, 'New password must be different from current password');
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return errorResponse(res, 401, 'Current password is incorrect');
  }

  user.password = newPassword; 
  await user.save();

  return successResponse(res, 200, 'Password changed successfully');
});

//For Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  const filter = { role: 'user' };

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'Users retrieved', {
    users,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});


export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.role !== 'user') {
    return errorResponse(res, 404, 'User not found');
  }

  return successResponse(res, 200, 'User retrieved', user);
});