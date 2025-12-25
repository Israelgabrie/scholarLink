// models/Otp.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
}, { 
  timestamps: { createdAt: true, updatedAt: false } // only createdAt
});

// Optional: automatically delete OTP after 5 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
