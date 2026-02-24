const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    expiryDate: { type: Date },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 10 },
    details: { type: String },
    moreDetails: { type: String },
    image: { type: String, default: "https://example.com/default-image.jpg" }
  },
  
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;



