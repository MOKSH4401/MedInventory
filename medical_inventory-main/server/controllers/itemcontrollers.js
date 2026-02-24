const Item = require("../models/Item");

// Exclude discarded items from inventory, products, and counts
const notDiscardedFilter = { $or: [{ isDiscarded: false }, { isDiscarded: { $exists: false } }] };

// Get all items (excludes discarded so they don't show in inventory, products, or total count)
const getItems = async (req, res) => {
  try {
    const items = await Item.find(notDiscardedFilter);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create an item
const createItem = async (req, res) => {
  console.log("Received Data:", req.body);
  console.log("Received File:", req.file);

   //  Extract form data properly
  const { name, quantity, expiryDate,price,details,moreDetails } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

    //  Ensure required fields are present
    if (!name || !quantity || !expiryDate || !price || !details || !moreDetails) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
  try {
    const newItem = new Item({ name, quantity, expiryDate,price,details,moreDetails,image});
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: "Invalid data" });
  }
};

// Update an item
// const updateItem = async (req, res) => {
//   const { id } = req.params;
//   const {  name, quantity, expiryDate,price,details,moreDetails,image} = req.body;

//   try {
//     const updatedItem = await Item.findByIdAndUpdate(
//       id,
//       {  name, quantity, expiryDate,price,details,moreDetails,image },
//       { new: true }
//     );

//     res.json(updatedItem);
//   } catch (error) {
//     res.status(400).json({ message: "Item not found" });
//   }
// };


// Update an item (including image updates)
const updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, quantity, expiryDate, price, details, moreDetails } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image; // ✅ Keep existing image if not updated

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { name, quantity, expiryDate, price, details, moreDetails, image },
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: "Item not found" });
  }
};

// Delete an item
const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    await Item.findByIdAndDelete(id);
    res.json({ message: "Item removed" });
  } catch (error) {
    res.status(400).json({ message: "Item not found" });
  }
};

// get single item by id (discarded items return 404 so they don't show on product page)
const getsingleitem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.isDiscarded === true) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update stock when purchasing
const updatestock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.quantity < quantity) return res.status(400).json({ message: "Not enough stock" });

    item.quantity -= quantity;

    if (item.quantity === 0) {
      await Item.findByIdAndDelete(req.params.id);
      return res.json({ message: "Item out of stock and removed." });
    } else {
      await item.save();
      return res.json({ message: "Purchase successful", item });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {getItems,createItem,updateItem,deleteItem,getsingleitem,updatestock};