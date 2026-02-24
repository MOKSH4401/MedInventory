import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://localhost:5000/api";

const InventoryChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: res } = await axios.get(`${API_BASE}/dashboard`);
        const monthly = res?.monthlyTrend ?? [];
        const chartData = monthly.map((m) => ({
          month: `${m.month} ${String(m.year).slice(-2)}`,
          sales: m.total ?? 0,
          restock: m.quantity ?? 0,
        }));
        setData(chartData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load chart data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Sales & Restock Trends</h2>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          Loading chart...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Sales & Restock Trends</h2>
        <div className="h-[300px] flex items-center justify-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Sales & Restock Trends</h2>
      <p className="text-sm text-gray-500 mb-2">
        Last 6 months — Sales (₹ revenue) & Units Sold (restock indicator)
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              name === "sales" ? `₹${Number(value).toLocaleString()}` : value,
              name === "sales" ? "Sales (₹)" : "Units Sold",
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Sales (₹)"
          />
          <Line
            type="monotone"
            dataKey="restock"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Units Sold"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryChart;
