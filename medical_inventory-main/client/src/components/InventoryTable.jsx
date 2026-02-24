import { useState } from "react";
import { useItems } from "../store/itemStore";
import { ArrowUpDown, Search, Filter, Calendar } from "lucide-react";

const   InventoryTable = () => {
  const { items, formatDate } = useItems();
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filtering items
  const filteredItems = items.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (stockFilter === "" || eval(`${item.quantity} ${stockFilter}`)) &&
      (expiryFilter === "" ||
        (item.expiryDate &&
          new Date(item.expiryDate) >= new Date(expiryFilter)))
    );
  });

  // Sorting items by name
  const sortedItems = [...filteredItems].sort((a, b) =>
    sortOrder === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-6 justify-between items-end">
        {/* Search by Name */}
        <div className="flex flex-col">
          <div className="text-gray-900 font-semibold mb-1">Search items</div>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Type to search..."
              className="w-64 pl-10 pr-4 py-2 ring-1 ring-gray-500 rounded-lg bg-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter by Stock */}
        <div className="flex flex-col">
          <div className="text-gray-900 font-semibold mb-1">Filter Stock</div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <select
              className="w-52 pl-10 pr-4 py-2 ring-1 ring-gray-500 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">Select</option>
              <option value="> 10">Greater than 10</option>
              <option value="< 10">Less than 10</option>
              <option value="=== 10">Equal to 10</option>
            </select>
          </div>
        </div>

        {/* Filter by Expiry Date */}
        <div className="flex flex-col">
          <div className="text-gray-900 font-semibold mb-1">Expiry Date</div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input
              type="date"
              className="w-52 pl-10 pr-4 py-2 rounded-lg ring-1 ring-gray-500 bg-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setExpiryFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Sort Button */}
        <div className="flex flex-col">
          <div className="text-gray-700 font-semibold mb-1 invisible">Sort</div>
          <button
            className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 shadow-md transition-all"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <ArrowUpDown className="w-5 h-5" />
            Sort
          </button>
        </div>
      </div>

      {/* Updated Table Design with better light mode */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-left text-sm font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200">
                Item Name
              </th>
              <th className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-left text-sm font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200">
                Stock
              </th>
              <th className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-left text-sm font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200">
                Expiry Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedItems.length > 0 ? (
              sortedItems.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium
                    ${item.quantity < 10 
                      ? 'bg-red-50 text-red-900 dark:bg-red-900 dark:text-red-200' 
                      : item.quantity < 20 
                        ? 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-200'
                    }`}
                    > */}
                      {item.quantity}
                    {/* </span> */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
