const express = require("express");
const {
  checkExpiredMedicines,
  discardMedicine,
  getExpiredHistory
} = require("../controllers/expiredController");

const router = express.Router();

// GET /api/expired → get non-discarded expired medicines (for action)
router.get("/", checkExpiredMedicines);

// GET /api/expired/history → get all expired medicines (including discarded) for inventory view
router.get("/history", getExpiredHistory);

// PUT /api/expired/discard/:id → discard medicine
router.put("/discard/:id", discardMedicine);

module.exports = router;
