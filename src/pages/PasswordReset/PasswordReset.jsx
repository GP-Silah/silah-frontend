import React, { useState, useEffect } from 'react';
import './Reset.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

function PasswordReset() {
  const { t } = useTranslation('password');
  const navigate = useNavigate();
  const location = useLocation();

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [banner, setBanner] = useState(null); // 'success' | 'expired' | null
  const [loading, setLoading] = useState(false);

  // Extract token from query string
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    document.title = t('reset.pageTitle');

    // Handle banners from query params
    const status = new URLSearchParams(location.search).get('status');
    if (status === 'expired') setBanner('expired');
    else if (status === 'success') setBanner('success');
  }, [location.search, t]);

  // 🚨 Redirect if token is missing
  useEffect(() => {
    if (!token) {
      navigate('/request-password-reset?status=missing-token', {
        replace: true,
      });
    }
  }, [token, navigate]);

  const validatePassword = (pw) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#!$]{8,28}$/;
    return regex.test(pw);
  };

  const handleSave = async () => {
    setError('');
    setBanner(null);

    if (!newPw || !confirmPw) {
      setError(t('reset.pwRequired'));
      return;
    }

    if (!validatePassword(newPw)) {
      setError(t('errors.weakPassword'));
      return;
    }

    if (newPw !== confirmPw) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/auth/reset-password?token=${token}`,
        { newPassword: newPw },
      );

      setBanner('success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('reset.genericError');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-container">
        <h2>{t('reset.resetTitle')}</h2>

        {banner === 'success' && (
          <div className="alert success">{t('reset.bannerSuccess')}</div>
        )}
        {banner === 'expired' && (
          <div className="alert danger">{t('reset.bannerExpired')}</div>
        )}

        <label className="reset-label">{t('reset.newPw')}</label>
        <input
          type="password"
          placeholder="••••••••"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          disabled={loading}
        />

        <label className="reset-label">{t('reset.confirmPw')}</label>
        <input
          type="password"
          placeholder="••••••••"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          disabled={loading}
        />

        {error && <p className="error-message">{error}</p>}

        <button className="primary-btn" onClick={handleSave} disabled={loading}>
          {loading ? t('reset.saving') : t('reset.save')}
        </button>
      </div>
    </div>
  );
}

export default PasswordReset;
