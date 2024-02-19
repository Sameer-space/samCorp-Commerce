const Order = require('../models/orderModel');
const { validationResult } = require('express-validator');

const orderController = {
  createOrder: async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Create new order
      const newOrder = new Order(req.body);

      // Save the order
      await newOrder.save();

      res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      // Retrieve all orders
      const orders = await Order.find();

      res.status(200).json({ orders });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const orderId = req.params.orderId;

      // Find order by ID
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json({ order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const orderId = req.params.orderId;

      // Find order by ID and update
      const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true });

      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const orderId = req.params.orderId;

      // Find order by ID and delete
      const deletedOrder = await Order.findByIdAndDelete(orderId);

      if (!deletedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json({ message: 'Order deleted successfully', order: deletedOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = orderController;
