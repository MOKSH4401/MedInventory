const mongoose = require("mongoose");

const PurchaseHistorySchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  itemName: String,
  quantity: Number,
  price: Number,
  totalAmount: Number, // line total before discount
  discountAmount: { type: Number, default: 0 },
  finalAmount: Number, // line total after discount
  couponCode: String,
  purchaseDate: { type: Date, default: Date.now },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  paymentMode: { type: String, required: true, enum: ["cash", "card", "upi"] },
  razorpayOrderId: String,
  razorpayPaymentId: String,
});

const PurchaseHistory = mongoose.model("PurchaseHistory", PurchaseHistorySchema);

module.exports = PurchaseHistory;

