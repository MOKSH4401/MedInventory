const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  theme: { type: String, default: "light" },
  currency: { type: String, default: "INR" },
  lastUpdated: { type: Date, default: Date.now }
});

const Settings = mongoose.model("Settings", SettingsSchema);

module.exports = Settings;
