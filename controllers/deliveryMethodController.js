const DeliveryMethod = require('../models/deliveryMethodModel');
const verifyAdminToken = require('../middlewares/adminAuthMiddleware');


const deliveryMethodController = {
	getAllDeliveryMethods: async (req, res) => {
		try {
			// Retrieve all delivery methods from the database
			const deliveryMethods = await DeliveryMethod.find();

			// Format the response
			const formattedDeliveryMethods = deliveryMethods.map(method => {
				return {
					id: method._id,
					name: method.name,
					description: method.description,
					estimatedDeliveryTime: method.estimatedDeliveryTime,
					availability: method.availability,
					price: method.price,
					deliveryRestrictions: method.deliveryRestrictions,
					deliveryCarrier: method.deliveryCarrier
				};
			});

			// Send the formatted response
			res.status(200).json({
				deliveryMethods: formattedDeliveryMethods
			});
		} catch (error) {
			// Handle errors
			console.error('Error in getAllDeliveryMethods:', error);
			res.status(500).json({
				error: 'Internal server error'
			});
		}
	},

	getDeliveryMethodById: async (req, res) => {
		try {
			// Logic to retrieve a single delivery method by ID from the database
		} catch (error) {
			// Handle errors
		}
	},

	createDeliveryMethod: async (req, res) => {
		try {
			// Check if the request is coming from an authenticated admin
			const adminToken = req.headers.authorization;
			if (!adminToken) {
				return res.status(401).json({
					error: 'Authorization token is missing'
				});
			}
			verifyAdminToken(adminToken);
			// Extract data from the request body
			const {
				name,
				description,
				estimatedDeliveryTime,
				availability,
				price,
				deliveryRestrictions,
				deliveryCarrier
			} = req.body;
			if (!name || !description || !estimatedDeliveryTime || !availability || !price || !deliveryRestrictions || !deliveryCarrier) {
				return res.status(400).json({
					error: 'Missing required fields in the request body'
				});
			}
			// Create a new delivery method object
			const newDeliveryMethod = new DeliveryMethod({
				name,
				description,
				estimatedDeliveryTime,
				availability,
				price,
				deliveryRestrictions,
				deliveryCarrier
			});

			// Save the new delivery method to the database
			await newDeliveryMethod.save();

			const formattedDeliveryMethod = {
				id: newDeliveryMethod._id,
				name: newDeliveryMethod.name,
				description: newDeliveryMethod.description,
				estimatedDeliveryTime: newDeliveryMethod.estimatedDeliveryTime,
				availability: newDeliveryMethod.availability,
				price: newDeliveryMethod.price,
				deliveryRestrictions: newDeliveryMethod.deliveryRestrictions,
				deliveryCarrier: newDeliveryMethod.deliveryCarrier
			}

			res.status(201).json({
				message: 'Delivery method created successfully',
				deliveryMethod: formattedDeliveryMethod
			});
		} catch (error) {
			if (error.message === 'Invalid token') {
				return res.status(401).json({
					error: 'Invalid token'
				});
			}
			if (error.message === 'Token expired') {
				return res.status(401).json({
					error: 'Token expired'
				});
			}
			if (error.message === 'Unauthorized access') {
				return res.status(401).json({
					error: 'Unauthorized access'
				});
			}
			return res.status(500).json({
				error: 'Internal server error'
			});
		}
	},

	updateDeliveryMethodById: async (req, res) => {
		try {
			// Logic to update a delivery method by ID in the database
		} catch (error) {
			// Handle errors
		}
	},

	deleteDeliveryMethodById: async (req, res) => {
		try {
			// Logic to delete a delivery method by ID from the database
		} catch (error) {
			// Handle errors
		}
	}
};

module.exports = deliveryMethodController;