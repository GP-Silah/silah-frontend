import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { t, i18n } = useTranslation('auth');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.warn('Logout failed:', err.response?.data || err.message);
    }
    setUser(null);
    setRole('guest');
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
        { withCredentials: true },
      );
      setUser(res.data);
      setRole(res.data.role?.toLowerCase() || 'guest');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Show alert before logging out
        await Swal.fire({
          icon: 'warning',
          title: t('title'),
          text: t('text'),
          confirmButtonColor: '#476DAE',
          confirmButtonText: 'OK',
        });
        handleLogout();
      } else {
        setUser(null);
        setRole('guest');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, refreshUser, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
