const Supplier = require("../models/Supplier");

const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, company } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      phone,
      email,
      address,
      company,
    });

    return res.status(201).json(supplier);
  } catch (error) {
    console.error("Create supplier error:", error);
    return res.status(500).json({ message: "Failed to create supplier" });
  }
};

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 }).lean();
    return res.json(suppliers);
  } catch (error) {
    console.error("Get suppliers error:", error);
    return res.status(500).json({ message: "Failed to fetch suppliers" });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, company } = req.body;

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(company !== undefined ? { company } : {}),
      },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    return res.json(supplier);
  } catch (error) {
    console.error("Update supplier error:", error);
    return res.status(500).json({ message: "Failed to update supplier" });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    return res.json({ message: "Supplier deleted" });
  } catch (error) {
    console.error("Delete supplier error:", error);
    return res.status(500).json({ message: "Failed to delete supplier" });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
};

