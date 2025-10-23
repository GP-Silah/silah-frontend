import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { t } = useTranslation('auth');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.warn('Logout failed:', err.response?.data || err.message);
    } finally {
      setUser(null);
      setRole('guest');
    }
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
        await Swal.fire({
          icon: 'warning',
          title: t('title'),
          text: t('text'),
          confirmButtonColor: '#476DAE',
          confirmButtonText: 'OK',
        });
        setUser(null);
        setRole('guest');
      } else {
        console.error('Fetch user failed:', err);
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

  const switchRole = async () => {
    if (switching) return role;
    setSwitching(true);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/switch-role`,
        {},
        { withCredentials: true },
      );
      await fetchUser();
      return res.data?.newRole?.toLowerCase() || role;
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message;
      Swal.fire({
        icon: 'error',
        title: t('switchRoleErrorTitle') || 'Switch role failed',
        text: msg,
        confirmButtonColor: '#476DAE',
      });
      return role;
    } finally {
      setSwitching(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        switching,
        handleLogout,
        fetchUser,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
