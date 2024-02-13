const Admin = require('../models/adminModel');
const User = require('../models/userModel');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AdminController = {
    async register(req, res) {
      try {
        const { username, password, email, role, name, phone, active } = req.body;
  
        // Check if the username is already taken
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
          return res.status(400).json({ error: 'Oops! Someone already claimed that username. It\'s as popular as avocado toast!' });
        }
  
        // Check if the email is already taken
        const existingEmail = await Admin.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ error: 'Oops! This email address has already been used. Looks like someone beat you to it!' });
        }
  
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Create a new admin
        const newAdmin = new Admin({
          username,
          password: hashedPassword,
          email,
          role,
          name,
          phone,
          active,
        });
        await newAdmin.save();
  
        res.json({ message: 'Hooray! You\'ve successfully joined the admin team. Welcome aboard! 🎉' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Oops! Something went wrong on our end. Our hamsters are on it!' });
      }
    },
  
    async login(req, res) {
      try {
        const { username, password } = req.body;
  
        // Find the admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
          return res.status(401).json({ error: 'Uh-oh! Your credentials seem to be lost in cyberspace. Double-check and try again!' });
        }
  
        // Check password
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Oops! Wrong password. Don\'t worry, we all have those moments. Give it another shot!' });
        }
  
        // Generate a JWT token
        const token = jwt.sign(
          {
            userId: admin._id,
            username: admin.username,
            role: admin.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: '5h' }
        );
  
        res.json({ token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Oops! Something went wrong on our end. Our tech team is currently practicing their magic spells to fix it!' });
      }
    },
    // Fetch all users
    async getAllUsers(req, res) {
      try {
        // Check if the request is coming from an authenticated admin
        const adminToken = req.headers.authorization;
        if (!adminToken) {
          return res.status(401).json({ error: 'Authorization token is missing' });
        }

        // Extract the token from the authorization header
        const tokenParts = adminToken.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
          return res.status(401).json({ error: 'Invalid authorization header format' });
        }
        const token = tokenParts[1];

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken || decodedToken.role !== 'admin') {
          return res.status(403).json({ error: 'Unauthorized access' });
        }

        // Fetch all users from the database
        const users = await User.find();

        // Return the list of users formatted
        res.json(users.map((user) => ({
            id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            addressLine1: user.addressLine1,
            addressLine2: user.addressLine2,
            phone: user.phone
          })));
          
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
    },
    // Fetch a single user by ID
    async getAUser(req, res) {
    try {
        // Check if the request is coming from an authenticated admin
        const adminToken = req.headers.authorization;
        if (!adminToken) {
          return res.status(401).json({ error: 'Authorization token is missing' });
        }

        // Extract the token from the authorization header
        const tokenParts = adminToken.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
          return res.status(401).json({ error: 'Invalid authorization header format' });
        }
        const token = tokenParts[1];

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken || decodedToken.role !== 'admin') {
          return res.status(403).json({ error: 'Unauthorized access' });
        }

      // Extract user ID from request params
      const { userId } = req.params;

      // Find user by ID
      const user = await User.findById(userId);

      // Check if user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return the user data
      res.json({
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
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
    },
    
  };
  
module.exports = AdminController;
