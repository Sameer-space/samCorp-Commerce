const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const verifyUserToken = (userToken, res) => {
  // Extract the token from the authorization header
  try {
  const tokenParts = userToken.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }
  const token = tokenParts[1];

  // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (error) {
    return res.status(403).json({ error: 'Unauthorized access' });    
  }
};

const findUser = async (decodedToken, res) => {
  try {
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = { verifyUserToken, findUser };
