const mongoose = require('mongoose');
const Address = require('./addressModel'); // Import the Address model/schema

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  addresses: [Address.schema] // Array of address documents
});

const User = mongoose.model('User', userSchema);

module.exports = User;
