const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Reference to parent category
    images: [String], // Array of image URLs for the category (optional)
    isActive: { type: Boolean, default: true }, // Whether the category is active or not
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;