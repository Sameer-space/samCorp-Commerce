const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserController = {
  async register(req, res) {
    try {
      const { username, password, name, email, phone, addressLine1, addressLine2 } = req.body;

      // Check if the username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Check if the email is already taken
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({
        username,
        password: hashedPassword,
        name,
        email,
        phone,
        addressLine1,
        addressLine2,
      });
      await newUser.save();

      res.json({ message: 'Registration successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Find the user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ error: 'Uh-oh! It seems like something went wrong. Your username or password might have wandered off into the digital abyss. Take a moment to double-check them and try again. If the problem persists, don\'t hesitate to reach out to our friendly support team!' });
      }
      

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Uh-oh! It seems like something went wrong. Your username or password might have wandered off into the digital abyss. Take a moment to double-check them and try again. If the problem persists, don\'t hesitate to reach out to our friendly support team!' });
      }

      // Generate a JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          addressLine1: user.addressLine1,
          addressLine2: user.addressLine2,
        },
        process.env.JWT_SECRET,
        { expiresIn: '5h' }
      );
      
      // Create a formatted expiration time string
      const expiresInHours = 5;
      const expirationMessage = `${expiresInHours} hours`;
      
      // Craft a message related to SamCorp Commerce
      const welcomeMessage = `Welcome ${user.name} to SamCorp Commerce! 🎉 You've successfully gained access to our exclusive digital marketplace. Here's your passport to explore our world:`;
      
      // Create an object to hold expiration details
      const expirationDetails = { expiresIn: expirationMessage };
      
      // Construct the response object
      const response = {
        message: welcomeMessage,
        token,
        expiration: expirationDetails
      };
      
      // Send the response
      res.json(response);
      
          } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  // Fetch user info by token
  async getUserInfoByToken(req, res) {
    try {
      // Check if the request is coming from an authenticated user
      const userToken = req.headers.authorization;
      if (!userToken) {
        return res.status(401).json({ error: 'Authorization token is missing' });
      }
    
      // Extract the token from the authorization header
      const tokenParts = userToken.split(' ');
      if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Invalid authorization header format' });
      }
      const token = tokenParts[1];
    
      // Verify the token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (!decodedToken) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

        // Find the user by userId from the decoded token
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return the user information
        return res.json({
            id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            addressLine1: user.addressLine1,
            addressLine2: user.addressLine2,
            phone: user.phone
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
}
};

module.exports = UserController;
