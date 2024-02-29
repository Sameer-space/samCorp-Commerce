const jwt = require('jsonwebtoken');

const verifyAdminToken = (adminToken) => {
  try {
    // Extract the token from the authorization header
    const tokenParts = adminToken.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }
    const token = tokenParts[1];

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || decodedToken.role !== 'admin') {
      throw new Error('Unauthorized access');
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw error;
  }
};

module.exports = verifyAdminToken;
