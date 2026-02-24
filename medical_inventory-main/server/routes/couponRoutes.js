const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  deactivateCoupon,
} = require("../controllers/couponController");

const router = express.Router();

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.post("/validate", validateCoupon);
router.put("/:id/deactivate", deactivateCoupon);

module.exports = router;

