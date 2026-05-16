import User from '../models/User.model.js';
import Collector from '../models/Collector.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generateToken.js';


export const findAccountByEmail = async (email, model = 'user') => {
  if (model === 'collector') {
    return await Collector.findOne({ email }).select('+password +refreshToken');
  }
  return await User.findOne({ email }).select('+password +refreshToken');
};


export const issueTokens = async (account) => {
  const accessToken = generateAccessToken(account._id, account.role || 'collector');
  const refreshToken = generateRefreshToken(account._id, account.role || 'collector');

  account.refreshToken = refreshToken;
  await account.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

//remove sensitive data before sending to frontend
export const sanitiseAccount = (account) => {
  const obj = account.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};