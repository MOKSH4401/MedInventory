const express = require("express");
const {
  getSalesReport,
  getProfitReport,
  getInventoryReport,
  getPaymentReport,
  getPurchaseReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/sales", getSalesReport);
router.get("/profit", getProfitReport);
router.get("/inventory", getInventoryReport);
router.get("/payment", getPaymentReport);
router.get("/purchases", getPurchaseReport);

module.exports = router;
