import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Bell, Trash2 } from "lucide-react";
import { useItems } from "../store/itemStore";

const API_BASE = "http://localhost:5000/api";

/** Start of next day so "today" expiry is considered expired */
const getStartOfNextDay = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const Notifications = () => {
  const { items, fetchItems } = useItems();
  const [hasShownAlerts, setHasShownAlerts] = useState(false);
  const [discardConfirmId, setDiscardConfirmId] = useState(null);
  const [discarding, setDiscarding] = useState(false);

  const now = Date.now();
  const in7Days = now + 7 * 24 * 60 * 60 * 1000;
  const startOfNextDay = getStartOfNextDay().getTime();

  const lowStockItems = items.filter((item) => item.quantity < 10);
  const expiringSoonItems = items.filter(
    (item) => item.expiryDate && new Date(item.expiryDate).getTime() >= now && new Date(item.expiryDate).getTime() < in7Days
  );
  const expiredItems = items.filter(
    (item) =>
      item.expiryDate &&
      new Date(item.expiryDate).getTime() < startOfNextDay &&
      item.isDiscarded !== true
  );

  useEffect(() => {
    const alertsShown = localStorage.getItem("alertsShown");

    if (!alertsShown) {
      if (lowStockItems.length > 0 || expiringSoonItems.length > 0 || expiredItems.length > 0) {
        lowStockItems.forEach((item) => {
          toast.error(`⚠ ${item.name} is low in stock!`, { duration: 5000 });
        });
        expiringSoonItems.forEach((item) => {
          toast(`⏳ ${item.name} is expiring soon!`, { duration: 5000, icon: "⏳" });
        });
        expiredItems.forEach((item) => {
          toast.error(`🚫 ${item.name} is expired. Discard from Expired Medicines.`, { duration: 6000 });
        });
        localStorage.setItem("alertsShown", "true");
        setHasShownAlerts(true);
      }
    }
  }, [items]);

  const handleDiscardClick = (id) => setDiscardConfirmId(id);
  const handleCancelDiscard = () => setDiscardConfirmId(null);

  const handleConfirmDiscard = async () => {
    if (!discardConfirmId) return;
    try {
      setDiscarding(true);
      await axios.put(`${API_BASE}/expired/discard/${discardConfirmId}`);
      await fetchItems();
      toast.success("Medicine discarded successfully");
      setDiscardConfirmId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to discard medicine");
      setDiscardConfirmId(null);
    } finally {
      setDiscarding(false);
    }
  };

  const hasAnyAlert = lowStockItems.length > 0 || expiringSoonItems.length > 0 || expiredItems.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Toaster />
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-6 h-6 text-red-500" />
        Notifications
      </h2>
      {!hasAnyAlert ? (
        <p className="text-gray-600">No critical alerts.</p>
      ) : (
        <ul className="space-y-3">
          {lowStockItems.map((item) => (
            <li key={item._id || item.name} className="text-red-600 dark:text-red-500">
              ⚠ {item.name} is low in stock!
            </li>
          ))}
          {expiringSoonItems.map((item) => (
            <li key={item._id || item.name} className="text-orange-600">
              ⏳ {item.name} is expiring soon!
            </li>
          ))}
          {expiredItems.length > 0 && (
            <li className="pt-2 border-t border-gray-200">
              <span className="block text-red-600 font-medium mb-1">Expired medicines – discard from inventory</span>
              {expiredItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-2 pl-2 py-1">
                  <span className="text-red-600/90">🚫 {item.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDiscardClick(item._id)}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Discard
                  </button>
                </div>
              ))}
              <Link
                to="/admin/expired-medicines"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                View all on Expired Medicines page
              </Link>
            </li>
          )}
        </ul>
      )}

      {/* Confirmation dialog for discard from dashboard */}
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
                disabled={discarding}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                disabled={discarding}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {discarding ? "Discarding…" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
