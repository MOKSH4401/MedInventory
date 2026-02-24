const express = require("express");
const {
  addToCart,
  getCart,
  removeFromCart,
  checkout,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require("../controllers/cartController");

const router = express.Router();

router.post("/add", addToCart);
router.get("/", getCart);
router.delete("/remove/:itemId", removeFromCart);
router.post("/checkout", checkout);
router.post("/create-order", createRazorpayOrder);
router.post("/verify-payment", verifyRazorpayPayment);

module.exports = router;
