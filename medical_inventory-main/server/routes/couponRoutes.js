const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  deactivateCoupon,
  reactivateCoupon,
  updateCouponExpiry,
} = require("../controllers/couponController");

const router = express.Router();

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.post("/validate", validateCoupon);
router.put("/:id/deactivate", deactivateCoupon);
router.put("/:id/reactivate", reactivateCoupon);
router.put("/:id/expiry", updateCouponExpiry);

module.exports = router;

