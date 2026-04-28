const mongoose = require('mongoose');
const user = require('./user');

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  district: String, // Added district field
  title:String,
  description: String,
  image: { type: String },
  status: { type: String, enum: ['Pending', 'On Progress','Resolved'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  adminLat: Number,
  adminLong: Number,
  userLat: Number,  
  userLong: Number,
// Store admin location (lat, long)
});

module.exports = mongoose.model('Complaint', complaintSchema);
