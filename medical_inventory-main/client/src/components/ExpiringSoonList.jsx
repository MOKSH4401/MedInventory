import { useItems } from "../store/itemStore"; 
import { format } from "date-fns";

const ExpiringSoonList = ({ setView }) => {
  const { items } = useItems();
  const today = new Date();
  const expiringSoonItems = items.filter((item) => new Date(item.expiryDate) < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));

  return (
    <div className="p-6">
      <button onClick={() => setView("dashboard")} className="mb-4 px-4 py-2 cursor-pointer  dark:text-gray">⬅ Back to Dashboard</button>
      <h2 className="text-2xl font-bold mb-4">Expiring Soon Items</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Name</th>
            <th className="border border-gray-300 p-2 text-left">Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {expiringSoonItems.length > 0 ? (
            expiringSoonItems.map((item) => (
              <tr key={item._id}>
                <td className="border border-gray-300 p-2">{item.name}</td>
                <td className="border border-gray-300 p-2">{format(new Date(item.expiryDate), "dd-MM-yyyy")}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center text-gray-500 p-2">No expiring items</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpiringSoonList;
