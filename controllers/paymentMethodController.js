const PaymentMethod = require('../models/paymentMethodModel');
const Order = require('../models/orderModel');
const verifyAdminToken = require('../middlewares/adminAuthMiddleware');

const {
	verifyUserToken,
	findUser
} = require("../middlewares/userAuthMiddleware");


const paymentMethodController = {
	// Controller function to get all payment methods
	getAllPaymentMethods: async (req, res) => {
		try {
			const paymentMethods = await PaymentMethod.find();
			// Format the response to include only required fields
			const formattedPaymentMethods = paymentMethods.map(paymentMethod => ({
				id: paymentMethod._id,
				name: paymentMethod.name,
				code: paymentMethod.code,
				description: paymentMethod.description,
				paymentHandler: paymentMethod.paymentHandler,
				active: paymentMethod.active
			}));
			res.json({
				paymentMethods: formattedPaymentMethods
			});
		} catch (error) {
			res.status(500).json({
				error: error.message
			});
		}
	},

	// Controller function to create a new payment method
	createPaymentMethod: async (req, res) => {
		try {
			const adminToken = req.headers.authorization;
			if (!adminToken) {
				return res.status(401).json({
					error: 'Authorization token is missing'
				});
			}
			verifyAdminToken(adminToken);

			const {
				name,
				code,
				description,
				paymentHandler,
				active
			} = req.body;

			// Check if required fields are present
			if (!name || !code || !description || !paymentHandler) {
				return res.status(400).json({
					error: 'Name, code, description, and payment handler are required'
				});
			}

			// Create a new payment method instance
			const paymentMethod = new PaymentMethod({
				name,
				code,
				description,
				paymentHandler,
				active // Include the active field here
			});

			// Save the new payment method
			await paymentMethod.save();

			const formattedResponse = {
				id: paymentMethod._id,
				name: paymentMethod.name,
				code: paymentMethod.code,
				description: paymentMethod.description,
				paymentHandler: paymentMethod.paymentHandler,
				active: paymentMethod.active // Include the active field in the formatted response
			}

			// Respond with the created payment method
			res.status(201).json({
				message: 'Payment method created successfully',
				paymentMethod: formattedResponse
			});
		} catch (error) {
			// Handle errors
			res.status(400).json({
				error: error.message
			});
		}
	},

	// Controller function to get a payment method by ID
	getPaymentMethodById: async (req, res) => {
		try {
			const paymentMethod = await PaymentMethod.findById(req.params.id);
			if (!paymentMethod) {
				return res.status(404).json({
					error: 'Payment method not found'
				});
			}
			res.json(paymentMethod);
		} catch (error) {
			res.status(500).json({
				error: error.message
			});
		}
	},

	// Controller function to update a payment method
	updatePaymentMethod: async (req, res) => {
		try {
			const paymentMethod = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, {
				new: true
			});
			if (!paymentMethod) {
				return res.status(404).json({
					error: 'Payment method not found'
				});
			}
			res.json(paymentMethod);
		} catch (error) {
			res.status(400).json({
				error: error.message
			});
		}
	},

	// Controller function to delete a payment method
	deletePaymentMethod: async (req, res) => {
		try {
			const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.id);
			if (!paymentMethod) {
				return res.status(404).json({
					error: 'Payment method not found'
				});
			}
			res.json({
				message: 'Payment method deleted successfully'
			});
		} catch (error) {
			res.status(500).json({
				error: error.message
			});
		}
	},

	//Controller function to set payment method to order
	setPaymentMethodToOrder: async (req, res) => {
		try {
			const userToken = req.headers.authorization;
			if (!userToken) {
				return res.status(401).json({
					error: 'Authorization token is missing'
				});
			}

			const decodedToken = verifyUserToken(userToken);
			const user = await findUser(decodedToken);

			// Retrieve order ID from request parameters
			const orderId = req.params.orderId;

			// Retrieve payment method details from request body
			const {
				id,
				code
			} = req.body.paymentMethod;

			// Find the order associated with the user's ID and the provided order ID
			const order = await Order.findOne({
				_id: orderId,
				user: user._id
			});

			if (!order) {
				return res.status(404).json({
					error: 'Order not found'
				});
			}

			// Check if the provided payment method exists in the database
			const paymentMethod = await PaymentMethod.findOne({
				_id: id,
				code: code
			});

			if (!paymentMethod) {
				return res.status(404).json({
					error: 'Payment method not found'
				});
			}

			// Update the order with the provided payment method details
			order.paymentMethod = {
				id: id,
				code: code,
				status: "paid"
			};

			// Update order status to 'processing' and payment method status to 'paid'
			order.status = 'processing';

			// Save the updated order
			await order.save();

			const formattedOrder = {
				id: order._id,
				user: order.user,
				items: order.items,
				grandTotal: order.grandTotal,
				deliveryMethod: order.deliveryMethod,
				discount: order.discount,
				shippingAddress: order.shippingAddress,
				billingAddress: order.billingAddress,
				status: order.status,
				paymentMethod: {
					id: order.paymentMethod.id,
					code: order.paymentMethod.code,
					status: order.paymentMethod.status
				},
				createdAt: order.createdAt,
				updatedAt: order.updatedAt
			};

			res.status(200).json({
				message: 'Payment method set successfully',
				order: formattedOrder
			});

		} catch (error) {
			if (error.message === 'Invalid authorization header format' ||
				error.message === 'Invalid token' ||
				error.message === 'Token expired') {
				res.status(401).json({
					error: error.message
				});
			} else if (error.message === 'Unauthorized access' ||
				error.message === 'User not found') {
				res.status(403).json({
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

module.exports = paymentMethodController;