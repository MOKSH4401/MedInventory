import { useState, useEffect } from "react";

import { Package, AlertTriangle, Clock } from "lucide-react";
import { useItems } from "../store/itemStore";
import LowStockList from "../components/LowStockList";
import ExpiringSoonList from "../components/ExpiringSoonList";
import InventoryChart from "../components/Inventorychart";
import Notifications from "../components/Notifications";
import ExportData from "../components/ExportData";
import RestockSuggestions from "../components/RestockSuggestions";
import { NavLink } from "react-router-dom";

const DashboardPage = () => {
  const { items } = useItems();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [view, setView] = useState("dashboard");

  useEffect(() => {
    setLowStockCount(items.filter((item) => item.quantity < 10).length);
    setExpiringSoonCount(
      items.filter((item) => new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length
    );
  }, [items]);

  if (view === "lowStock") return <LowStockList setView={setView} />;
  if (view === "expiringSoon") return <ExpiringSoonList setView={setView} />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Welcome to medical inventory system</p>
      
      {/* Cards */}
      <div className="grid grid-cols-3 gap-6">
        <NavLink to="/inventory">
          <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
            <Package className="w-10 h-10 text-blue-500" />
            <div>
              <p className="text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
          </div>
        </NavLink>

        {/* Low Stock Alert Card - Updated for better dark mode contrast */}
        <div 
          onClick={() => setView("lowStock")} 
          className="cursor-pointer bg-yellow-100 text-gray-600 p-6 rounded-lg shadow flex items-center space-x-4 border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-center space-x-4">
            <AlertTriangle className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
            <div>
              <div className=" lowstockalterts text-gray-800 ">Low Stock Alerts</div>
              <div className=" lowstockalterts text-2xl font-bold text-gray-800 ">{lowStockCount}</div>
            </div>
          </div>
          
        </div>

        <div onClick={() => setView("expiringSoon")} className="cursor-pointer bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <Clock className="w-10 h-10 text-blue-500" />
          <div>
            <p className="text-gray-600">Expiring Soon</p>
            <p className="text-2xl font-bold">{expiringSoonCount}</p>
          </div>
        </div>
      </div>
      
      <Notifications />
      <ExportData />
      <RestockSuggestions />
      <InventoryChart />
    </div>
  );
};

export default DashboardPage;
