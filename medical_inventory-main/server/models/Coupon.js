const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minPurchaseAmount: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
  },
  expiryDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Coupon = mongoose.model("Coupon", CouponSchema);

module.exports = Coupon;

