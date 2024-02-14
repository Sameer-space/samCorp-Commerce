const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, default: 0 },
  attributes: [{ type: String }], // Attributes specific to this product variant
  images: [String], 
  // Other fields specific to the product variant can be added here
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  variants: [productVariantSchema], // Array of product variants
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;