const Item = require("../models/Item");

const notDiscardedFilter = { $or: [{ isDiscarded: false }, { isDiscarded: { $exists: false } }] };

/** Any item with expiryDate before this moment is considered expired */
function getNow() {
  return new Date();
}

/**
 * Mark all expired items (expiryDate < now, not discarded) as isExpired = true.
 * Used by cron and by checkExpiredMedicines.
 */
const markExpiredMedicines = async () => {
  const now = getNow();
  await Item.updateMany(
    { expiryDate: { $lt: now }, ...notDiscardedFilter },
    { $set: { isExpired: true } }
  );
};

/**
 * GET /api/expired
 * Updates isExpired for expired items, then returns list of expired medicines (not discarded).
 * Any item with expiryDate in the past is included.
 */
const checkExpiredMedicines = async (req, res) => {
  try {
    const now = getNow();
    await markExpiredMedicines();
    const expiredItems = await Item.find({
      expiryDate: { $lt: now },
      ...notDiscardedFilter
    }).sort({ expiryDate: 1 });
    res.json(expiredItems);
  } catch (error) {
    console.error("Error in checkExpiredMedicines:", error);
    res.status(500).json({ error: "Error fetching expired medicines" });
  }
};

/**
 * GET /api/expired/history
 * Returns all medicines whose expiryDate is in the past,
 * regardless of whether they have already been discarded.
 * Useful for inventory reports / audit.
 */
const getExpiredHistory = async (req, res) => {
  try {
    const now = getNow();
    const expiredItems = await Item.find({
      expiryDate: { $lt: now }
    }).sort({ expiryDate: 1 });
    res.json(expiredItems);
  } catch (error) {
    console.error("Error in getExpiredHistory:", error);
    res.status(500).json({ error: "Error fetching expired history" });
  }
};

/**
 * PUT /api/expired/discard/:id
 * Mark medicine as discarded (isDiscarded = true, discardedAt = now, optional quantity = 0).
 */
const discardMedicine = async (req, res) => {
  try {
    const { id: itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    item.isDiscarded = true;
    item.discardedAt = new Date();
    item.quantity = 0;
    await item.save();
    res.json({ message: "Medicine discarded successfully" });
  } catch (error) {
    console.error("Error in discardMedicine:", error);
    res.status(500).json({ error: "Error discarding medicine" });
  }
};

module.exports = {
  checkExpiredMedicines,
  discardMedicine,
  markExpiredMedicines,
  getExpiredHistory
};
