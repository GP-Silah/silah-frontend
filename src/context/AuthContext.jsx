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
  const [supplierStatus, setSupplierStatus] = useState(null);

  const INACTIVE_NOTICE_KEY = 'inactiveSupplierNoticeClosed';

  const showInactiveSupplierNotice = () => {
    const isClosed = sessionStorage.getItem(INACTIVE_NOTICE_KEY) === '1';
    if (isClosed) return;

    const isArabic = i18n.language === 'ar';

    Swal.fire({
      icon: 'warning',
      title: isArabic
        ? 'لقد تجاوزت حدود الخطة الأساسية'
        : 'You exceeded basic plan limits',
      text: isArabic
        ? 'سيتم إخفاء واجهة متجرك ومنتجاتك مؤقتًا من المشترين حتى يتم الدفع.'
        : 'Your storefront and products shall be temporarily hidden from buyers until payment is made.',
      confirmButtonText: isArabic ? 'فهمت' : 'Got it',
      confirmButtonColor: '#8a52a7',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'swal-rtl',
      },
    }).then(() => {
      sessionStorage.setItem(INACTIVE_NOTICE_KEY, '1');
    });
  };

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
      setSupplierStatus(null);
      sessionStorage.removeItem(INACTIVE_NOTICE_KEY);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
        { withCredentials: true },
      );
      const userData = res.data;
      setUser(userData);
      const userRole = userData.role?.toLowerCase() || 'guest';
      setRole(userRole);

      // === إذا كان supplier → جلب بيانات المورد ===
      if (userRole === 'supplier') {
        try {
          const supplierRes = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/suppliers/me`,
            { withCredentials: true },
          );
          const status = supplierRes.data.supplierStatus;
          setSupplierStatus(status);

          // === إظهار التنبيه إذا INACTIVE ولم يُغلق ===
          if (status === 'INACTIVE') {
            showInactiveSupplierNotice();
          }
        } catch (supplierErr) {
          console.error('Failed to fetch supplier data:', supplierErr);
          setSupplierStatus(null);
        }
      } else {
        setSupplierStatus(null);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        const message = err.response?.data?.error?.message;

        if (message === 'Invalid or expired token') {
          await Swal.fire({
            icon: 'warning',
            title: t('title'),
            text: t('text'),
            confirmButtonColor: '#476DAE',
            confirmButtonText: 'OK',
          });
        }

        setUser(null);
        setRole('guest');
        setSupplierStatus(null);
      } else {
        console.error('Fetch user failed:', err);
        setUser(null);
        setRole('guest');
        setSupplierStatus(null);
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
        supplierStatus,
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
