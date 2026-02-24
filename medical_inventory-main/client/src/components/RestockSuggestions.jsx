import { Lightbulb } from "lucide-react";
import { useItems } from "../store/itemStore";

const RestockSuggestions = () => {
  const { items } = useItems();
  const lowStockItems = items.filter((item) => item.quantity < 10);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-green-500" />
        Restock Suggestions
      </h2>
      {lowStockItems.length === 0 ? (
        <p className="text-gray-600">No restocking needed.</p>
      ) : (
        <ul className="space-y-2">
          {lowStockItems.map((item) => (
            <li key={item.name} className="text-green-700">✔ Consider restocking {item.name}.</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RestockSuggestions;
