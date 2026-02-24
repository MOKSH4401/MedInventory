import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Bell } from "lucide-react";
import { useItems } from "../store/itemStore";

const Notifications = () => {
  const { items } = useItems();
  const [hasShownAlerts, setHasShownAlerts] = useState(false);

  const lowStockItems = items.filter((item) => item.quantity < 10);
  const expiringSoonItems = items.filter(
    (item) => new Date(item.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  useEffect(() => {
    const alertsShown = localStorage.getItem("alertsShown");

    if (!alertsShown) {
      if (lowStockItems.length > 0 || expiringSoonItems.length > 0) {
        lowStockItems.forEach((item) => {
          toast.error(`⚠ ${item.name} is low in stock!`, { duration: 5000 });
        });

        expiringSoonItems.forEach((item) => {
          toast(`⏳ ${item.name} is expiring soon!`, { duration: 5000, icon: "⏳" });
        });

        localStorage.setItem("alertsShown", "true"); // Set flag to prevent future popups
        setHasShownAlerts(true);
      }
    }
  }, [items]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Toaster /> {/* This enables toast notifications */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-6 h-6 text-red-500" />
        Notifications
      </h2>
      {lowStockItems.length === 0 && expiringSoonItems.length === 0 ? (
        <p className="text-gray-600">No critical alerts.</p>
      ) : (
        <ul className="space-y-2">
          {lowStockItems.map((item) => (
            <li key={item.name} className="text-red-600 dark:text-red-500">⚠ {item.name} is low in stock!</li>
          ))}
          {expiringSoonItems.map((item) => (
            <li key={item.name} className="text-orange-600">⏳ {item.name} is expiring soon!</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
