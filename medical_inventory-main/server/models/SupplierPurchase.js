const mongoose = require("mongoose");

const supplierPurchaseSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
  },
  supplierName: String,

  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },
  itemName: String,

  company: String,

  costPrice: Number,
  quantity: Number,
  totalCost: Number,

  expiryDate: Date,
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SupplierPurchase", supplierPurchaseSchema);

