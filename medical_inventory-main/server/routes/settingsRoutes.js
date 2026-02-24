const express = require("express");
const Settings = require("../models/Settings.js");
const PurchaseHistory = require("../models/PurchaseHistory.js");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings" });
  }
});

router.put("/", async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { ...req.body, lastUpdated: Date.now() },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error updating settings" });
  }
});

router.get("/purchase-history", async (req, res) => {
  try {
    const history = await PurchaseHistory.find()
      .sort({ purchaseDate: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching purchase history" });
  }
});

module.exports = router;
