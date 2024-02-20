const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const verifyUserToken = (userToken, res) => {
  // Extract the token from the authorization header
  const tokenParts = userToken.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Invalid authorization header format' });
    return null;
  }
  const token = tokenParts[1];

  // Verify the token
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (error) {
    res.status(403).json({ error: 'Unauthorized access' });
    return null;
  }
};

const findUser = async (decodedToken, res) => {
  try {
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return null;
    }
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = { verifyUserToken, findUser };
