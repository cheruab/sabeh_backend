const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RewardSchema = new Schema(
  {
    // Leader information
    customerId: {
      type: String,
      required: true,
      ref: "customer",
      index: true,
    },

    // Group reference
    groupId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "group",
    },
    groupCode: String,

    // Reward details
    rewardType: {
      type: String,
      enum: ["group_leader", "referral", "bonus"],
      default: "group_leader",
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "paid", "cancelled"],
      default: "pending",
    },

    // Group metrics that earned this reward
    groupMetrics: {
      totalParticipants: Number,
      totalAmount: Number,
      productName: String,
      discount: Number,
    },

    // Payment tracking
    paidAt: Date,
    paymentMethod: String,
    transactionId: String,

    notes: String,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

// Indexes for efficient queries
RewardSchema.index({ customerId: 1, status: 1 });
RewardSchema.index({ groupId: 1 });
RewardSchema.index({ createdAt: -1 });

module.exports = mongoose.model("reward", RewardSchema);