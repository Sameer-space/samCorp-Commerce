const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');

// Define routes for payment methods
router.get('/', paymentMethodController.getAllPaymentMethods);
router.post('/', paymentMethodController.createPaymentMethod);
router.get('/:id', paymentMethodController.getPaymentMethodById);
router.put('/:id', paymentMethodController.updatePaymentMethod);
router.delete('/:id', paymentMethodController.deletePaymentMethod);

module.exports = router;
