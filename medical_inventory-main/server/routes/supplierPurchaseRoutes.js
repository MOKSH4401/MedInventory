const express = require("express");
const router = express.Router();
const {
  addPurchase,
  getPurchases,
  getSupplierPurchaseSummary,
} = require("../controllers/supplierPurchaseController");

router.post("/", addPurchase);
router.get("/", getPurchases);
router.get("/summary", getSupplierPurchaseSummary);

module.exports = router;

