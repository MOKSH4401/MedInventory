import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5000/api";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    expiryDate: "",
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/coupons`);
      setCoupons(data);
    } catch (error) {
      console.error("Fetch coupons error:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: form.code.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minPurchaseAmount: form.minPurchaseAmount
          ? Number(form.minPurchaseAmount)
          : 0,
        maxDiscountAmount: form.maxDiscountAmount
          ? Number(form.maxDiscountAmount)
          : undefined,
        expiryDate: form.expiryDate || undefined,
      };
      await axios.post(`${API_BASE}/coupons`, payload);
      toast.success("Coupon created");
      setForm({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minPurchaseAmount: "",
        maxDiscountAmount: "",
        expiryDate: "",
      });
      fetchCoupons();
    } catch (error) {
      console.error("Create coupon error:", error);
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await axios.put(`${API_BASE}/coupons/${id}/deactivate`);
      toast.success("Coupon deactivated");
      fetchCoupons();
    } catch (error) {
      console.error("Deactivate coupon error:", error);
      toast.error("Failed to deactivate coupon");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Coupon Management</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Create Coupon</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="code"
            placeholder="Code (e.g. SAVE10)"
            value={form.code}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (₹)</option>
          </select>
          <input
            type="number"
            name="discountValue"
            placeholder="Discount value"
            value={form.discountValue}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="minPurchaseAmount"
            placeholder="Min purchase amount"
            value={form.minPurchaseAmount}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="maxDiscountAmount"
            placeholder="Max discount amount (optional)"
            value={form.maxDiscountAmount}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Coupon
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Coupons</h2>
        {loading ? (
          <p className="text-gray-500">Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p className="text-gray-500">No coupons created yet.</p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-right p-2">Value</th>
                  <th className="text-right p-2">Min Purchase</th>
                  <th className="text-right p-2">Max Discount</th>
                  <th className="text-left p-2">Expiry</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c._id} className="border-b">
                    <td className="p-2 font-semibold">{c.code}</td>
                    <td className="p-2 capitalize">{c.discountType}</td>
                    <td className="p-2 text-right">
                      {c.discountType === "percentage"
                        ? `${c.discountValue}%`
                        : `₹${c.discountValue}`}
                    </td>
                    <td className="p-2 text-right">₹{c.minPurchaseAmount || 0}</td>
                    <td className="p-2 text-right">
                      {c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : "-"}
                    </td>
                    <td className="p-2">
                      {c.expiryDate
                        ? new Date(c.expiryDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-2">
                      {c.isActive ? (
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      {c.isActive && (
                        <button
                          onClick={() => handleDeactivate(c._id)}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Deactivate
                        </button>
                      )}
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

export default AdminCoupons;
