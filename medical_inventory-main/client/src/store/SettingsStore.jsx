import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: localStorage.getItem("theme") || "light",
    currency: "USD"
  });
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchPurchaseHistory();
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/settings");
      setSettings(data);
      localStorage.setItem("theme", data.theme);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/settings/purchase-history");
      setPurchaseHistory(data);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const { data } = await axios.put("http://localhost:5000/api/settings", newSettings);
      setSettings(data);
      localStorage.setItem("theme", data.theme);
      document.documentElement.setAttribute("data-theme", data.theme);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings,
      purchaseHistory
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
