const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

// Register a new admin
router.post('/register', AdminController.register);

// Login admin
router.post('/login', AdminController.login);

// Fetch all users (requires admin authentication)
router.get('/users', AdminController.getAllUsers);

// Fetch a single user by ID (requires admin authentication)
router.get('/users/:userId', AdminController.getAUser);

module.exports = router;
