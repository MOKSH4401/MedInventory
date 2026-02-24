import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useItems } from "../store/itemStore";


const ItemsPage = () => {
  const {items,fetchItems} = useItems();
  // console.log(items);

  const [item, setItem] = useState({ name: "", quantity: "", expiryDate: "",details:"",moreDetails:"",price:"",image:"" });
  const [editingItemId, setEditingItemId] = useState(null);

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     
    const formData = new FormData();
    formData.append("name", item.name);
    formData.append("quantity", item.quantity);
    formData.append("expiryDate", item.expiryDate);
    formData.append("details", item.details);
    formData.append("moreDetails", item.moreDetails);
    formData.append("price", item.price);
        
    if (item.image) {
      formData.append("image", item.image); // Append image file
    }
    try {
      const response = await fetch(
        editingItemId ? `http://localhost:5000/api/items/${editingItemId}` : "http://localhost:5000/api/items",
        {
          method: editingItemId ? "PUT" : "POST",
          // headers: { "Content-Type": "application/json" },
          // headers: { "Content-Type": "multipart/form-data" },
          // body: JSON.stringify(item),
          body: formData, // Send FormData instead of JSON
        }
      );
      if (response.ok) {
        fetchItems();
        toast.success(editingItemId ? `${item.name} updated successfully!` : `${item.name} added successfully!`);
        // alert(editingItemId ? "Item updated successfully!" : "Item added successfully!");
      }
    } catch (error) {
      console.error(editingItemId ? "Error updating item:" : "Error adding item:", error);
      toast.error(editingItemId ? "Error updating item:" : "Error adding item:", error);
    }
    setItem({ name: "", quantity: "", expiryDate: "",details:"",moreDetails:"",price:"",image:""});
    setEditingItemId(null);
  };

  const handleEdit = (item) => {
    setItem(item);
    setEditingItemId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top smoothly
  };

  const handleDelete = (id) => {
    const closeToast = () => toast.dismiss();
  
    toast(
      ({ closeToast }) => (
        <div className="p-4 rounded-lg shadow-lg bg-white">
          <p className="text-gray-800 font-semibold">Are you sure you want to delete this item?</p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
              onClick={() => {
                confirmDelete(id);
                closeToast();
              }}
            >
              Yes, Delete
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-500 transition"
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    );
  };
  
  const confirmDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchItems();
        toast.success("Item deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting item!");
    }
  };

  
  return (
    <div className="p-6">
      <div className="text-3xl font-bold mb-4 text-black dark:text-white">Manage Items</div>

     {/* Form Section - Half Width */}
<div className="w-1/2 mx-auto bg-white p-6 rounded-lg shadow-lg">
  <h2 className="text-xl font-semibold mb-6 text-gray-800">
    {editingItemId ? "Edit Item" : "Add Item"}
  </h2>
  <form onSubmit={handleSubmit} className="space-y-4">
    
    {/* Item Name */}
    <div className="flex items-center gap-4">
      <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-white">Item Name</div>
      <input
        type="text"
        name="name"
        value={item.name}
        onChange={handleChange}
        className="w-2/3 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none outline-1"
        required
      />
    </div>

    {/* Quantity */}
    <div className="flex items-center gap-4">
      <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-white">Quantity</div>
      <input
        type="number"
        name="quantity"
        value={item.quantity}
        onChange={handleChange}
        className="w-2/3 p-3 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:outline-none outline-1"
        required
      />
    </div>

    {/* Expiry Date */}
    <div className="flex items-center gap-4">
      <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-white">Expiry Date</div>
      <input
        type="date"
        name="expiryDate"
        value={item.expiryDate}
        onChange={handleChange}
        className="w-2/3 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none outline-1 "
        required={!editingItemId}
      />
    </div>

    {/* Price */}
    <div className="flex items-center gap-4">
      <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-white">Price</div>
      <input
        type="number"
        name="price"
        value={item.price}
        onChange={handleChange}
        className="w-2/3 p-3 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:outline-none outline-1"
      />
    </div>

    {/* Item Details */}
    <div className="flex items-start gap-4">
      <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-white">Item Details</div>
      <textarea
        name="details"
        value={item.details}
        onChange={handleChange}
        className="w-2/3 p-3 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:outline-none outline-1"
      />
    </div>

    {/* More Information */}
    <div className="flex items-start gap-4">
      <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-white">More Information</div>
      <textarea
        name="moreDetails"
        value={item.moreDetails}
        onChange={handleChange}
        className="w-2/3 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none outline-1"
      />
    </div>

    {/* Upload Image */}
    <div className="flex items-center gap-4">
      <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-white">Upload Image</div>
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={(e) => setItem({ ...item, image: e.target.files[0] })}
        className="w-2/3 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none outline-1 "
      />
    </div>

    {/* Submit Button */}
    <div className="flex justify-end">
      <button
        type="submit"
        className="bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 transition-all shadow-md"
      >
        {editingItemId ? "Update Item" : "Add Item"}
      </button>
    </div>
  </form>
</div>


      {/* List Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Item List</h2>
        <ul className="divide-y divide-gray-300">
          {items.map((item) => (
            <li key={item._id} className="flex justify-between p-4 rounded">
              <div>
                <p className="text-lg font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-sm text-gray-600">Expiry: {new Date(item.expiryDate).toDateString()}</p>
              </div>
              <div className="space-x-3">
                <button onClick={() => handleEdit(item)} className="text-blue-600 dark:text-blue-400 hover:cursor-pointer">
                  Edit
                </button>
                <button
                  
                  onClick={() => handleDelete(item._id)}
                  className="text-red-600 dark:text-red-400 hover:cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ItemsPage;
