import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be 10 digits'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    sparse: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  location: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

// Index for better query performance
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', userSchema);