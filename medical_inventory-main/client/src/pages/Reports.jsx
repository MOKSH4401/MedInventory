import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Package,
  CreditCard,
  FileText,
  AlertTriangle,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const PAYMENT_COLORS = { cash: "#22c55e", upi: "#3b82f6", card: "#8b5cf6" };

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sales, setSales] = useState(null);
  const [profit, setProfit] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [payment, setPayment] = useState(null);
  const [purchases, setPurchases] = useState(null);
  const [purchasePage, setPurchasePage] = useState(1);

  const formatCurrency = (n) => `₹${Number(n).toLocaleString()}`;
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        const params = {
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        };
        const [salesRes, profitRes, invRes, payRes, purchasesRes] = await Promise.all([
          axios.get(`${API_BASE}/reports/sales`, { params }),
          axios.get(`${API_BASE}/reports/profit`),
          axios.get(`${API_BASE}/reports/inventory`),
          axios.get(`${API_BASE}/reports/payment`),
          axios.get(`${API_BASE}/reports/purchases`, {
            params: { page: 1, limit: 20 },
          }),
        ]);
        setSales(salesRes.data);
        setProfit(profitRes.data);
        setInventory(invRes.data);
        setPayment(payRes.data);
        setPurchases(purchasesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    if (!purchases || purchasePage === 1) return;
    axios
      .get(`${API_BASE}/reports/purchases`, {
        params: { page: purchasePage, limit: 20 },
      })
      .then((res) => setPurchases(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load purchases"));
  }, [purchasePage]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const salesChartData =
    sales?.salesByDate?.map(({ date, total }) => ({
      date: formatDate(date),
      sales: total,
    })) ?? [];

  const paymentChartData = payment
    ? [
        { name: "Cash", value: payment.cash || 0, color: PAYMENT_COLORS.cash },
        { name: "UPI", value: payment.upi || 0, color: PAYMENT_COLORS.upi },
        { name: "Card", value: payment.card || 0, color: PAYMENT_COLORS.card },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
      <p className="text-gray-600">Sales, profit, inventory, and payment analytics</p>

      {/* Sales Report */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" /> Sales Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold">{formatCurrency(sales?.totalSales ?? 0)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold">{sales?.totalOrders ?? 0}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-2">Sales by date (last 7 days)</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(val) => [formatCurrency(val), "Sales"]} />
              <Bar dataKey="sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Profit Report */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Profit & Loss Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Revenue (Gross)</p>
            <p className="text-xl font-bold text-green-700">
              {formatCurrency(profit?.totalRevenue ?? 0)}
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Discount Given</p>
            <p className="text-xl font-bold text-amber-700">
              {formatCurrency(profit?.totalDiscountGiven ?? 0)}
            </p>
          </div>
          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-gray-600">Net Revenue</p>
            <p className="text-xl font-bold text-teal-700">
              {formatCurrency(profit?.netRevenue ?? profit?.totalRevenue ?? 0)}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-xl font-bold text-red-700">
              {formatCurrency(profit?.totalCost ?? 0)}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Profit</p>
            <p className="text-xl font-bold text-blue-700">
              {formatCurrency(profit?.totalProfit ?? 0)}
            </p>
          </div>
        </div>
      </section>

      {/* Inventory Report */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" /> Inventory Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold">{inventory?.totalItems ?? 0}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Stock</p>
            <p className="text-2xl font-bold">{inventory?.totalStock ?? 0}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" /> Low Stock
            </h3>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-2">Item</th>
                    <th className="text-right p-2">Qty</th>
                    <th className="text-right p-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(inventory?.lowStockItems ?? []).length > 0 ? (
                    inventory.lowStockItems.map((item) => (
                      <tr key={item._id} className="border-b">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-right text-yellow-600">{item.quantity}</td>
                        <td className="p-2 text-right">₹{item.price}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-gray-500 text-center">
                        No low stock items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Out of Stock</h3>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-2">Item</th>
                    <th className="text-right p-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(inventory?.outOfStockItems ?? []).length > 0 ? (
                    inventory.outOfStockItems.map((item) => (
                      <tr key={item._id} className="border-b">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-right">₹{item.price}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-4 text-gray-500 text-center">
                        No out of stock items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Report */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-600" /> Payment Report
        </h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
            Cash: {formatCurrency(payment?.cash ?? 0)}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
            UPI: {formatCurrency(payment?.upi ?? 0)}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">
            Card: {formatCurrency(payment?.card ?? 0)}
          </span>
        </div>
        {paymentChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={paymentChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) =>
                  `${name}: ${formatCurrency(value)}`
                }
              >
                {paymentChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => formatCurrency(val)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 py-4">No payment data yet</p>
        )}
      </section>

      {/* Purchase History Report */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-teal-600" /> Purchase History
        </h2>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Item</th>
                <th className="text-right p-2">Qty</th>
                <th className="text-right p-2">Total</th>
                <th className="text-right p-2">Discount</th>
                <th className="text-right p-2">Final</th>
                <th className="text-left p-2">Coupon</th>
                <th className="text-left p-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {(purchases?.purchases ?? []).length > 0 ? (
                purchases.purchases.map((p, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{formatDate(p.purchaseDate)}</td>
                    <td className="p-2">{p.itemName || "—"}</td>
                    <td className="p-2 text-right">{p.quantity}</td>
                    <td className="p-2 text-right">{formatCurrency(p.totalAmount)}</td>
                    <td className="p-2 text-right text-amber-600">
                      {p.discountAmount ? formatCurrency(p.discountAmount) : "—"}
                    </td>
                    <td className="p-2 text-right font-medium">
                      {formatCurrency(p.finalAmount ?? p.totalAmount)}
                    </td>
                    <td className="p-2">{p.couponCode || "—"}</td>
                    <td className="p-2 capitalize">{p.paymentMode}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-gray-500 text-center">
                    No purchases yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {purchases?.pagination && purchases.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Page {purchases.pagination.page} of {purchases.pagination.totalPages} (
              {purchases.pagination.total} records)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPurchasePage((p) => Math.max(1, p - 1))}
                disabled={purchasePage <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPurchasePage((p) =>
                    Math.min(purchases.pagination.totalPages, p + 1)
                  )
                }
                disabled={purchasePage >= purchases.pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Reports;
