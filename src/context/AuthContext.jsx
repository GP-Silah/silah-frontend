import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // check current user from backend
    axios;
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, {
        withCredentials: true,
      })
      .then((res) => {
        const userData = res.data;
        setUser(userData);
        setRole(userData.role.toLowerCase() || 'guest');
      })
      .catch(() => {
        setUser(null);
        setRole('guest');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
