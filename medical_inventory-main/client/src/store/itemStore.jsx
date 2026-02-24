import { format } from "date-fns";
import { createContext, useContext, useState, useEffect } from "react";
import { addLog } from "../api/logsApi";


const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]); // State to store items


  // formating date
  const formatDate = (isoString) => {
   
    format(new Date(isoString), "dd-MM-yyyy");
  }

  // get items data
 
  const fetchItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      
      console.error("Error fetching items:", error);
    }
  };


  useEffect(() => {
    fetchItems();
  }, []);

   const updateItem = async (itemId, newData) => {
    await db.collection("items").doc(itemId).update(newData);
    await addLog({ action: "UPDATE", itemId, timestamp: new Date().toISOString() });
  };
  
   const deleteItem = async (itemId) => {
    await db.collection("items").doc(itemId).delete();
    await addLog({ action: "DELETE", itemId, timestamp: new Date().toISOString() });
  };

  return (
    <ItemContext.Provider value={{ items,fetchItems,formatDate,updateItem,deleteItem }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItems = () => {
  return useContext(ItemContext);
};
