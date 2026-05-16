import Collector from '../models/Collector.model.js';
import Pickup from '../models/Pickup.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

//admin
export const createCollector = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    return errorResponse(res, 400, 'Full name, email, phone and password are required');
  }

  const exists = await Collector.findOne({ email: email.toLowerCase() });
  if (exists) {
    return errorResponse(res, 400, 'A collector with this email already exists');
  }

  const collector = await Collector.create({
    fullName,
    email: email.toLowerCase(),
    phone,
    password,
  });

  
  const safe = collector.toObject();
  delete safe.password;
  delete safe.refreshToken;

  return successResponse(res, 201, 'Collector account created successfully', safe);
});

//admin
export const getAllCollectors = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const collectors = await Collector.find(filter).sort({ createdAt: -1 });

  // Attach active pickup count to each collector
  const collectorsWithStats = await Promise.all(
    collectors.map(async (collector) => {
      const activePickups = await Pickup.countDocuments({
        assignedCollector: collector._id,
        status: { $in: ['Approved', 'In Progress'] },
      });

      const totalCompleted = await Pickup.countDocuments({
        assignedCollector: collector._id,
        status: 'Completed',
      });

      return {
        ...collector.toObject(),
        activePickups,
        totalCompleted,
      };
    })
  );

  return successResponse(res, 200, 'Collectors retrieved', collectorsWithStats);
});

//admin
export const getCollectorById = asyncHandler(async (req, res) => {
  const collector = await Collector.findById(req.params.id);

  if (!collector) {
    return errorResponse(res, 404, 'Collector not found');
  }

  const activePickups = await Pickup.countDocuments({
    assignedCollector: collector._id,
    status: { $in: ['Approved', 'In Progress'] },
  });

  return successResponse(res, 200, 'Collector retrieved', {
    ...collector.toObject(),
    activePickups,
  });
});

//admin
export const toggleCollectorStatus = asyncHandler(async (req, res) => {
  const collector = await Collector.findById(req.params.id);

  if (!collector) {
    return errorResponse(res, 404, 'Collector not found');
  }


  collector.isActive = !collector.isActive;
  await collector.save();

  const action = collector.isActive ? 'activated' : 'deactivated';

  return successResponse(res, 200, `Collector ${action} successfully`, {
    _id: collector._id,
    fullName: collector.fullName,
    isActive: collector.isActive,
  });
});


//collector
export const getCollectorProfile = asyncHandler(async (req, res) => {
  const collector = await Collector.findById(req.user._id);

  if (!collector) {
    return errorResponse(res, 404, 'Collector not found');
  }

  return successResponse(res, 200, 'Profile retrieved', collector);
});


//collector
export const changeCollectorPassword = asyncHandler(async (req, res) => {
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

  const collector = await Collector.findById(req.user._id).select('+password');

  const isMatch = await collector.comparePassword(currentPassword);
  if (!isMatch) {
    return errorResponse(res, 401, 'Current password is incorrect');
  }

  collector.password = newPassword;
  await collector.save();

  return successResponse(res, 200, 'Password changed successfully');
});