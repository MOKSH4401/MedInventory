import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const PredictionReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostSold, setMostSold] = useState([]);
  const [leastSold, setLeastSold] = useState([]);
  const [topRevenue, setTopRevenue] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [mostRes, leastRes, revenueRes, trendRes, monthlyRes] = await Promise.all([
          axios.get(`${API_BASE}/predictions/most-sold`),
          axios.get(`${API_BASE}/predictions/least-sold`),
          axios.get(`${API_BASE}/predictions/top-revenue`),
          axios.get(`${API_BASE}/predictions/sales-trend`),
          axios.get(`${API_BASE}/predictions/monthly-trend`),
        ]);
        setMostSold(mostRes.data);
        setLeastSold(leastRes.data);
        setTopRevenue(revenueRes.data);
        setSalesTrend(trendRes.data);
        setMonthlyTrend(monthlyRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load prediction reports");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatCurrency = (n) => `₹${Number(n).toLocaleString()}`;
  const formatChartDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : d;
  const monthName = (m) => {
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return names[Number(m) - 1] || m;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading prediction reports...</p>
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

  const salesTrendData = salesTrend.map(({ date, totalSales }) => ({
    date: formatChartDate(date),
    sales: totalSales,
  }));

  const monthlyTrendData = monthlyTrend.map(({ year, month, totalSales }) => ({
    label: `${monthName(month)} ${year}`,
    sales: totalSales,
  }));

  const Table = ({ data, columns }) => (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            {columns.map((col) => (
              <th key={col.key} className={col.align === "right" ? "text-right p-2" : "text-left p-2"}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i} className="border-b">
                {columns.map((col) => (
                  <td key={col.key} className={col.align === "right" ? "text-right p-2" : "p-2"}>
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-4 text-gray-500 text-center">
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Medicine Sales Analysis & Prediction</h1>
      <p className="text-gray-600">Most sold, least sold, revenue, and trend reports</p>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" /> Most Sold Medicines (Top 10)
          </h2>
          <Table
            data={mostSold}
            columns={[
              { key: "itemName", label: "Medicine" },
              { key: "totalSold", label: "Qty Sold", align: "right" },
            ]}
          />
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-600" /> Least Sold Medicines (Bottom 10)
          </h2>
          <Table
            data={leastSold}
            columns={[
              { key: "itemName", label: "Medicine" },
              { key: "totalSold", label: "Qty Sold", align: "right" },
            ]}
          />
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" /> Top Revenue Medicines (Top 10)
          </h2>
          <Table
            data={topRevenue}
            columns={[
              { key: "itemName", label: "Medicine" },
              { key: "totalRevenue", label: "Revenue", align: "right", format: formatCurrency },
            ]}
          />
        </section>
      </div>

      {/* Sales Trend - LineChart */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" /> Sales Trend (Last 7 Days)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(val) => [formatCurrency(val), "Sales"]} />
            <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Monthly Trend - BarChart */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Sales Trend</h2>
        {monthlyTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(val) => [formatCurrency(val), "Sales"]} />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 py-8 text-center">No monthly data yet</p>
        )}
      </section>
    </div>
  );
};

export default PredictionReports;
