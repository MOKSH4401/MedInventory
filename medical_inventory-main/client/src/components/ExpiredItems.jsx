import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle } from "lucide-react";

const ExpiredItems = () => {
  const [expiredItems, setExpiredItems] = useState([]);

  useEffect(() => {
    const fetchExpiredItems = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/expired/history");
        setExpiredItems(data);
      } catch (error) {
        console.error("Error fetching expired items:", error);
      }
    };

    fetchExpiredItems();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="text-2xl font-bold text-gray-800 ">Expired Items</div>

      {/* Summary Card */}
      <div className=" p-6 rounded-lg border-1 border-red-400 shadow flex items-center space-x-4">
        <AlertTriangle className="w-10 h-10 text-red-400 dark:text-red-400" />
        <div>
          <p className="text-gray-600 dark:text-gray-300">Total Expired Items</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-100">{expiredItems.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Expired Items List</h2>
        {expiredItems.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No expired items found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <th className="p-4 text-left bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-b border-gray-200">
                    Item Name
                  </th>
                  <th className="p-4 text-left bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-b border-gray-200">
                    Quantity
                  </th>
                  <th className="p-4 text-left bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-b border-gray-200">
                    Expiry Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {expiredItems.map((item) => (
                  <tr
                    key={item._id}
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600`}
                  >
                    <td className="p-4 text-gray-800 dark:text-gray-200">{item.name}</td>
                    <td className="p-4 text-gray-800 dark:text-gray-200">{item.quantity}</td>
                    <td className="p-4 text-red-600 dark:text-red-400">
                      {new Date(item.expiryDate).toDateString()}
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

export default ExpiredItems;


