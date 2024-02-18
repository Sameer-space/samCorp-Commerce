const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const AddressController = require('../controllers/addressController'); // Import the AddressController

// Register a new user
router.post('/register', UserController.register);

// Login user
router.post('/login', UserController.login);

// Fetch user info by token
router.get('/me', UserController.getUserInfoByToken);

// Add routes for managing addresses
router.post('/me/address', AddressController.createAddress);
router.get('/me/address', AddressController.getAllAddresses);
router.get('/me/address/:addressId', AddressController.getAddressById);
router.put('/me/address/:addressId', AddressController.updateAddress);
router.delete('/me/address/:addressId', AddressController.deleteAddress);

module.exports = router;
