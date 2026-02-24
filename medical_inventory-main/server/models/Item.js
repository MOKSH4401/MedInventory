const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 10 },
    details: { type: String },
    moreDetails: { type: String },
    image: { type: String, default: "https://example.com/default-image.jpg" },
    isExpired: { type: Boolean, default: false },
    isDiscarded: { type: Boolean, default: false },
    discardedAt: { type: Date }
  },
  
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;



