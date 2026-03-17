const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  email: String,
  address: String,
  company: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Supplier", supplierSchema);

