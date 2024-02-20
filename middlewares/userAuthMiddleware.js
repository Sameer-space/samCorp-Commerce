const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const verifyUserToken = (userToken) => {
  try {
    const tokenParts = userToken.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }
    const token = tokenParts[1];

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Unauthorized access');
  }
};

const findUser = async (decodedToken) => {
  try {
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = { verifyUserToken, findUser };
