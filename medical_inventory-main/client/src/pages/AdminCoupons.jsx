import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5000/api";

const toDateInputValue = (dateLike) => {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

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

  const [expiryModal, setExpiryModal] = useState({
    open: false,
    mode: "edit", // "edit" | "reactivate"
    coupon: null,
    expiryDate: "",
    saving: false,
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

  const openExpiryModal = (mode, coupon) => {
    setExpiryModal({
      open: true,
      mode,
      coupon,
      expiryDate: toDateInputValue(coupon?.expiryDate),
      saving: false,
    });
  };

  const closeExpiryModal = () => {
    setExpiryModal((prev) => ({
      ...prev,
      open: false,
      coupon: null,
      saving: false,
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

  const handleReactivate = async (id, expiryDate) => {
    await axios.put(`${API_BASE}/coupons/${id}/reactivate`, {
      expiryDate: expiryDate || null,
    });
  };

  const handleUpdateExpiry = async (id, expiryDate) => {
    await axios.put(`${API_BASE}/coupons/${id}/expiry`, {
      expiryDate: expiryDate || null,
    });
  };

  const handleSaveExpiryModal = async () => {
    const coupon = expiryModal.coupon;
    if (!coupon?._id) return;

    try {
      setExpiryModal((prev) => ({ ...prev, saving: true }));
      if (expiryModal.mode === "reactivate") {
        await handleReactivate(coupon._id, expiryModal.expiryDate);
        toast.success("Coupon reactivated");
      } else {
        await handleUpdateExpiry(coupon._id, expiryModal.expiryDate);
        toast.success("Expiry date updated");
      }
      fetchCoupons();
      closeExpiryModal();
    } catch (error) {
      console.error("Coupon update error:", error);
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setExpiryModal((prev) => ({ ...prev, saving: false }));
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
          <p className="text-xs text-gray-500 md:col-span-2 -mt-2">
            Date meaning: this is the coupon expiry date. After this date, the coupon cannot be used.
          </p>
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openExpiryModal("edit", c)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border"
                        >
                          Edit Expiry
                        </button>

                        {c.isActive ? (
                          <button
                            onClick={() => handleDeactivate(c._id)}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => openExpiryModal("reactivate", c)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {expiryModal.open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                {expiryModal.mode === "reactivate"
                  ? "Reactivate Coupon"
                  : "Edit Expiry Date"}
              </h3>
              <p className="text-sm text-gray-600">
                Coupon:{" "}
                <span className="font-semibold">{expiryModal.coupon?.code}</span>
              </p>
            </div>

            <div className="p-4 space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Expiry date (optional)
              </label>
              <input
                type="date"
                value={expiryModal.expiryDate}
                onChange={(e) =>
                  setExpiryModal((prev) => ({ ...prev, expiryDate: e.target.value }))
                }
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500">Leave empty to remove expiry.</p>
              <p className="text-xs text-gray-500">
                This date is coupon expiry date (validity end date).
              </p>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={closeExpiryModal}
                className="px-4 py-2 rounded border bg-white hover:bg-gray-50"
                disabled={expiryModal.saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveExpiryModal}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={expiryModal.saving}
              >
                {expiryModal.saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
