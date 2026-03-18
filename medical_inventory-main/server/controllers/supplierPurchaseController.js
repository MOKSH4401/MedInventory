const SupplierPurchase = require("../models/SupplierPurchase");
const Supplier = require("../models/Supplier");
const Item = require("../models/Item");

const addPurchase = async (req, res) => {
  try {
    const {
      supplierId,
      itemId,
      company,
      costPrice,
      quantity,
      expiryDate,
      purchaseDate,
    } = req.body;

    if (!supplierId || !itemId) {
      return res.status(400).json({ message: "supplierId and itemId are required" });
    }

    const qty = Number(quantity);
    const cp = Number(costPrice);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "quantity must be a positive number" });
    }
    if (!Number.isFinite(cp) || cp < 0) {
      return res.status(400).json({ message: "costPrice must be a valid number" });
    }

    const [supplier, item] = await Promise.all([
      Supplier.findById(supplierId).lean(),
      Item.findById(itemId),
    ]);

    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    if (!item) return res.status(404).json({ message: "Item not found" });

    const totalCost = cp * qty;
    const exp = expiryDate ? new Date(expiryDate) : undefined;
    if (expiryDate && Number.isNaN(exp.getTime())) {
      return res.status(400).json({ message: "Invalid expiryDate" });
    }
    const pd = purchaseDate ? new Date(purchaseDate) : undefined;
    if (purchaseDate && Number.isNaN(pd.getTime())) {
      return res.status(400).json({ message: "Invalid purchaseDate" });
    }

    const purchase = await SupplierPurchase.create({
      supplierId,
      supplierName: supplier.name,
      itemId,
      itemName: item.name,
      company: company ?? supplier.company ?? item.company,
      costPrice: cp,
      quantity: qty,
      totalCost,
      expiryDate: exp,
      ...(pd ? { purchaseDate: pd } : {}),
    });

    // Update inventory + current cost price
    item.quantity = Number(item.quantity || 0) + qty;
    item.costPrice = cp;
    item.supplierId = supplierId;
    if (exp) item.expiryDate = exp;
    await item.save();

    return res.status(201).json({ purchase, updatedItem: item });
  } catch (error) {
    console.error("Add supplier purchase error:", error);
    return res.status(500).json({ message: "Failed to add purchase" });
  }
};

const getPurchases = async (req, res) => {
  try {
    const purchases = await SupplierPurchase.find()
      .sort({ purchaseDate: -1 })
      .lean();
    return res.json(purchases);
  } catch (error) {
    console.error("Get supplier purchases error:", error);
    return res.status(500).json({ message: "Failed to fetch purchases" });
  }
};

// GET /api/supplier-purchases/summary
// Supplier-wise total purchase
const getSupplierPurchaseSummary = async (req, res) => {
  try {
    const result = await SupplierPurchase.aggregate([
      {
        $group: {
          _id: "$supplierName",
          totalPurchase: { $sum: { $ifNull: ["$totalCost", 0] } },
        },
      },
      { $project: { _id: 0, supplierName: "$_id", totalPurchase: 1 } },
      { $sort: { totalPurchase: -1 } },
    ]);
    return res.json(result);
  } catch (error) {
    console.error("Supplier purchase summary error:", error);
    return res.status(500).json({ message: "Failed to fetch purchase summary" });
  }
};

module.exports = {
  addPurchase,
  getPurchases,
  getSupplierPurchaseSummary,
};

