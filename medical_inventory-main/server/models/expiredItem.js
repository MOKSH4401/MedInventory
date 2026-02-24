const mongoose = require("mongoose") ;

const expiredItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  expiryDate: Date,
});

const ExpiredItem = mongoose.model("ExpiredItem", expiredItemSchema);

module.exports = ExpiredItem;