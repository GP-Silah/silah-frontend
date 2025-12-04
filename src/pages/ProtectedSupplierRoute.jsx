import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export default function SupplierProtectedRoute({ redirectTo = '/' }) {
  const { t } = useTranslation('auth');
  const { role, loading, switching, supplierStatus, isPathAllowedForInactive } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hasShownToast = useRef(false);
  const hasShownSwal = useRef(false);

  // Reset toast flag when pathname changes
  useEffect(() => {
    hasShownToast.current = false;
    hasShownSwal.current = false;
  }, [location.pathname]);

  // 1. Loading
  if (loading || switching) {
    return (
      <div className="loader-center">
        <ClipLoader color="#543361" size={60} />
      </div>
    );
  }

  // 2. Not a supplier → show the SAME dialog buyers saw before
  if (role !== 'supplier') {
    // Prevent showing the dialog multiple times
    if (!hasShownSwal.current) {
      hasShownSwal.current = true;
      Swal.fire({
        icon: 'error',
        title: t('unauthorizedTitle'),
        text: t('unauthorizedText'),
        confirmButtonColor: '#476DAE',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
      }).then(() => {
        navigate(redirectTo, { replace: true });
      });
    }
    // While the dialog is open we return nothing (or a loader)
    return null;
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
