const PurchaseHistory = require("../models/PurchaseHistory");
const Item = require("../models/Item");

/**
 * Get dashboard analytics
 * GET /api/dashboard
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Run all aggregations in parallel
    const [
      totalSalesTodayResult,
      totalSalesMonthResult,
      totalOrdersResult,
      lowStockItems,
      mostSoldItemsResult,
      salesByDateResult,
      monthlyTrendResult,
    ] = await Promise.all([
      PurchaseHistory.aggregate([
        { $match: { purchaseDate: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        { $project: { _id: 0, total: 1 } },
      ]),
      PurchaseHistory.aggregate([
        { $match: { purchaseDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        { $project: { _id: 0, total: 1 } },
      ]),
      PurchaseHistory.countDocuments(),
      Item.find({
        quantity: { $lte: 10 },
        $or: [{ isDiscarded: false }, { isDiscarded: { $exists: false } }],
      })
        .select("name quantity price image")
        .lean(),
      PurchaseHistory.aggregate([
        { $group: { _id: "$itemName", totalQuantity: { $sum: "$quantity" } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: "$_id", totalQuantity: 1 } },
      ]),
      PurchaseHistory.aggregate([
        { $match: { purchaseDate: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" },
            },
            total: { $sum: "$totalAmount" },
            quantity: { $sum: "$quantity" },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", total: 1, quantity: 1 } },
      ]),
      PurchaseHistory.aggregate([
        { $match: { purchaseDate: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$purchaseDate" },
              month: { $month: "$purchaseDate" },
            },
            total: { $sum: "$totalAmount" },
            quantity: { $sum: "$quantity" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            total: 1,
            quantity: 1,
          },
        },
      ]),
    ]);

    const totalSalesToday = totalSalesTodayResult[0]?.total ?? 0;
    const totalSalesMonth = totalSalesMonthResult[0]?.total ?? 0;

    // Ensure salesByDate has all 7 days (fill missing with 0)
    const dateMap = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      dateMap.set(dateStr, { date: dateStr, total: 0, quantity: 0 });
    }
    salesByDateResult.forEach((row) => {
      dateMap.set(row.date, {
        date: row.date,
        total: row.total,
        quantity: row.quantity ?? 0,
      });
    });
    const salesByDate = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Fill missing months in monthlyTrend (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = new Map();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, {
        month: monthNames[d.getMonth()],
        monthNum: d.getMonth() + 1,
        year: d.getFullYear(),
        total: 0,
        quantity: 0,
      });
    }
    monthlyTrendResult.forEach((row) => {
      const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: monthNames[row.month - 1],
          monthNum: row.month,
          year: row.year,
          total: row.total,
          quantity: row.quantity ?? 0,
        });
      }
    });
    const monthlyTrend = Array.from(monthlyMap.values()).sort(
      (a, b) => a.year - b.year || a.monthNum - b.monthNum
    );

    res.json({
      totalSalesToday,
      totalSalesMonth,
      totalOrders: totalOrdersResult,
      lowStockItems,
      mostSoldItems: mostSoldItemsResult,
      salesByDate,
      monthlyTrend,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard analytics" });
  }
};

module.exports = { getDashboardAnalytics };
