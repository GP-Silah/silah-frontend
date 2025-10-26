import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { useAuth } from './context/AuthContext';

export default function ProtectedRoute({ allowedRoles, redirectTo = '/' }) {
  const { role, user, loading, switching } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [checked, setChecked] = useState(false); // role and email verification checked
  const [alertShown, setAlertShown] = useState(false);

  // Reset alert and checked when route changes
  useEffect(() => {
    setAlertShown(false);
    setChecked(false);
  }, [location.pathname]);

  useEffect(() => {
    // Wait until loading and switching finish
    if (loading || switching) return;

    if (!checked) {
      setChecked(true); // mark that we verified role and email for this route

      // Check role first
      if (!allowedRoles.includes(role)) {
        if (!alertShown) {
          setAlertShown(true);
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
        return;
      }

      // Check email verification for authenticated users
      if (role !== 'guest' && user && !user.isEmailVerified && !alertShown) {
        setAlertShown(true);
        Swal.fire({
          icon: 'warning',
          title: t('emailNotVerifiedTitle') || 'Email Verification Required',
          text:
            t('emailNotVerifiedText') ||
            'Please verify your email to access most features of this platform.',
          confirmButtonColor: '#476DAE',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        }).then(() => {
          navigate('/verify-email', {
            replace: true,
            state: { email: user.email },
          });
        });
      }
    }
  }, [
    role,
    user,
    allowedRoles,
    loading,
    switching,
    alertShown,
    navigate,
    redirectTo,
    t,
    checked,
  ]);

  if (loading || switching) {
    return (
      <div className="loader-center">
        <ClipLoader color="#543361" size={60} />
      </div>
    );
  }

  // Only render children if role is allowed and email is verified (or not applicable)
  return allowedRoles.includes(role) &&
    (role === 'guest' || user?.isEmailVerified) ? (
    <Outlet />
  ) : null;
}
