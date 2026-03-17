import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5000/api";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  company: "",
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const title = useMemo(
    () => (editingId ? "Edit Supplier" : "Add Supplier"),
    [editingId]
  );

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/suppliers`);
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch suppliers error:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await axios.put(`${API_BASE}/suppliers/${editingId}`, form);
        toast.success("Supplier updated");
      } else {
        await axios.post(`${API_BASE}/suppliers`, form);
        toast.success("Supplier created");
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchSuppliers();
    } catch (error) {
      console.error("Save supplier error:", error);
      toast.error(error.response?.data?.message || "Failed to save supplier");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setForm({
      name: s.name || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      company: s.company || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await axios.delete(`${API_BASE}/suppliers/${id}`);
      toast.success("Supplier deleted");
      fetchSuppliers();
    } catch (error) {
      console.error("Delete supplier error:", error);
      toast.error(error.response?.data?.message || "Failed to delete supplier");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Supplier Management</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Supplier name"
            value={form.name}
            onChange={onChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="company"
            placeholder="Company (optional)"
            value={form.company}
            onChange={onChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={onChange}
            className="p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={onChange}
            className="p-2 border rounded"
          />
          <textarea
            name="address"
            placeholder="Address (optional)"
            value={form.address}
            onChange={onChange}
            className="p-2 border rounded md:col-span-2"
            rows={3}
          />
          <div className="md:col-span-2 flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update Supplier" : "Add Supplier"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Suppliers</h2>
        {loading ? (
          <p className="text-gray-500">Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <p className="text-gray-500">No suppliers yet.</p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Company</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s._id} className="border-b">
                    <td className="p-2 font-semibold">{s.name}</td>
                    <td className="p-2">{s.company || "-"}</td>
                    <td className="p-2">{s.phone || "-"}</td>
                    <td className="p-2">{s.email || "-"}</td>
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(s._id)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
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

export default Suppliers;

