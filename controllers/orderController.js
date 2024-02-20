const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User  = require("../models/userModel");
const Address  = require("../models/addressModel");
const {verifyUserToken,findUser} = require("../middlewares/userAuthMiddleware")



const orderController = {
   createOrder : async (req, res) => {
    try {
      const userToken = req.headers.authorization;
      if (!userToken) {
        return res.status(401).json({ error: 'Authorization token is missing' });
      }    
      const decodedToken = verifyUserToken(userToken, res);
      
      // Find the user by userId from the decoded token
      const user = await findUser(decodedToken, res);
  
      const userId = user._id; // Assuming you have middleware to extract user ID from token
  
      // Find the user's cart
      const cart = await Cart.findOne({ user: userId }).populate('items.productId');
  
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
  
      // Calculate grand total of all items in the cart
      const grandTotal = cart.items.reduce((acc, item) => acc + item.price, 0);
  
      // Extract shipping and billing addresses from request body
      const { shippingAddress, billingAddress } = req.body;
  
      // Check if shipping address ID is provided
      let shippingAddr;
      if (shippingAddress.id) {
        shippingAddr =  user.addresses.find(address => address._id.toString() === shippingAddress.id);
        if (!shippingAddr) {
          return res.status(404).json({ error: 'Shipping address not found' });
        }
      } else {
        // Create a new shipping address for the user
        shippingAddr = new Address({
            user: userId,
            streetAddress: shippingAddress.streetAddress,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            phoneNumber: shippingAddress.phoneNumber
        });
        await shippingAddr.save();
    }
  
      // Check if billing address ID is provided
      let billingAddr;
      if (billingAddress.id) {
        billingAddr = user.addresses.find(address => address._id.toString() === billingAddress.id);;
        if (!billingAddr) {
          return res.status(404).json({ error: 'Billing address not found' });
        }
      } else {
        // Create a new billing address for the user
        billingAddr = new Address({
            user: userId,
            streetAddress: billingAddress.streetAddress,
            city: billingAddress.city,
            state: billingAddress.state,
            postalCode: billingAddress.postalCode,
            country: billingAddress.country,
            phoneNumber: billingAddress.phoneNumber
        });
        await billingAddr.save();
    }
  
      // Create the order
      const newOrder = new Order({
        user: userId,
        items: cart.items,
        grandTotal,
        shippingAddress: shippingAddr,
        billingAddress: billingAddr,
        status: 'pending' // Assuming default status is pending
      });
  
      // Save the order
      await newOrder.save();
  
      // Clear the user's cart
      await Cart.deleteOne({ user: userId });

      const orderResponse = {
        id: newOrder._id,
        items: newOrder.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price
        })),
        grandTotal: newOrder.grandTotal,
        shippingAddress: newOrder.shippingAddress,
        billingAddress: newOrder.billingAddress,
        status: newOrder.status,
        createdAt: newOrder.createdAt,
        updatedAt: newOrder.updatedAt
    };
  
      res.status(201).json({ message: 'Order created successfully', order: orderResponse });
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
