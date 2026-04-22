import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiry
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiry
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwtAccessSecret);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.jwtRefreshSecret);
  } catch (error) {
    return null;
  }
};

export const generateTokens = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId)
  };
};