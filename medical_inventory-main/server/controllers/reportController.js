const PurchaseHistory = require("../models/PurchaseHistory");
const Item = require("../models/Item");

/**
 * Build date filter from optional startDate, endDate query params
 */
const buildDateFilter = (req) => {
  const filter = {};
  if (req.query.startDate) {
    filter.$gte = new Date(req.query.startDate);
  }
  if (req.query.endDate) {
    const end = new Date(req.query.endDate);
    end.setHours(23, 59, 59, 999);
    filter.$lte = end;
  }
  return Object.keys(filter).length ? filter : null;
};

/**
 * GET /api/reports/sales
 * Optional: startDate, endDate (ISO date strings)
 */
const getSalesReport = async (req, res) => {
  try {
    const dateFilter = buildDateFilter(req);
    const matchStage = dateFilter ? { purchaseDate: dateFilter } : {};

    const [totals, salesByDateResult] = await Promise.all([
      PurchaseHistory.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
          },
        },
        { $project: { _id: 0 } },
      ]),
      PurchaseHistory.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } },
            total: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", total: 1 } },
      ]),
    ]);

    const result = totals[0] || { totalSales: 0, totalOrders: 0 };
    res.json({
      totalSales: result.totalSales,
      totalOrders: result.totalOrders,
      salesByDate: salesByDateResult,
    });
  } catch (error) {
    console.error("Sales report error:", error);
    res.status(500).json({ message: "Failed to fetch sales report" });
  }
};

/**
 * GET /api/reports/profit
 * Profit & Loss:
 * totalCost = sum(costPrice * quantity)
 * totalRevenue = sum(totalAmount)
 * totalDiscountGiven = sum(discountAmount)
 * netRevenue = totalRevenue - totalDiscountGiven
 * totalProfit = netRevenue - totalCost
 *
 * Old PurchaseHistory records may miss costPrice/discountAmount.
 */
const getProfitReport = async (req, res) => {
  try {
    const result = await PurchaseHistory.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ["$totalAmount", 0] } },
          totalDiscountGiven: { $sum: { $ifNull: ["$discountAmount", 0] } },
          totalCost: {
            $sum: {
              $multiply: [
                { $ifNull: ["$costPrice", 0] },
                { $ifNull: ["$quantity", 0] },
              ],
            },
          },
        },
      },
      { $project: { _id: 0 } },
    ]);

    const totals = result[0] || {};
    const totalRevenue = totals.totalRevenue || 0;
    const totalDiscountGiven = totals.totalDiscountGiven || 0;
    const totalCost = totals.totalCost || 0;
    const netRevenue = totalRevenue - totalDiscountGiven;
    const totalProfit = netRevenue - totalCost;

    res.json({
      totalRevenue,
      totalDiscountGiven,
      netRevenue,
      totalCost,
      totalProfit,
    });
  } catch (error) {
    console.error("Profit report error:", error);
    res.status(500).json({ message: "Failed to fetch profit report" });
  }
};

/**
 * GET /api/reports/inventory
 */
const getInventoryReport = async (req, res) => {
  try {
    const items = await Item.find({
      $or: [{ isDiscarded: false }, { isDiscarded: { $exists: false } }],
    }).lean();
    const totalItems = items.length;
    const totalStock = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const minStockLevel = (v) => v ?? 10;
    const lowStockItems = items.filter(
      (i) => i.quantity <= minStockLevel(i.minStockLevel) && i.quantity > 0
    );
    const outOfStockItems = items.filter((i) => (i.quantity || 0) === 0);

    res.json({
      totalItems,
      totalStock,
      lowStockItems,
      outOfStockItems,
    });
  } catch (error) {
    console.error("Inventory report error:", error);
    res.status(500).json({ message: "Failed to fetch inventory report" });
  }
};

/**
 * GET /api/reports/payment
 * Sales grouped by paymentMode (uses finalAmount = actual paid amount)
 */
const getPaymentReport = async (req, res) => {
  try {
    const result = await PurchaseHistory.aggregate([
      {
        $group: {
          _id: "$paymentMode",
          total: {
            $sum: { $ifNull: ["$finalAmount", "$totalAmount"] },
          },
        },
      },
      { $project: { _id: 0, paymentMode: "$_id", total: 1 } },
    ]);
    const summary = { cash: 0, card: 0, upi: 0 };
    result.forEach((r) => {
      if (r.paymentMode && summary[r.paymentMode] !== undefined) {
        summary[r.paymentMode] = r.total;
      }
    });
    res.json(summary);
  } catch (error) {
    console.error("Payment report error:", error);
    res.status(500).json({ message: "Failed to fetch payment report" });
  }
};

/**
 * GET /api/reports/purchases
 * Pagination: page (default 1), limit (default 20)
 */
const getPurchaseReport = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      PurchaseHistory.find()
        .sort({ purchaseDate: -1 })
        .skip(skip)
        .limit(limit)
        .select("itemName quantity price totalAmount discountAmount finalAmount couponCode paymentMode purchaseDate buyerName")
        .lean(),
      PurchaseHistory.countDocuments(),
    ]);

    res.json({
      purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Purchase report error:", error);
    res.status(500).json({ message: "Failed to fetch purchase report" });
  }
};

module.exports = {
  getSalesReport,
  getProfitReport,
  getInventoryReport,
  getPaymentReport,
  getPurchaseReport,
};
