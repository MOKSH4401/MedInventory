import { useItems } from "../store/itemStore";
import { AlertTriangle } from "lucide-react";

const LowStockList = ({ setView }) => {
  const { items } = useItems();
  const lowStockItems = items.filter((item) => item.quantity < 10);

  return (
    <div className="p-6 space-y-4">
      <button 
        onClick={() => setView("dashboard")} 
        className="mb-4 px-4 py-2 cursor-pointer  dark:text-gray"
      >
        ⬅ Back to Dashboard
      </button>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Low Stock Items</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200 border dark:border-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200 border dark:border-gray-600">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <tr 
                    key={item._id} 
                    className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{item.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ">
                        {item.quantity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    No low stock items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LowStockList;
