const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
	verifyUserToken,
	findUser
} = require("../middlewares/userAuthMiddleware")



const UserController = {
	async register(req, res) {
		try {
			const {
				username,
				password,
				name,
				email,
				phone,
				address
			} = req.body;

			// Check if the username is already taken
			const existingUser = await User.findOne({
				username
			});
			if (existingUser) {
				return res.status(400).json({
					error: 'Username already taken'
				});
			}

			// Check if the email is already taken
			const existingEmail = await User.findOne({
				email
			});
			if (existingEmail) {
				return res.status(400).json({
					error: 'Email already in use'
				});
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
			});

			// If address is provided, add it to the user's addresses and mark it as default
			if (address) {
				const newAddress = {
					streetAddress: address.streetAddress,
					city: address.city,
					state: address.state,
					postalCode: address.postalCode,
					country: address.country,
					phoneNumber: address.phoneNumber,
					isDefault: true
				};
				newUser.addresses.push(newAddress);
			}

			await newUser.save();

			res.status(201).json({
				message: 'Registration successful'
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				error: 'Internal server error'
			});
		}
	},

	async login(req, res) {
		try {
			const {
				username,
				password
			} = req.body;

			// Find the user by username
			const user = await User.findOne({
				username
			});
			if (!user) {
				return res.status(401).json({
					error: 'Uh-oh! It seems like something went wrong. Your username or password might have wandered off into the digital abyss. Take a moment to double-check them and try again. If the problem persists, don\'t hesitate to reach out to our friendly support team!'
				});
			}


			// Check password
			const passwordMatch = await bcrypt.compare(password, user.password);
			if (!passwordMatch) {
				return res.status(401).json({
					error: 'Uh-oh! It seems like something went wrong. Your username or password might have wandered off into the digital abyss. Take a moment to double-check them and try again. If the problem persists, don\'t hesitate to reach out to our friendly support team!'
				});
			}

			// Generate a JWT token
			const token = jwt.sign({
					userId: user._id,
					username: user.username,
					name: user.name,
					email: user.email,
					phone: user.phone,
					addressLine1: user.addressLine1,
					addressLine2: user.addressLine2,
				},
				process.env.JWT_SECRET, {
					expiresIn: '5h'
				}
			);

			// Create a formatted expiration time string
			const expiresInHours = 5;
			const expirationMessage = `${expiresInHours} hours`;

			// Craft a message related to SamCorp Commerce
			const welcomeMessage = `Welcome ${user.name} to SamCorp Commerce! 🎉 You've successfully gained access to our exclusive digital marketplace. Here's your passport to explore our world:`;

			// Create an object to hold expiration details
			const expirationDetails = {
				expiresIn: expirationMessage
			};

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
			res.status(500).json({
				error: 'Internal server error'
			});
		}
	},
	// Fetch user info by token
	async getUserInfoByToken(req, res) {
		try {
			// Check if the request is coming from an authenticated user
			const userToken = req.headers.authorization;
			if (!userToken) {
				return res.status(401).json({
					error: 'Authorization token is missing'
				});
			}
			const decodedToken = verifyUserToken(userToken);
			// Find the user by userId from the decoded token
			const user = findUser(decodedToken);

			// Return the user information
			const meData = {
				id: user._id,
				username: user.username,
				name: user.name,
				email: user.email,
				phone: user.phone,
				address: user.addresses ? user.addresses.map(address => ({
					id: address._id,
					streetAddress: address.streetAddress,
					city: address.city,
					state: address.state,
					postalCode: address.postalCode,
					country: address.country,
					phoneNumber: address.phoneNumber,
					isDefault: address.isDefault
				})) : []
			};


			return res.json({
				me: meData
			});
		} catch (error) {
			if (error.message === 'Invalid authorization header format' ||
				error.message === 'Invalid token' ||
				error.message === 'Token expired') {
				res.status(401).json({
					error: error.message
				});
			} else if (error.message === 'User not found') {
				res.status(404).json({
					error: error.message
				});
			} else {
				console.error('Internal server error:', error);
				res.status(500).json({
					error: 'Internal server error'
				});
			}
		}
	}
};

module.exports = UserController;