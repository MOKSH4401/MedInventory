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
} from "recharts";
import { Brain, RefreshCw } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const DemandPrediction = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: res } = await axios.get(`${API_BASE}/ml/predictions`);
      setData(res);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load demand predictions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">
            Running ML prediction... This may take a moment.
          </p>
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
        <p className="mt-2 text-sm text-gray-600">
          Ensure Python is installed with: pandas, pymongo, scikit-learn
        </p>
      </div>
    );
  }

  const predictions = data?.predictions ?? [];
  const chartData = predictions.map((p) => ({
    name: p.itemName?.length > 15 ? p.itemName.slice(0, 15) + "…" : p.itemName,
    demand: p.predictedDemand ?? p.predictedDemandNextMonth ?? 0,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Demand Prediction (ML)
          </h1>
          <p className="text-gray-600 mt-1">
            Predicted medicine demand for next 30 days using Linear Regression
          </p>
        </div>
        <button
          onClick={fetchPredictions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Table */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" /> Predicted Demand Next Month
        </h2>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3">Medicine Name</th>
                <th className="text-right p-3">Predicted Demand</th>
              </tr>
            </thead>
            <tbody>
              {predictions.length > 0 ? (
                predictions.map((p, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3">{p.itemName}</td>
                    <td className="p-3 text-right font-medium">
                      {p.predictedDemand ?? p.predictedDemandNextMonth ?? 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-6 text-gray-500 text-center">
                    No predictions. Add more sales data to train the model.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Chart */}
      {chartData.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Demand by Medicine</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="demand" fill="#6366f1" radius={[4, 4, 0, 0]} name="Predicted Demand" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
};

export default DemandPrediction;
