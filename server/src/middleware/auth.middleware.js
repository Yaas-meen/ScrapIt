import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.model.js';
import Collector from '../models/Collector.model.js';


export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorised, no token' });
  }

  const token = authHeader.split(' ')[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Look up the user or collector depending on their role in the token
  if (decoded.role === 'collector') {
    req.user = await Collector.findById(decoded.id).select('-password -refreshToken');
  } else {
    req.user = await User.findById(decoded.id).select('-password -refreshToken');
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  next();
});

/**
 * Role-based access control.
 * Usage: authorize('admin') or authorize('admin', 'collector')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not allowed to access this route`,
      });
    }
    next();
  };
};