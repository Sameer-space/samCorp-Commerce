const moment = require('moment');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Address = require("../models/addressModel");
const Discount = require("../models/discountModel");
const DeliveryMethod = require("../models/deliveryMethodModel");
const {
    verifyUserToken,
    findUser
} = require("../middlewares/userAuthMiddleware")

const orderController = {
    createOrder: async (req, res) => {
        try {
            const userToken = req.headers.authorization;
            if (!userToken) {
                return res.status(401).json({
                    error: 'Authorization token is missing'
                });
            }

            const decodedToken = verifyUserToken(userToken, res);
            const user = await findUser(decodedToken, res);
            const userId = user._id;

            const cart = await Cart.findOne({
                user: userId
            }).populate('items.productId');
            if (!cart) {
                return res.status(404).json({
                    error: 'Cart not found'
                });
            }
            if (cart.items.length === 0) {
                return res.status(400).json({
                    error: 'Your cart is empty.'
                });
            }

            // Calculate the initial grand total without any discounts
            let grandTotal = cart.items.reduce((acc, item) => acc + item.price, 0);

            const {
                shippingAddress,
                billingAddress,
                deliveryMethodId,
                discountCode
            } = req.body;

            let shippingAddr;
            if (shippingAddress.id) {
                shippingAddr = user.addresses.find(address => address._id.toString() === shippingAddress.id);
                if (!shippingAddr) {
                    return res.status(404).json({
                        error: 'Shipping address not found'
                    });
                }
            } else {
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

            let billingAddr;
            if (billingAddress.id) {
                billingAddr = user.addresses.find(address => address._id.toString() === billingAddress.id);
                if (!billingAddr) {
                    return res.status(404).json({
                        error: 'Billing address not found'
                    });
                }
            } else {
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

            const deliveryMethod = await DeliveryMethod.findById(deliveryMethodId);
            if (!deliveryMethod) {
                return res.status(404).json({
                    error: 'Delivery method not found'
                });
            }

            // Add shipping price to the grand total
            grandTotal += deliveryMethod.price;

            let discountAmount = 0;
            let discount;
            if (discountCode) {
                // Query the database to find the discount with the provided discount code
                discount = await Discount.findOne({
                    code: discountCode
                });
                const startDate = discount.startDate;
                const endDate = discount.endDate;

                // Check if the discount exists and is valid
                if (!discount) {
                    return res.status(404).json({ error: 'Discount not found' });
                }
                
                if ((startDate && moment().isBefore(startDate)) || (endDate && moment().isAfter(endDate))) {
                    return res.status(400).json({ error: 'Discount is not valid' });
                }
                
                if (discount.usability <= 0) {
                    return res.status(400).json({ error: 'Discount has been fully used' });
                }
                

                // Apply the discount based on its type
                if (discount.type === 'percentage') {
                    discountAmount = (discount.value / 100) * grandTotal;
                } else if (discount.type === 'fixed') {
                    discountAmount = discount.value;
                }

                // Ensure the discount amount doesn't exceed the grand total
                discountAmount = Math.min(discountAmount, grandTotal);

                // Decrease the usability of the discount
                discount.usability -= 1;
                await discount.save();
            }


            // Subtract the discount amount from the grand total
            grandTotal -= discountAmount;

            const newOrder = new Order({
                user: userId,
                items: cart.items,
                grandTotal,
                deliveryMethod: deliveryMethodId,
                discount: discount ? { code: discount.code, discountedAmount: discountAmount } : null, // Store the discount code and amount
                shippingAddress: shippingAddr,
                billingAddress: billingAddr,
                status: 'pending'
            });
            await newOrder.save();

            await Cart.deleteOne({
                user: userId
            });

            const orderResponse = {
                id: newOrder._id,
                items: newOrder.items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price
                })),
                deliveryMethod: {
                    name: deliveryMethod.name,
                    carrier: deliveryMethod.deliveryCarrier,
                    shippingPrice: deliveryMethod.price
                }, // Add shipping price
                discount: {
                    code: discount ? discount.code : null,
                    amount: discountAmount // Add discount amount
                },
                grandTotal: newOrder.grandTotal,
                shippingAddress: newOrder.shippingAddress,
                billingAddress: newOrder.billingAddress,
                status: newOrder.status,
                createdAt: newOrder.createdAt,
                updatedAt: newOrder.updatedAt
            };

            res.status(201).json({
                message: 'Order created successfully',
                order: orderResponse
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
    },

    getAllOrders: async (req, res) => {
        try {
            const userToken = req.headers.authorization;
            if (!userToken) {
                return res.status(401).json({
                    error: 'Authorization token is missing'
                });
            }

            const decodedToken = verifyUserToken(userToken);
            const user = await findUser(decodedToken);

            // Retrieve all orders for the user
            const orders = await Order.find({
                user: user._id
            }).sort({
                createdAt: -1
            });

            const formattedOrders = orders.map(order => ({
                id: order._id,
                items: order.items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price
                })),
                deliveryMethodId: order.deliveryMethod,
                discountCode: order.discount,
                grandTotal: order.grandTotal,
                shippingAddress: order.shippingAddress,
                billingAddress: order.billingAddress,
                status: order.status,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }));

            res.status(200).json({
                orders: formattedOrders
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
    },

    getOrderById: async (req, res) => {
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

            const deliveryMethod = await DeliveryMethod.findById(order.deliveryMethod);

            const populatedItems = await Promise.all(order.items.map(async (item) => {
                // Find product details
                const product = await Product.findById(item.productId);
                if (!product) {
                    // Handle case where product is not found
                    return null;
                }

                // Find variant details
                const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
                if (!variant) {
                    // Handle case where variant is not found
                    return null;
                }

                // Combine product and variant images
                const combinedImages = [...product.images || "", ...variant.images || ""];

                return {
                    id: item._id,
                    productId: item.productId,
                    productName: product.name,
                    variantId: item.variantId,
                    variantName: variant.name,
                    variantPrice: variant.price,
                    images: combinedImages || "",
                    quantity: item.quantity,
                    itemPrice: item.price
                };
            }));

            // Filter out any items that were not found
            const itemsWithDetails = populatedItems.filter(item => item !== null);


            const formattedOrder = {
                id: order._id,
                items: itemsWithDetails,
                deliveryMethod: {
                    name: deliveryMethod.name,
                    carrier: deliveryMethod.deliveryCarrier,
                    shippingPrice: deliveryMethod.price
                },
                discount: {
                    discountCode: order.discount.code,
                    discountAmount: order.discount.discountedAmount
                },
                grandTotal: order.grandTotal,
                shippingAddress: order.shippingAddress,
                billingAddress: order.billingAddress,
                status: order.status,
                placedAt: order.createdAt ? moment(order.createdAt).format("MMMM Do YYYY, h:mm:ss a z") : ''
            };

            res.status(200).json({
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
    },

    updateOrder: async (req, res) => {
        try {
            const orderId = req.params.orderId;

            // Find order by ID and update
            const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {
                new: true
            });

            if (!updatedOrder) {
                return res.status(404).json({
                    error: 'Order not found'
                });
            }

            res.status(200).json({
                message: 'Order updated successfully',
                order: updatedOrder
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    },

    deleteOrder: async (req, res) => {
        try {
            const orderId = req.params.orderId;

            // Find order by ID and delete
            const deletedOrder = await Order.findByIdAndDelete(orderId);

            if (!deletedOrder) {
                return res.status(404).json({
                    error: 'Order not found'
                });
            }

            res.status(200).json({
                message: 'Order deleted successfully',
                order: deletedOrder
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
};

module.exports = orderController;