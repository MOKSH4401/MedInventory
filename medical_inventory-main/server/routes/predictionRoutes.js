const express = require("express");
const {
  getMostSoldMedicines,
  getLeastSoldMedicines,
  getTopRevenueMedicines,
  getSalesTrend,
  getMonthlyTrend,
} = require("../controllers/predictionController");

const router = express.Router();

router.get("/most-sold", getMostSoldMedicines);
router.get("/least-sold", getLeastSoldMedicines);
router.get("/top-revenue", getTopRevenueMedicines);
router.get("/sales-trend", getSalesTrend);
router.get("/monthly-trend", getMonthlyTrend);

module.exports = router;
