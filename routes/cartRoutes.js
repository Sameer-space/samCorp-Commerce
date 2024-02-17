const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Add item to cart
router.post('/', cartController.addToCart);

// Get user's cart
router.get('/', cartController.getCart);

// Remove item from cart
router.delete('/item/:itemId', cartController.removeFromCart);

// Clear user's cart
router.delete('/clear', cartController.clearCart);

// Update item quantity in cart
router.put('/', cartController.updateCartItem);

module.exports = router;
