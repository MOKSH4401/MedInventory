import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const SupplierPurchases = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    supplierId: "",
    itemId: "",
    company: "",
    costPrice: "",
    quantity: "",
    expiryDate: "",
    purchaseDate: "",
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [sRes, iRes, pRes, sumRes] = await Promise.all([
        axios.get(`${API_BASE}/suppliers`),
        axios.get(`${API_BASE}/items`),
        axios.get(`${API_BASE}/supplier-purchases`),
        axios.get(`${API_BASE}/supplier-purchases/summary`),
      ]);
      setSuppliers(Array.isArray(sRes.data) ? sRes.data : []);
      setItems(Array.isArray(iRes.data) ? iRes.data : []);
      setPurchases(Array.isArray(pRes.data) ? pRes.data : []);
      setSummary(Array.isArray(sumRes.data) ? sumRes.data : []);
    } catch (error) {
      console.error("Fetch supplier purchases error:", error);
      toast.error("Failed to load supplier purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const supplierMap = useMemo(() => {
    const m = new Map();
    suppliers.forEach((s) => m.set(s._id, s));
    return m;
  }, [suppliers]);

  const itemMap = useMemo(() => {
    const m = new Map();
    items.forEach((i) => m.set(i._id, i));
    return m;
  }, [items]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSupplierChange = (e) => {
    const supplierId = e.target.value;
    const s = supplierMap.get(supplierId);
    setForm((p) => ({
      ...p,
      supplierId,
      company: p.company || s?.company || "",
    }));
  };

  const onItemChange = (e) => {
    const itemId = e.target.value;
    const it = itemMap.get(itemId);
    setForm((p) => ({
      ...p,
      itemId,
      costPrice: p.costPrice || (it?.costPrice != null ? String(it.costPrice) : ""),
      expiryDate: p.expiryDate || (it?.expiryDate ? String(it.expiryDate).slice(0, 10) : ""),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplierId || !form.itemId) {
      toast.error("Please select supplier and medicine");
      return;
    }
    const qty = Number(form.quantity);
    const cp = Number(form.costPrice);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }
    if (!Number.isFinite(cp) || cp < 0) {
      toast.error("Cost price must be valid");
      return;
    }

    try {
      setSaving(true);
      await axios.post(`${API_BASE}/supplier-purchases`, {
        supplierId: form.supplierId,
        itemId: form.itemId,
        company: form.company || undefined,
        costPrice: cp,
        quantity: qty,
        expiryDate: form.expiryDate || undefined,
        purchaseDate: form.purchaseDate || undefined,
      });
      toast.success("Purchase added and inventory updated");
      setForm({
        supplierId: "",
        itemId: "",
        company: "",
        costPrice: "",
        quantity: "",
        expiryDate: "",
        purchaseDate: "",
      });
      await fetchAll();
    } catch (error) {
      console.error("Add purchase error:", error);
      toast.error(error.response?.data?.message || "Failed to add purchase");
    } finally {
      setSaving(false);
    }
  };

  const maxTotal = useMemo(() => {
    return summary.reduce((m, r) => Math.max(m, Number(r.totalPurchase) || 0), 0) || 1;
  }, [summary]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Supplier Purchases</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add Purchase</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="supplierId"
            value={form.supplierId}
            onChange={onSupplierChange}
            className="p-2 border rounded"
            required
          >
            <option value="">Select supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-end">
            <Link
              to="/suppliers"
              className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Supplier
            </Link>
          </div>

          <select
            name="itemId"
            value={form.itemId}
            onChange={onItemChange}
            className="p-2 border rounded"
            required
          >
            <option value="">Select medicine</option>
            {items.map((i) => (
              <option key={i._id} value={i._id}>
                {i.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="company"
            placeholder="Company (e.g. Zydus, Torrent)"
            value={form.company}
            onChange={onChange}
            className="p-2 border rounded"
          />

          <input
            type="number"
            name="costPrice"
            placeholder="Cost price"
            value={form.costPrice}
            onChange={onChange}
            className="p-2 border rounded"
            min="0"
            step="0.01"
            required
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity purchased"
            value={form.quantity}
            onChange={onChange}
            className="p-2 border rounded"
            min="1"
            step="1"
            required
          />

          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={onChange}
            className="p-2 border rounded"
          />
          <p className="text-xs text-gray-500 -mt-2">
            Expiry Date: medicine batch expiry date from supplier invoice.
          </p>

          <input
            type="date"
            name="purchaseDate"
            value={form.purchaseDate}
            onChange={onChange}
            className="p-2 border rounded"
          />
          <p className="text-xs text-gray-500 -mt-2">
            Purchase Date: date when you bought this stock from supplier.
          </p>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add Purchase"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Supplier-wise Total Purchase</h2>
        <p className="text-xs text-gray-500 mb-3">
          X-axis: Supplier name | Y-axis: Total purchase cost (₹)
        </p>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : summary.length === 0 ? (
          <p className="text-gray-500">No purchase data yet.</p>
        ) : (
          <div className="space-y-3">
            {summary.map((r) => {
              const value = Number(r.totalPurchase) || 0;
              const pct = Math.max(2, Math.round((value / maxTotal) * 100));
              return (
                <div key={r.supplierName} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800">{r.supplierName || "Unknown"}</span>
                    <span className="text-gray-700">₹{value.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded">
                    <div
                      className="h-3 bg-green-600 rounded"
                      style={{ width: `${pct}%` }}
                      aria-label={`${r.supplierName} total purchase`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Purchase History</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : purchases.length === 0 ? (
          <p className="text-gray-500">No purchases yet.</p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2">Purchase Date</th>
                  <th className="text-left p-2">Supplier</th>
                  <th className="text-left p-2">Medicine</th>
                  <th className="text-left p-2">Company</th>
                  <th className="text-right p-2">Cost Price</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Total Cost</th>
                  <th className="text-left p-2">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p._id} className="border-b">
                    <td className="p-2">
                      {p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-2">{p.supplierName || "-"}</td>
                    <td className="p-2 font-semibold">{p.itemName || "-"}</td>
                    <td className="p-2">{p.company || "-"}</td>
                    <td className="p-2 text-right">₹{Number(p.costPrice || 0).toFixed(2)}</td>
                    <td className="p-2 text-right">{p.quantity || 0}</td>
                    <td className="p-2 text-right">₹{Number(p.totalCost || 0).toFixed(2)}</td>
                    <td className="p-2">
                      {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierPurchases;

