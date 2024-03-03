const PaymentMethod = require('../models/paymentMethodModel');

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
            res.json({paymentMethods:formattedPaymentMethods});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Controller function to create a new payment method
    createPaymentMethod: async (req, res) => {
        try {
            const { name, code, description, paymentHandler, active } = req.body;
            
            // Check if required fields are present
            if (!name || !code || !description || !paymentHandler) {
                return res.status(400).json({ error: 'Name, code, description, and payment handler are required' });
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
            res.status(201).json({ message: 'Payment method created successfully', paymentMethod: formattedResponse });
        } catch (error) {
            // Handle errors
            res.status(400).json({ error: error.message });
        }
    },

    // Controller function to get a payment method by ID
    getPaymentMethodById: async (req, res) => {
        try {
            const paymentMethod = await PaymentMethod.findById(req.params.id);
            if (!paymentMethod) {
                return res.status(404).json({ error: 'Payment method not found' });
            }
            res.json(paymentMethod);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Controller function to update a payment method
    updatePaymentMethod: async (req, res) => {
        try {
            const paymentMethod = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!paymentMethod) {
                return res.status(404).json({ error: 'Payment method not found' });
            }
            res.json(paymentMethod);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Controller function to delete a payment method
    deletePaymentMethod: async (req, res) => {
        try {
            const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.id);
            if (!paymentMethod) {
                return res.status(404).json({ error: 'Payment method not found' });
            }
            res.json({ message: 'Payment method deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = paymentMethodController;
