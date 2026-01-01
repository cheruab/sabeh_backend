const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OTPSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    firebaseVerificationId: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete when expired
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["signup", "login"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
OTPSchema.index({ phone: 1, createdAt: -1 });

module.exports = mongoose.model("otp", OTPSchema);