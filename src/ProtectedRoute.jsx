import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { useAuth } from './context/AuthContext';

export default function ProtectedRoute({ allowedRoles, redirectTo = '/' }) {
  const { role, user, loading, switching, handleLogout } = useAuth();
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
          html: `
    <p>
      ${
        t('emailNotVerifiedText') ||
        'Please verify your email to access most features of this platform.'
      }
    </p>

    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
      <button id="resend-btn" class="swal2-confirm swal2-styled" style="background-color:#476DAE;">
        ${t('resendVerification') || 'Resend Verification Email'}
      </button>

      <button id="logout-btn" class="swal2-cancel swal2-styled" style="background-color:#d33;">
        ${t('logout') || 'Log Out'}
      </button>
    </div>
  `,
          showConfirmButton: false,
          allowOutsideClick: false,
          didRender: () => {
            const resendBtn = document.getElementById('resend-btn');
            const logoutBtn = document.getElementById('logout-btn');

            resendBtn.onclick = () => {
              navigate('/verify-email', {
                replace: true,
                state: { email: user.email },
              });
              Swal.close();
            };

            logoutBtn.onclick = async () => {
              await handleLogout();
              navigate('/login', { replace: true });
              Swal.close();
            };
          },
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
