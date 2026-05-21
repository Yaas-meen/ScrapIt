import Pickup from '../models/Pickup.model.js';
import User from '../models/User.model.js';
import Collector from '../models/Collector.model.js';
import Reward from '../models/Reward.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';


export const getDashboardStats = asyncHandler(async (req, res) => {

  const [
    pickupStatusCounts,
    totalUsers,
    totalCollectors,
    weeklyTrend,
    recentPickups,
  ] = await Promise.all([

    Pickup.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),


    User.countDocuments({ role: 'user' }),


    Collector.countDocuments(),

    Pickup.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Last 10 pickups with user and collector info for the recent table
    Pickup.find()
      .populate('user', 'fullName email')
      .populate('assignedCollector', 'fullName')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const statusMap = {
    Pending: 0,
    Approved: 0,
    'In Progress': 0,
    Completed: 0,
    Rejected: 0,
  };

  pickupStatusCounts.forEach(({ _id, count }) => {
    if (statusMap.hasOwnProperty(_id)) {
      statusMap[_id] = count;
    }
  });

  const totalPickups = Object.values(statusMap).reduce((a, b) => a + b, 0);

  // Fill in missing days in the weekly trend so the chart has 7 data points
  const trendMap = {};
  weeklyTrend.forEach(({ _id, count }) => {
    trendMap[_id] = count;
  });

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    last7Days.push({
      date: key,
      // label: "Mon", "Tue", etc.
      day: date.toLocaleDateString('en-NG', { weekday: 'short' }),
      count: trendMap[key] || 0,
    });
  }

  return successResponse(res, 200, 'Dashboard stats retrieved', {
    stats: {
      totalPickups,
      ...statusMap,
      totalUsers,
      totalCollectors,
    },
    weeklyTrend: last7Days,
    recentPickups,
  });
});



export const getStatusChartData = asyncHandler(async (req, res) => {
  const data = await Pickup.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const chartData = data.map(({ _id, count }) => ({
    status: _id,
    count,
  }));

  return successResponse(res, 200, 'Status chart data retrieved', chartData);
});



export const getActivityLog = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const pickups = await Pickup.find({ 'statusLog.1': { $exists: true } })
    .populate('user', 'fullName')
    .lean('statusLog.changedBy')
    .sort({ updatedAt: -1 })
    .limit(Number(limit));

  const activities = [];

  pickups.forEach((pickup) => {
    pickup.statusLog.forEach((log) => {
      // Skip pending
      if (log.changedByModel === 'User' && log.status === 'Pending') return;

      activities.push({
        pickupId: pickup._id,
        requestId: `PK-${pickup._id.toString().slice(-6).toUpperCase()}`,
        userName: pickup.user?.fullName || 'Unknown user',
        status: log.status,
        changedByModel: log.changedByModel,
        note: log.note,
        timestamp: log.createdAt,
      });
    });
  });

  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return successResponse(res, 200, 'Activity log retrieved', activities.slice(0, Number(limit)));
});


export const getUserSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [user, pickups, rewards] = await Promise.all([
    User.findById(id),
    Pickup.find({ user: id }).sort({ createdAt: -1 }),
    Reward.find({ user: id }).sort({ createdAt: -1 }),
  ]);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const completedPickups = pickups.filter((p) => p.status === 'Completed');
  const completionRate = pickups.length > 0
    ? Math.round((completedPickups.length / pickups.length) * 100)
    : 0;

  return successResponse(res, 200, 'User summary retrieved', {
    user,
    pickups,
    rewards,
    summary: {
      totalPickups: pickups.length,
      completedPickups: completedPickups.length,
      completionRate,
      totalPointsEarned: user.totalPointsEarned,
      totalPointsSpent: user.totalPointsSpent,
      currentBalance: user.points,
      memberSince: user.createdAt,
    },
  });
});