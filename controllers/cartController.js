const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User  = require("../models/userModel");
const jwt = require('jsonwebtoken');


function verifyUserToken(userToken,res){
    
    // Extract the token from the authorization header
    const tokenParts = userToken.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization header format' });
    }
    const token = tokenParts[1];
  
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    return decodedToken;
  
};

async function findUser(decodedToken,res) {
    try {
      const user = await User.findById(decodedToken.userId);  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
      return user;
    } catch (error) {
      throw error;
    }
};
  

const cartController = {
  addToCart: async (req, res) => {
    try {
      // Check if the request is coming from an authenticated user
        const userToken = req.headers.authorization;
        if (!userToken) {
          return res.status(401).json({ error: 'Authorization token is missing' });
        }    
        const decodedToken = verifyUserToken(userToken,res);
        // Find the user by userId from the decoded token
        const user = findUser(decodedToken,res);
      const { productId, variantId, quantity } = req.body;
        
      // Validate input data
      if (!productId || !variantId || !quantity || quantity < 1) {
        return res.status(400).json({ error: 'Invalid input data' });
      }

      // Fetch product details
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Find the variant in the product variants array
      const variant = product.variants.find(v => v._id.equals(variantId));
      if (!variant) {
        return res.status(404).json({ error: 'Product variant not found' });
      }

      // Calculate total price
      const totalPrice = variant.price * quantity;

      // Create or update user's cart
      let cart = await Cart.findOne({ user: user._id });
      if (!cart) {
        cart = new Cart({ user: user._id, items: [] });
      }

      // Check if the item already exists in the cart
      const existingItem = cart.items.find(item => item.productId.equals(productId) && item.variantId.equals(variantId));
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price += totalPrice;
      } else {
        cart.items.push({ productId, variantId, quantity, price: totalPrice });
      }

      // Save the cart
      await cart.save();

      // Return success response
      res.status(200).json({ message: 'Product added to cart successfully', cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getCart: async (req, res) => {
    try {
        const userToken = req.headers.authorization;
        if (!userToken) {
          return res.status(401).json({ error: 'Authorization token is missing' });
        }    
        const decodedToken = verifyUserToken(userToken,res);
        
        // Find the user by userId from the decoded token
        const user = await findUser(decodedToken,res);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the user's cart and populate items with product details
        const cart = await Cart.findOne({ user: user._id }).populate('items.productId');
        
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
},

  updateCartItem: async(req, res) => {  
    try {
        const userToken = req.headers.authorization;
        if (!userToken) {
          return res.status(401).json({ error: 'Authorization token is missing' });
        }    
        const decodedToken = verifyUserToken(userToken,res);
        // Find the user by userId from the decoded token
        const user = findUser(decodedToken,res);
        const { itemId, quantity } = req.body;

      // Validate input data
      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Invalid quantity' });
      }

      // Update item quantity in the cart
      const updatedCart = await Cart.findOneAndUpdate(
        { 'items._id': itemId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true }
      );

      if (!updatedCart) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      // Return updated cart
      res.json({ message: 'Cart item quantity updated successfully', cart: updatedCart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  removeFromCart: async (req, res) => {
    try {
        const userToken = req.headers.authorization;
        if (!userToken) {
          return res.status(401).json({ error: 'Authorization token is missing' });
        }    
        const decodedToken = verifyUserToken(userToken,res);
        // Find the user by userId from the decoded token
        const user = findUser(decodedToken,res);  
        const itemId = req.params.itemId;

      // Find user's cart and remove item
      const cart = await Cart.findOneAndUpdate(
        { user: user._id },
        { $pull: { items: { _id: itemId } } },
        { new: true }
      );

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      res.json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  clearCart: async (req, res) => {
    try {
        const userToken = req.headers.authorization;
        if (!userToken) {
          return res.status(401).json({ error: 'Authorization token is missing' });
        }    
        const decodedToken = verifyUserToken(userToken,res);
        // Find the user by userId from the decoded token
        const user = findUser(decodedToken,res); 
      // Find user's cart and remove all items
      const cart = await Cart.findOneAndUpdate(
        { user: user._id },
        { $set: { items: [] } },
        { new: true }
      );

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      res.json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = cartController;
