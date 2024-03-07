const moment = require('moment');
const Discount = require('../models/discountModel');
const verifyAdminToken = require('../middlewares/adminAuthMiddleware');


const discountController = {
	getAllDiscounts: async (req, res) => {
		try {
			// Logic to retrieve all discounts from the database
			const discounts = await Discount.find();
			const formattedDiscounts = discounts.map(discount => ({
				id: discount._id,
				code: discount.code,
				description: discount.description,
				value: discount.value,
				type: discount.type,
				startdate: discount.startDate ? moment(discount.startDate).format("YYYY-MM-DD") : '',
				endDate: discount.endDate ? moment(discount.endDate).format("YYYY-MM-DD") : '',
				usability: discount.usability
			}));
			res.status(200).json({
				discounts: formattedDiscounts
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				error: 'Internal server error'
			});
		}
	},

	getDiscountById: async (req, res) => {
		try {
			// Logic to retrieve a single discount by ID from the database
		} catch (error) {
			// Handle errors
		}
	},

	createDiscount: async (req, res) => {
		try {
			// Check if the request is coming from an authenticated admin
			const adminToken = req.headers.authorization;
			if (!adminToken) {
				return res.status(401).json({
					error: 'Authorization token is missing'
				});
			}
			verifyAdminToken(adminToken);
			// Extract discount details from the request body
			const {
				code,
				description,
				value,
				type,
				startDate,
				endDate,
				usability
			} = req.body;
			if (!code || !value || !type || !startDate || !endDate || !usability) {
				return res.status(400).json({
					error: 'Missing required fields in the request body'
				});
			}
			// Parse start and end dates using moment.js
			const parsedStartDate = moment(startDate, moment.ISO_8601, true);
			const parsedEndDate = moment(endDate, moment.ISO_8601, true);

			// Validate start and end dates
			if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
				return res.status(400).json({
					error: 'Invalid date format'
				});
			}
			// Check if start date is before today
			if (parsedStartDate.isBefore(moment().startOf('day'))) {
				return res.status(400).json({
					error: 'Start date cannot be before today'
				});
			}
			// Check if end date is before start date
			if (parsedEndDate.isBefore(parsedStartDate)) {
				return res.status(400).json({
					error: 'End date cannot be before start date'
				});
			}

			// Create a new discount object
			const newDiscount = new Discount({
				code,
				description,
				value,
				type,
				startDate: parsedStartDate.toDate(), // Convert moment object to Date object
				endDate: parsedEndDate.toDate(), // Convert moment object to Date object
				usability
			});

			// Save the new discount to the database
			const savedDiscount = await newDiscount.save();

			const formattedDiscount = {
				id: savedDiscount._id,
				code: savedDiscount.code,
				description: savedDiscount.description,
				value: savedDiscount.value,
				type: savedDiscount.type,
				startDate: savedDiscount.startDate ? moment(savedDiscount.startDate).format("YYYY-MM-DD") : '',
				endDate: savedDiscount.endDate ? moment(savedDiscount.endDate).format("YYYY-MM-DD") : '',
				usability: savedDiscount.usability,
				createdAt: savedDiscount.createdAt,
				updatedAt: savedDiscount.updatedAt
			};

			res.status(201).json({
				message: 'Discount created successfully',
				discount: formattedDiscount
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

	updateDiscountById: async (req, res) => {
		try {
			// Logic to update a discount by ID in the database
		} catch (error) {
			// Handle errors
		}
	},

	deleteDiscountById: async (req, res) => {
		try {
			// Logic to delete a discount by ID from the database
		} catch (error) {
			// Handle errors
		}
	}
};

module.exports = discountController;