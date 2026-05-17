import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Collector from '../models/Collector.model.js';
import asyncHandler from '../utils/asyncHandler.js';


export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorised — please log in',
    });
  }

  // Verify signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired — please refresh your token',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  
  let account;

  if (decoded.role === 'collector') {
    account = await Collector.findById(decoded.id).select('-password -refreshToken');
    if (account && !account.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your collector account has been deactivated',
      });
    }
  } else {
    account = await User.findById(decoded.id).select('-password -refreshToken');
  }

  if (!account) {
    return res.status(401).json({
      success: false,
      message: 'Account no longer exists',
    });
  }

  if (!account.role) {
    account.role = decoded.role;
  }
  req.user = account;
  next();
});




export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — '${req.user.role}' role cannot access this resource`,
      });
    }

    next();
  };
};