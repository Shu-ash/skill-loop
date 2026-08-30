// src/models/otp.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    otp: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['login', 'register', 'forgot_password'],
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true,
      // Automatically removes document from MongoDB once expiresAt is reached
      index: { expires: 0 }
    }
  },
  {
    timestamps: true
  }
);

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
