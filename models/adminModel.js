const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['superadmin', 'admin', 'moderator'], default: 'admin' },
  name: { type: String },
  phone: { type: String },
  active: { type: Boolean, default: true },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
