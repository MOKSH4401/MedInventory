import { create } from "zustand";
import axios from "axios";

const useCart = create((set) => ({
  cart: { items: [], totalAmount: 0 },
  
  fetchCart: async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/cart");
      set({ cart: response.data });
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  addToCart: async (itemId, quantity) => {
    try {
      console.log("Attempting to add to cart:", { itemId, quantity });
      
      if (!itemId || !quantity) {
        throw new Error("Invalid itemId or quantity");
      }

      const response = await axios.post("http://localhost:5000/api/cart/add", {
        itemId,
        quantity: parseInt(quantity)
      });
      
      const cartData = response.data?.cart ?? response.data;
      set({ cart: cartData });
      return cartData;
      
    } catch (error) {
      console.error("Cart error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`);
      const cartData = response.data?.cart ?? response.data;
      set({ cart: cartData });
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  checkout: async (buyerInfo) => {
    try {
      await axios.post("http://localhost:5000/api/cart/checkout", buyerInfo);
      set({ cart: { items: [], totalAmount: 0 } });
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  }
}));

export default useCart;