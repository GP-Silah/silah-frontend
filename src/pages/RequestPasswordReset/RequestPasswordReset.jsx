import React, { useEffect, useState } from 'react';
import '../PasswordReset/Reset.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const COUNTDOWN_SECONDS = 300;

function RequestPasswordReset() {
  const { t } = useTranslation('password');
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [banner, setBanner] = useState(null); // 'missing-token' | null

  useEffect(() => {
    document.title = t('req.pageTitle');

    const status = new URLSearchParams(location.search).get('status');
    if (status === 'missing-token') setBanner('missing-token');
  }, [location.search, t]);

  // Countdown timer
  useEffect(() => {
    if (!sent) return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [sent]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const handleSend = async () => {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError(t('req.emailRequired'));
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/request-password-reset`,
        { email },
      );
      setSent(true);
      setSecondsLeft(COUNTDOWN_SECONDS);
      setSuccess(response.data.message || t('req.successMessage'));
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('reset.genericError');
      setError(msg);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-container">
        <h2>{t('req.requestTitle')}</h2>

        {banner === 'missing-token' && (
          <div className="alert danger">{t('reset.missingTokenMessage')}</div>
        )}

        <p className="reset-desc">{t('req.requestDesc')}</p>

        <label className="reset-label">{t('req.emailLabel')}</label>
        <input
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="error-message">{error}</p>}
        {success && <p className="alert success">{success}</p>}

        <button
          className="primary-btn"
          onClick={handleSend}
          disabled={sent && secondsLeft > 0}
        >
          {t('req.sendLink')}
        </button>

        {sent && (
          <div className="timer">
            {mm}:{ss}
          </div>
        )}

        <p className="back-to-login">
          {t('req.remembered')}{' '}
          <span className="text-link" onClick={() => navigate('/login')}>
            {t('req.login')}
          </span>
        </p>
      </div>
    </div>
  );
}

export default RequestPasswordReset;
