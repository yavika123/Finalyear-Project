const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  district: String // Added district field
});

module.exports = mongoose.model('User', userSchema);
