const PurchaseHistory = require("../models/PurchaseHistory");

/**
 * GET /api/predictions/most-sold
 * Top 10 medicines by total quantity sold
 */
const getMostSoldMedicines = async (req, res) => {
  try {
    const result = await PurchaseHistory.aggregate([
      { $match: { itemName: { $exists: true, $ne: null, $ne: "" } } },
      { $group: { _id: "$itemName", totalSold: { $sum: "$quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, itemName: "$_id", totalSold: 1 } },
    ]);
    res.json(result);
  } catch (error) {
    console.error("Most sold medicines error:", error);
    res.status(500).json({ message: "Failed to fetch most sold medicines" });
  }
};

/**
 * GET /api/predictions/least-sold
 * Bottom 10 medicines by total quantity sold
 */
const getLeastSoldMedicines = async (req, res) => {
  try {
    const result = await PurchaseHistory.aggregate([
      { $match: { itemName: { $exists: true, $ne: null, $ne: "" } } },
      { $group: { _id: "$itemName", totalSold: { $sum: "$quantity" } } },
      { $sort: { totalSold: 1 } },
      { $limit: 10 },
      { $project: { _id: 0, itemName: "$_id", totalSold: 1 } },
    ]);
    res.json(result);
  } catch (error) {
    console.error("Least sold medicines error:", error);
    res.status(500).json({ message: "Failed to fetch least sold medicines" });
  }
};

/**
 * GET /api/predictions/top-revenue
 * Top 10 medicines by total revenue (totalAmount)
 */
const getTopRevenueMedicines = async (req, res) => {
  try {
    const result = await PurchaseHistory.aggregate([
      { $match: { itemName: { $exists: true, $ne: null, $ne: "" } } },
      { $group: { _id: "$itemName", totalRevenue: { $sum: "$totalAmount" } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, itemName: "$_id", totalRevenue: 1 } },
    ]);
    res.json(result);
  } catch (error) {
    console.error("Top revenue medicines error:", error);
    res.status(500).json({ message: "Failed to fetch top revenue medicines" });
  }
};

/**
 * GET /api/predictions/sales-trend
 * Last 7 days: total sales per day (using purchaseDate)
 */
const getSalesTrend = async (req, res) => {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const result = await PurchaseHistory.aggregate([
      { $match: { purchaseDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", totalSales: 1 } },
    ]);

    // Fill missing days with 0
    const dateMap = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      dateMap.set(dateStr, { date: dateStr, totalSales: 0 });
    }
    result.forEach((r) => dateMap.set(r.date, { date: r.date, totalSales: r.totalSales }));
    const filled = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    res.json(filled);
  } catch (error) {
    console.error("Sales trend error:", error);
    res.status(500).json({ message: "Failed to fetch sales trend" });
  }
};

/**
 * GET /api/predictions/monthly-trend
 * Group by month and year, sum totalAmount, sort ascending
 */
const getMonthlyTrend = async (req, res) => {
  try {
    const result = await PurchaseHistory.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$purchaseDate" },
            month: { $month: "$purchaseDate" },
          },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalSales: 1,
        },
      },
    ]);
    res.json(result);
  } catch (error) {
    console.error("Monthly trend error:", error);
    res.status(500).json({ message: "Failed to fetch monthly trend" });
  }
};

module.exports = {
  getMostSoldMedicines,
  getLeastSoldMedicines,
  getTopRevenueMedicines,
  getSalesTrend,
  getMonthlyTrend,
};
