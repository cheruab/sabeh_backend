const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GroupSchema = new Schema(
  {
    // Group identification
    uniqueCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // Leader information
    leader: {
      customerId: {
        type: String,
        required: true,
        ref: "customer",
      },
      name: String,
      phone: String,
    },

    // Product information
    product: {
      _id: {
        type: String,
        required: true,
        ref: "Product",
      },
      name: String,
      banner: String,
      regular_price: Number,
      group_price: Number,
      weight: String,
      category: String,
    },

    // Group settings
    minParticipants: {
      type: Number,
      required: true,
      default: 5,
    },
    maxParticipants: {
      type: Number,
      required: true,
      default: 20,
    },

    // Participants array
    participants: [
      {
        customerId: {
          type: String,
          required: true,
          ref: "customer",
        },
        name: String,
        phone: String,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    // Current status
    currentParticipants: {
      type: Number,
      default: 1, // Leader counts as first participant
    },

    status: {
      type: String,
      enum: ["pending", "active", "completed", "expired", "cancelled"],
      default: "active",
    },

    // Timing
    expiresAt: {
      type: Date,
      required: true,
    },
    completedAt: Date,

    // Delivery address (leader's address)
    deliveryAddress: {
      type: {
        type: String,
        enum: ["home", "hotel", "office", "other", "custom"], // ADDED "custom" here
      },
      completeAddress: String,
      latitude: Number,
      longitude: Number,
    },

    // Order tracking
    orderId: {
      type: String,
      ref: "order",
    },

    // Leader rewards
    leaderReward: {
      type: Number,
      default: 0,
    },
    rewardPaid: {
      type: Boolean,
      default: false,
    },

    // Metadata
    totalAmount: Number,
    discount: Number,
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

// Index for faster queries
GroupSchema.index({ status: 1, expiresAt: 1 });
GroupSchema.index({ "leader.customerId": 1 });
GroupSchema.index({ "product._id": 1, status: 1 });

// Method to check if group is full
GroupSchema.methods.isFull = function () {
  return this.currentParticipants >= this.maxParticipants;
};

// Method to check if minimum reached
GroupSchema.methods.isMinimumReached = function () {
  return this.currentParticipants >= this.minParticipants;
};

// Method to check if expired
GroupSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt && this.status !== "completed";
};

// Calculate leader reward (e.g., 5% of total savings)
GroupSchema.methods.calculateLeaderReward = function () {
  const totalSavings = 
    this.currentParticipants * 
    (this.product.regular_price - this.product.group_price);
  
  this.leaderReward = totalSavings * 0.05; // 5% commission
  return this.leaderReward;
};

module.exports = mongoose.model("group", GroupSchema);