const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const paymentMethodController = require('../controllers/paymentMethodController');


// Routes for orders
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId', orderController.updateOrder);
router.delete('/:orderId', orderController.deleteOrder);
router.post('/:orderId/payment', paymentMethodController.setPaymentMethodToOrder);

module.exports = router;
