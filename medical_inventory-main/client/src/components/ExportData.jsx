import { FileText } from "lucide-react";
import { useItems } from "../store/itemStore";
import { saveAs } from "file-saver";

const ExportData = () => {
  const { items } = useItems();

  const exportCSV = () => {
    const headers = "Name,Quantity,Expiry Date\n";
    const rows = items.map((item) => `${item.name},${item.quantity},${new Date(item.expiryDate).toLocaleDateString()}`).join("\n");
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    saveAs(blob, "inventory.csv");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-500" />
        Export Data
      </h2>
      <button onClick={exportCSV} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
        Download CSV
      </button>
    </div>
  );
};

export default ExportData;
