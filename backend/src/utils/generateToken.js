const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpire
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };