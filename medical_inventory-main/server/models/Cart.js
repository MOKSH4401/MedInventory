const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    image: String
  }],
  totalAmount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate total amount
CartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;
