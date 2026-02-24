import { useState } from "react";
import axios from "axios";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useItems } from "../store/itemStore";

const API_BASE = "http://localhost:5000/api";

const ExpiredMedicines = () => {
  const { items, fetchItems } = useItems();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [discardConfirmId, setDiscardConfirmId] = useState(null);

  const now = Date.now();
  const expiredList = items.filter(
    (item) =>
      item.expiryDate &&
      new Date(item.expiryDate).getTime() < now &&
      item.isDiscarded !== true
  );

  const handleDiscardClick = (id) => setDiscardConfirmId(id);
  const handleCancelDiscard = () => setDiscardConfirmId(null);

  const handleConfirmDiscard = async () => {
    if (!discardConfirmId) return;
    try {
      await axios.put(`${API_BASE}/expired/discard/${discardConfirmId}`);
      await fetchItems();
      setSuccessMessage("Medicine discarded successfully");
      setDiscardConfirmId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to discard medicine");
      setDiscardConfirmId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        Expired Medicines
      </h1>
      <p className="text-gray-600">
        Medicines past their expiry date. Discard them to remove from active inventory.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-600">
                <th className="py-3 px-4 font-semibold">Medicine Name</th>
                <th className="py-3 px-4 font-semibold">Expiry Date</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {expiredList.length > 0 ? (
                expiredList.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(item.expiryDate)}</td>
                    <td className="py-3 px-4 text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDiscardClick(item._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Discard
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-gray-500 text-center">
                    No expired medicines found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation dialog */}
      {discardConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <p className="text-gray-800 font-medium mb-4">
              This medicine is expired. Do you want to discard it?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelDiscard}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiredMedicines;
