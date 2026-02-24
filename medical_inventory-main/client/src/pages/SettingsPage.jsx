import { useSettings } from "../store/SettingsStore";
import { Moon, Sun, DollarSign, History, X, FileText, Download } from "lucide-react"; // Add Download icon import
import { useState, useRef } from "react";
import { generatePDF } from '../utils/generatePDF';
import BillTemplate from '../components/BillTemplate';

const SettingsPage = () => {
  const { settings, updateSettings, purchaseHistory } = useSettings();
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const billTemplateRef = useRef();

  const currencies = [
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "GBP", symbol: "£" },
    { code: "INR", symbol: "₹" },
  ];

  const toggleTheme = () => {
    updateSettings({ ...settings, theme: settings.theme === "light" ? "dark" : "light" });
  };

  const generateBill = async (purchase) => {
    await generatePDF(billTemplateRef.current, `invoice-${purchase.buyerName}-${Date.now()}.pdf`);
  };

  const exportToCSV = () => {
    if (purchaseHistory.length === 0) {
      toast.error("No purchase history to export");
      return;
    }

    // Prepare CSV data
    const headers = ["Date", "Customer Name", "Phone", "Item", "Quantity", "Price", "Total Amount", "Payment Mode"];
    const csvData = purchaseHistory.map(purchase => [
      new Date(purchase.purchaseDate).toLocaleDateString(),
      purchase.buyerName,
      purchase.buyerPhone,
      purchase.itemName,
      purchase.quantity,
      purchase.price,
      purchase.totalAmount,
      purchase.paymentMode
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `purchase_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Purchase History Modal
  const PurchaseDetailsModal = ({ purchase, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full relative print-bill">
        {/* Force light theme styles */}
        <style>
          {`
            .print-bill {
              background-color: white !important;
              color: black !important;
            }
            .print-bill * {
              background-color: white !important;
              color: black !important;
            }
          `}
        </style>
        <button 
          onClick={onClose}
          className="absolute border top-4 right-4 cursor-pointer hover:text-gray-700"
        >
          <X size={24} />
        </button>

        {/* Show only the BillTemplate */}
        <BillTemplate ref={billTemplateRef} purchaseData={purchase} settings={settings} />

        <div className="mt-6 flex justify-end space-x-4 ">
          <button
            onClick={() => generateBill(purchase)}
            className="flex items-center gap-2  border cursor-pointer  px-4 py-2 rounded"
          >
            <FileText size={18} />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border text-gray-600 cursor-pointer hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-primary">Settings</h1>

      {/* Theme Toggle */}
      <div className="bg-white p-6 rounded-lg shadow-lg transition-colors">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
          {settings.theme === "light" 
            ? <Sun className="w-5 h-5 text-yellow-500" /> 
            : <Moon className="w-5 h-5 text-blue-400" />
          }
          Theme
        </h2>
        <button
          onClick={toggleTheme}
          className="btn-primary px-4 py-2 rounded-lg transition-colors"
        >
          Switch to {settings.theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div>

      {/* Currency Selection */}
      <div className="bg-white p-6 rounded-lg shadow-lg transition-colors">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
          <DollarSign className="w-5 h-5 text-green-500" />
          Currency
        </h2>
        <select
          value={settings.currency}
          onChange={(e) => updateSettings({ ...settings, currency: e.target.value })}
          className="w-full max-w-xs px-4 py-2 rounded-lg border transition-colors"
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} ({currency.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Purchase History */}
      <div className="bg-white p-6 rounded-lg shadow-lg transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
            <History className="w-5 h-5 text-purple-500" />
            Purchase History
          </h2>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border-color">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-3 text-left border-b">Customer</th>
                <th className="p-3 text-left border-b">Item</th>
                <th className="p-3 text-left border-b">Amount</th>
                <th className="p-3 text-left border-b">Date</th>
                <th className="p-3 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseHistory.map((purchase) => (
                <tr key={purchase._id} className="border-b transition-colors">
                  <td className="p-3">{purchase.buyerName}</td>
                  <td className="p-3">{purchase.itemName}</td>
                  <td className="p-3">{`${settings.currency} ${purchase.totalAmount}`}</td>
                  <td className="p-3">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedPurchase(purchase)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View Bill
                      </button>
                      <button
                        onClick={() => generateBill(purchase)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <FileText size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Details Modal */}
      {selectedPurchase && (
        <PurchaseDetailsModal 
          purchase={selectedPurchase} 
          onClose={() => setSelectedPurchase(null)} 
        />
      )}
    </div>
  );
};

export default SettingsPage;
