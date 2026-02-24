const Coupon = require("../models/Coupon");

// Helper to compute discount
const computeDiscount = (coupon, cartAmount) => {
  if (!coupon || cartAmount <= 0) return { discountAmount: 0, finalAmount: cartAmount };

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (cartAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount != null) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === "fixed") {
    discount = coupon.discountValue;
  }

  if (discount < 0) discount = 0;
  if (discount > cartAmount) discount = cartAmount;

  const finalAmount = cartAmount - discount;
  return { discountAmount: discount, finalAmount };
};

// POST /api/coupons
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      expiryDate,
      isActive,
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ message: "code, discountType and discountValue are required" });
    }

    const coupon = new Coupon({
      code,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      expiryDate,
      isActive,
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    console.error("Create coupon error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    res.status(500).json({ message: "Failed to create coupon" });
  }
};

// GET /api/coupons
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json(coupons);
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

// POST /api/coupons/validate
const validateCoupon = async (req, res) => {
  try {
    const { code, cartAmount } = req.body;
    if (!code || cartAmount == null) {
      return res.status(400).json({ valid: false, message: "code and cartAmount are required" });
    }

    const amount = Number(cartAmount) || 0;
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon) {
      return res.status(200).json({ valid: false, message: "Coupon not found" });
    }

    if (!coupon.isActive) {
      return res.status(200).json({ valid: false, message: "Coupon is not active" });
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return res.status(200).json({ valid: false, message: "Coupon has expired" });
    }

    if (amount < (coupon.minPurchaseAmount || 0)) {
      return res.status(200).json({
        valid: false,
        message: `Minimum purchase amount is ${coupon.minPurchaseAmount}`,
      });
    }

    const { discountAmount, finalAmount } = computeDiscount(coupon, amount);

    return res.json({
      valid: true,
      discountAmount,
      finalAmount,
      code: coupon.code,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({ valid: false, message: "Failed to validate coupon" });
  }
};

// PUT /api/coupons/:id/deactivate
const deactivateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  } catch (error) {
    console.error("Deactivate coupon error:", error);
    res.status(500).json({ message: "Failed to deactivate coupon" });
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  deactivateCoupon,
  computeDiscount,
};

