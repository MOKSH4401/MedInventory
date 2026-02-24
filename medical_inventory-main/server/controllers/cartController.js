const { sendPaymentSuccessSMS } = require("../utils/sendSMS");
const { sendPaymentConfirmationEmail } = require("../utils/sendEmail");
const { generateInvoicePDF } = require("../utils/generateInvoicePDF");
const Cart = require("../models/Cart");
const Settings = require("../models/Settings");
const Item = require("../models/Item");
const PurchaseHistory = require("../models/PurchaseHistory");
const Coupon = require("../models/Coupon");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Helper to compute coupon discount for a cart total
const computeCouponDiscountForCart = async (couponCode, cartAmount) => {
  const amount = Number(cartAmount) || 0;
  if (!couponCode || !amount) {
    return { discountAmount: 0, finalAmount: amount, appliedCoupon: null };
  }

  const code = couponCode.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code });
  if (!coupon) {
    throw new Error("Invalid coupon code");
  }
  if (!coupon.isActive) {
    throw new Error("Coupon is not active");
  }
  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
    throw new Error("Coupon has expired");
  }
  if (amount < (coupon.minPurchaseAmount || 0)) {
    throw new Error(
      `Minimum purchase amount for this coupon is ${coupon.minPurchaseAmount}`
    );
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (amount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount != null) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === "fixed") {
    discount = coupon.discountValue;
  }

  if (discount < 0) discount = 0;
  if (discount > amount) discount = amount;

  const finalAmount = amount - discount;
  return { discountAmount: discount, finalAmount, appliedCoupon: coupon };
};

const addToCart = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { itemId, quantity } = req.body;

    // Find item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Prevent adding expired medicine to cart
    if (item.expiryDate && item.expiryDate < new Date()) {
      return res.status(400).json({ message: "Cannot add expired medicine" });
    }

    // Check stock
    if (item.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Find or create cart
    let cart = await Cart.findOne();
    if (!cart) {
      cart = new Cart({ items: [], totalAmount: 0 });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(i => i.itemId.toString() === itemId);

    if (existingItemIndex > -1) {
      // Update existing cart item
      const newQuantity = cart.items[existingItemIndex].quantity + parseInt(quantity);
      if (item.quantity < newQuantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({
        itemId: item._id,
        name: item.name,
        quantity: parseInt(quantity),
        price: item.price,
        image: item.image
      });
    }

    // Update item stock in inventory
    item.quantity -= parseInt(quantity);
    await item.save();

    // Update cart total and save
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    await cart.save();

    // Fetch the updated item to confirm stock update
    const updatedItem = await Item.findById(itemId);
    console.log("Updated stock:", updatedItem.quantity);

    res.json({
      cart,
      updatedStock: updatedItem.quantity
    });

  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne();
    if (!cart) {
      cart = new Cart({ items: [], totalAmount: 0 });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne();
    
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Return item to inventory
    const cartItem = cart.items.find(item => item.itemId.toString() === itemId);
    if (cartItem) {
      const item = await Item.findById(itemId);
      if (item) {
        item.quantity += cartItem.quantity;
        await item.save();
      }
    }

    // Remove from cart
    cart.items = cart.items.filter(item => item.itemId.toString() !== itemId);
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error removing from cart" });
  }
};

const checkout = async (req, res) => {
  try {
    const { buyerName, buyerPhone, buyerEmail, paymentMode, couponCode } = req.body;
    const cart = await Cart.findOne();
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.totalAmount;
    let discountAmount = 0;
    let finalAmount = totalAmount;
    let appliedCoupon = null;

    if (couponCode) {
      try {
        const result = await computeCouponDiscountForCart(couponCode, totalAmount);
        discountAmount = result.discountAmount;
        finalAmount = result.finalAmount;
        appliedCoupon = result.appliedCoupon;
      } catch (err) {
        return res.status(400).json({ message: err.message || "Invalid coupon" });
      }
    }

    // Distribute discount proportionally across line items
    const purchases = cart.items.map((item) => {
      const lineTotal = item.price * item.quantity;
      const lineShare = totalAmount > 0 ? lineTotal / totalAmount : 0;
      const lineDiscount = discountAmount * lineShare;
      const lineFinal = lineTotal - lineDiscount;

      return {
        itemId: item.itemId,
        itemName: item.name,
        quantity: item.quantity,
        price: item.price,
        totalAmount: lineTotal,
        discountAmount: lineDiscount,
        finalAmount: lineFinal,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        buyerName,
        buyerPhone,
        paymentMode,
      };
    });

    await PurchaseHistory.insertMany(purchases);

    const purchaseDataForEmail = {
      items: cart.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      totalAmount: finalAmount,
      buyerName,
      buyerPhone,
      paymentMode,
      billId: Date.now().toString().slice(-6),
      purchaseDate: new Date(),
    };

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Send payment success SMS (non-blocking)
    if (buyerPhone) {
      sendPaymentSuccessSMS(buyerPhone, finalAmount).catch((err) =>
        console.error("SMS send failed:", err)
      );
    }

    // Send payment confirmation email with invoice attachment (non-blocking)
    if (buyerEmail) {
      (async () => {
        try {
          const settings = await Settings.findOne();
          const currency = settings?.currency || "INR";
          const pdfBuffer = await generateInvoicePDF(purchaseDataForEmail, currency);
          const filename = `invoice-${buyerName}-${Date.now()}.pdf`.replace(/\s+/g, "-");
          await sendPaymentConfirmationEmail(buyerEmail, {
            customerName: buyerName,
            totalAmount: finalAmount,
            pdfBuffer,
            pdfFilename: filename,
          });
        } catch (err) {
          console.error("Email send failed:", err);
        }
      })();
    }

    res.json({ message: "Checkout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error during checkout" });
  }
};

// Create Razorpay order (amount in paise)
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // totalAmount in rupees from frontend
    const cart = await Cart.findOne();
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const amountInPaise = Math.round(parseFloat(amount) * 100);
    if (!amountInPaise || amountInPaise < 100) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });
    res.json({
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: amountInPaise
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

// Verify Razorpay payment and complete checkout (save purchase, clear cart)
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      buyerName,
      buyerPhone,
      buyerEmail,
      paymentMode,
      couponCode,
    } = req.body;

    const cart = await Cart.findOne();
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const totalAmount = cart.totalAmount;
    let discountAmount = 0;
    let finalAmount = totalAmount;
    let appliedCoupon = null;

    if (couponCode) {
      try {
        const result = await computeCouponDiscountForCart(couponCode, totalAmount);
        discountAmount = result.discountAmount;
        finalAmount = result.finalAmount;
        appliedCoupon = result.appliedCoupon;
      } catch (err) {
        return res.status(400).json({ message: err.message || "Invalid coupon" });
      }
    }

    const purchases = cart.items.map((item) => {
      const lineTotal = item.price * item.quantity;
      const lineShare = totalAmount > 0 ? lineTotal / totalAmount : 0;
      const lineDiscount = discountAmount * lineShare;
      const lineFinal = lineTotal - lineDiscount;

      return {
        itemId: item.itemId,
        itemName: item.name,
        quantity: item.quantity,
        price: item.price,
        totalAmount: lineTotal,
        discountAmount: lineDiscount,
        finalAmount: lineFinal,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        buyerName,
        buyerPhone,
        paymentMode: paymentMode || "card",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      };
    });

    await PurchaseHistory.insertMany(purchases);
    const purchaseDataForEmail = {
      items: cart.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      totalAmount: finalAmount,
      buyerName,
      buyerPhone,
      paymentMode: paymentMode || "card",
      paymentId: razorpay_payment_id,
      billId: Date.now().toString().slice(-6),
      purchaseDate: new Date(),
    };

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Send payment success SMS (non-blocking)
    if (buyerPhone) {
      sendPaymentSuccessSMS(buyerPhone, finalAmount).catch((err) =>
        console.error("SMS send failed:", err)
      );
    }

    // Send payment confirmation email with invoice attachment (non-blocking)
    if (buyerEmail) {
      (async () => {
        try {
          const settings = await Settings.findOne();
          const currency = settings?.currency || "INR";
          const pdfBuffer = await generateInvoicePDF(purchaseDataForEmail, currency);
          const filename = `invoice-${buyerName}-${Date.now()}.pdf`.replace(/\s+/g, "-");
          await sendPaymentConfirmationEmail(buyerEmail, {
            customerName: buyerName,
            totalAmount: finalAmount,
            paymentId: razorpay_payment_id,
            pdfBuffer,
            pdfFilename: filename,
          });
        } catch (err) {
          console.error("Email send failed:", err);
        }
      })();
    }

    res.json({
      message: "Payment verified and checkout successful",
      razorpayPaymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  checkout,
  createRazorpayOrder,
  verifyRazorpayPayment
};
