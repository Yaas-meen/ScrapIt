import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Collector from '../models/Collector.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import {
  findAccountByEmail,
  issueTokens,
  sanitiseAccount,
} from '../services/auth.service.js';

// Helper function
const sendTokenResponse = (res, statusCode, message, account, accessToken, refreshToken) => {
  // Store refresh token in httpOnly cookie (not accessible by JS)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  return successResponse(res, statusCode, message, {
    accessToken,
    user: sanitiseAccount(account),
  });
};


export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, confirmPassword } = req.body;

  if (!fullName || !email || !password) {
    return errorResponse(res, 400, 'Full name, email and password are required');
  }

  if (password !== confirmPassword) {
    return errorResponse(res, 400, 'Passwords do not match');
  }

  if (password.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return errorResponse(res, 400, 'An account with this email already exists');
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    phone: phone || null,
    password,
    role: 'user',
  });

  const { accessToken, refreshToken } = await issueTokens(user);

  return sendTokenResponse(res, 201, 'Account created successfully', user, accessToken, refreshToken);
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required');
  }

  const user = await findAccountByEmail(email.toLowerCase(), 'user');

  if (!user || !(await user.comparePassword(password))) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  if (user.role !== 'user') {
    return errorResponse(res, 403, 'Please use the correct login portal');
  }

  const { accessToken, refreshToken } = await issueTokens(user);

  return sendTokenResponse(res, 200, 'Login successful', user, accessToken, refreshToken);
});


export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required');
  }

  const admin = await findAccountByEmail(email.toLowerCase(), 'user');

  if (!admin || !(await admin.comparePassword(password))) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  if (admin.role !== 'admin') {
    return errorResponse(res, 403, 'Access denied — admin accounts only');
  }

  const { accessToken, refreshToken } = await issueTokens(admin);

  return sendTokenResponse(res, 200, 'Admin login successful', admin, accessToken, refreshToken);
});


export const loginCollector = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required');
  }

  const collector = await findAccountByEmail(email.toLowerCase(), 'collector');

  if (!collector || !(await collector.comparePassword(password))) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  if (!collector.isActive) {
    return errorResponse(res, 403, 'Your account has been deactivated. Contact the admin.');
  }

  const { accessToken, refreshToken } = await issueTokens(collector);

  return sendTokenResponse(res, 200, 'Collector login successful', collector, accessToken, refreshToken);
});


export const refreshToken = asyncHandler(async (req, res) => {

  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return errorResponse(res, 401, 'No refresh token provided');
  }


  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return errorResponse(res, 401, 'Invalid or expired refresh token');
  }

  // Find the account and confirm the stored refresh token matches
  let account;

  if (decoded.role === 'collector') {
    account = await Collector.findById(decoded.id).select('+refreshToken');
  } else {
    account = await User.findById(decoded.id).select('+refreshToken');
  }

  if (!account || account.refreshToken !== token) {
    return errorResponse(res, 401, 'Refresh token is invalid or has been revoked');
  }

  // new pair of tokens
  const { accessToken, refreshToken: newRefreshToken } = await issueTokens(account);

  return sendTokenResponse(
    res,
    200,
    'Token refreshed successfully',
    account,
    accessToken,
    newRefreshToken
  );
});


export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (token) {
    // Invalidate the stored refresh token so it can't be reused
    const decoded = jwt.decode(token);

    if (decoded?.id) {
      if (decoded.role === 'collector') {
        await Collector.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } else {
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      }
    }
  }

  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return successResponse(res, 200, 'Logged out successfully');
});

//get all current logged in info
export const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'Account retrieved', sanitiseAccount(req.user));
});