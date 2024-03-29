const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [orderItemSchema],
    grandTotal: {
        type: Number,
        required: true
    },
    deliveryMethod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryMethod',
        required: true
    },
    discount: {
        code : {type: String},
        discountedAmount : {type: Number}

    },
    shippingAddress: {
        streetAddress: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phoneNumber: { type: String, required: true }
    },
    billingAddress: {
        streetAddress: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phoneNumber: { type: String, required: true }
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered'],
        default: 'pending'
    },
    paymentMethod: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
        code: { type: String },
        status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' }
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
