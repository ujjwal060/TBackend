const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user', 'vendor']
  },
  otp: {
    type: String
  },
  otpExpiration: {
    type: Date
  }
});

module.exports = mongoose.model('User', userSchema);
