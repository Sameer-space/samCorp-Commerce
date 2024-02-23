const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    usability: {
        type: Number,
        default: 1
    }
    // Add more fields as needed
});

module.exports = mongoose.model('Discount', discountSchema);
