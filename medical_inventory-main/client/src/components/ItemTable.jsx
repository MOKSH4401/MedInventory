const ItemTable = ({ items, deleteItem, editItem }) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Inventory Items</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Item Name</th>
              <th className="p-2 text-left">Quantity</th>
              <th className="p-2 text-left">Expiry Date</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{item.expiryDate || "N/A"}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => editItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => deleteItem(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-2">
                  No items available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default ItemTable;
  