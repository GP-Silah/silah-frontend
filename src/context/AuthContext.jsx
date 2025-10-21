import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(true);

  // Fetch current user from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
          { withCredentials: true },
        );
        console.log('Fetched user successfully:', res.data);
        setUser(res.data);
        setRole(res.data.role?.toLowerCase() || 'guest');
      } catch (err) {
        console.warn(
          'Failed to fetch user:',
          err.response?.data || err.message,
        );
        setUser(null);
        setRole('guest');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Allow manual refresh (after login/signup)
  const refreshUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
        { withCredentials: true },
      );
      setUser(res.data);
      setRole(res.data.role?.toLowerCase() || 'guest');
    } catch {
      setUser(null);
      setRole('guest');
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
