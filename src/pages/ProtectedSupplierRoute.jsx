import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function SupplierProtectedRoute({ redirectTo = '/' }) {
  const { t } = useTranslation('auth');
  const { role, loading, switching, supplierStatus, isPathAllowedForInactive } =
    useAuth();
  const location = useLocation();
  const hasShownToast = useRef(false);

  // Reset toast flag when pathname changes
  useEffect(() => {
    hasShownToast.current = false;
  }, [location.pathname]);

  // 1. Loading
  if (loading || switching) {
    return (
      <div className="loader-center">
        <ClipLoader color="#543361" size={60} />
      </div>
    );
  }

  // 2. Not supplier
  if (role !== 'supplier') {
    return <Navigate to={redirectTo} replace />;
  }

  // 3. Inactive supplier
  if (supplierStatus === 'INACTIVE') {
    const allowed = isPathAllowedForInactive(location.pathname);

    if (!allowed && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error(t('inactiveSupplierRestricted'), {
        position: 'top-center',
        duration: 5000,
      });
    }

    if (!allowed) {
      return <Navigate to="/supplier/overview" replace />;
    }
  }

  // 4. All good
  return <Outlet />;
}
