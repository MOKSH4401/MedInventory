import { Link } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, PlusCircle, Settings, Package, BarChart3, FileBarChart, TrendingUp, Brain, Tag } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 w-64  h-screen p-5 overflow-y-auto">
      <h1 className="text-2xl font-bold">MedInventory</h1>
      <nav className="mt-6 space-y-3">
        <Link 
          to="/" 
          className="flex items-center gap-2 p-3 rounded-lg transition-all hover:text-blue-700"
        >
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </Link>
        <Link 
          to="/admin" 
          className="flex items-center gap-2 p-3 rounded-lg transition-all hover:text-blue-700"
        >
          <BarChart3 className="w-5 h-5" /> Admin Analytics
        </Link>
        <Link 
          to="/admin/coupons" 
          className="flex items-center gap-2 p-3 rounded-lg transition-all hover:text-blue-700"
        >
          <Tag className="w-5 h-5" /> Coupons
        </Link>
        <Link 
          to="/reports" 
          className="flex items-center gap-2 p-3 rounded-lg transition-all hover:text-blue-700"
        >
          <FileBarChart className="w-5 h-5" /> Reports
        </Link>
        <Link 
          to="/predictions" 
          className="flex items-center gap-2 p-3 rounded-lg transition-all hover:text-blue-700"
        >
          <TrendingUp className="w-5 h-5" /> Sales Analysis
        </Link>
        <Link 
          to="/demand-prediction" 
          className="flex items-center gap-2 p-3 rounded-lg transition-all hover:text-blue-700"
        >
          <Brain className="w-5 h-5" /> Demand Prediction
        </Link>
        <Link 
          to="/inventory" 
          className="flex items-center gap-2 p-3 rounded-lg transition-all hover:text-blue-700 "
        >
          <Package className="w-5 h-5" /> Inventory
        </Link>
        <Link 
          to="/items" 
          className="flex items-center gap-2 p-3 rounded-lg  transition-all hover:text-blue-700"
        >
          <PlusCircle className="w-5 h-5" /> Items
        </Link>
        <Link 
          to="/products" 
          className="flex items-center gap-2 p-3 rounded-lg  transition-all hover:text-blue-700"
        >
          <ShoppingBag className="w-5 h-5" /> Products
        </Link>
        <Link 
          to="/settings" 
          className="flex items-center gap-2 p-3 rounded-lg transition-all hover:text-blue-700"
        >
          <Settings className="w-5 h-5" /> Settings
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;


