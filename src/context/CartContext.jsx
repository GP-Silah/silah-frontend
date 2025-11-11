// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_BACKEND_URL;

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/carts/me`, {
        withCredentials: true,
      });
      setCart(res.data);
      setTotalItemsCount(res.data.totalItemsCount || 0);
    } catch (err) {
      if (err.response?.status === 404) {
        setCart(null);
        setTotalItemsCount(0);
      } else {
        console.error('Cart fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Public method to refetch
  const refreshCart = () => fetchCart();

  return (
    <CartContext.Provider
      value={{ cart, totalItemsCount, loading, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
