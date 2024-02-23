const express = require('express');
const router = express.Router();
const deliveryMethodController = require('../controllers/deliveryMethodController');

// GET all delivery methods
router.get('/', deliveryMethodController.getAllDeliveryMethods);

// GET a single delivery method by ID
router.get('/:id', deliveryMethodController.getDeliveryMethodById);

// POST a new delivery method
router.post('/', deliveryMethodController.createDeliveryMethod);

// PUT update a delivery method by ID
router.put('/:id', deliveryMethodController.updateDeliveryMethodById);

// DELETE a delivery method by ID
router.delete('/:id', deliveryMethodController.deleteDeliveryMethodById);

module.exports = router;
