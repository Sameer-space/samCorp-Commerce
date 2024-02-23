const mongoose = require('mongoose');

const deliveryMethodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    estimatedDeliveryTime: {
        type: String,
        required: true
    },
    availability: {
        type: String
    },
    deliveryRestrictions: {
        type: String
    },
    deliveryCarrier: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    // You can add more fields here as needed
});

module.exports = mongoose.model('DeliveryMethod', deliveryMethodSchema);
