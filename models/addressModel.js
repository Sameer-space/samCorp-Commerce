const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
