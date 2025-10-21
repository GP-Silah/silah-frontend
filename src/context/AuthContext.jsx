import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(true);

  const hasToken = () => document.cookie.includes('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (!hasToken()) {
        setUser(null);
        setRole('guest');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
          {
            withCredentials: true,
          },
        );
        setUser(res.data);
        setRole(res.data.role?.toLowerCase() || 'guest');
      } catch {
        setUser(null);
        setRole('guest');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const refreshUser = async () => {
    if (!hasToken()) {
      setUser(null);
      setRole('guest');
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
        {
          withCredentials: true,
        },
      );
      setUser(res.data);
      setRole(res.data.role?.toLowerCase());
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
