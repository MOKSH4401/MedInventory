import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import ItemsPage from "./pages/ItemsPage";
import SettingsPage from "./pages/SettingsPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCoupons from "./pages/AdminCoupons";
import ExpiredMedicines from "./pages/ExpiredMedicines";
import Reports from "./pages/Reports";
import PredictionReports from "./pages/PredictionReports";
import DemandPrediction from "./pages/DemandPrediction";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
         <ScrollToTop />
        <main className="flex-1 ml-64 p-6 overflow-auto bg-gray-100">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/expired-medicines" element={<ExpiredMedicines />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/predictions" element={<PredictionReports />} />
            <Route path="/demand-prediction" element={<DemandPrediction />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
