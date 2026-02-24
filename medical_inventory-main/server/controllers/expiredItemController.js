const Item = require("../models/Item") ;
const ExpiredItem = require("../models/expiredItem") ;

// Function to move expired items to ExpiredItem collection

// const moveExpiredItems = async (req, res) => {
//   try {
//     const today = new Date();

//     const expiredItems = await Item.find({ expiryDate: { $lt: today } });

//     if (expiredItems.length > 0) {
//       await ExpiredItem.insertMany(expiredItems);

//       await Item.deleteMany({ expiryDate: { $lt: today } });

//       console.log(`Moved ${expiredItems.length} expired items to ExpiredItem collection.`);
//       res.json({ message: `${expiredItems.length} expired items moved successfully!` });
//     } else {
//       res.json({ message: "No expired items found." });
//     }
//   } catch (error) {
//     console.error("Error moving expired items:", error);
//     res.status(500).json({ error: "Error processing expired items" });
//   }
// };

const moveExpiredItems = async () => {
  try {
    const currentDate = new Date();
    
    // Find expired items
    const expiredItems = await Item.find({ expiryDate: { $lt: currentDate } });

    if (expiredItems.length > 0) {
      // Move expired items to ExpiredItem collection
      await ExpiredItem.insertMany(expiredItems);

      // Delete expired items from original collection
      await Item.deleteMany({ expiryDate: { $lt: currentDate } });

      console.log(`✅ Moved ${expiredItems.length} expired items to ExpiredItem collection.`);
    } else {
      console.log("ℹ️ No expired items found.");
    }
  } catch (error) {
    console.error("❌ Error moving expired items:", error);
  }
};




// Function to get all expired items
const getExpiredItems = async (req, res) => {
    try {
      const expiredItems = await ExpiredItem.find();
      res.json(expiredItems);
    } catch (error) {
      console.error("Error fetching expired items:", error);
      res.status(500).json({ error: "Error fetching expired items" });
    }
  };

module.exports = {moveExpiredItems,getExpiredItems}
