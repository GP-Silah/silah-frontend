import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

function Login() {
  const { t, i18n } = useTranslation('login');
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // email or CRN
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    document.title = t('pageTitle.login', { ns: 'common' });
  }, [t, i18n.language]);

  const handleLogin = async () => {
    setError('');
    if (!identifier || !password) {
      setError(t('errors.emptyFields'));
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isCRN = /^\d{10}$/.test(identifier);

    if (!isEmail && !isCRN) {
      setError(t('errors.invalidEmailOrCRN'));
      return;
    }

    const payload = {
      password,
      ...(isEmail ? { email: identifier } : { crn: identifier }),
    };

    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        payload,
        { withCredentials: true }, // important to receive cookie
      );

      // If successful, backend sets the cookie automatically
      await refreshUser(); // force fetch /me
      navigate('/'); // redirect to homepage
    } catch (err) {
      console.log('Login error:', err); // <--- add this
      const msg = err.response?.data?.message;
      if (msg === 'User not found') {
        setError(t('errors.userNotFound'));
      } else if (msg === 'Invalid credentials') {
        setError(t('errors.invalidCredentials'));
      } else {
        setError(t('errors.network'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>{t('title')}</h2>

        <input
          type="text"
          placeholder={t('emailOrCRN')}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-message">{error}</p>}

        <button className="enter-btn" onClick={handleLogin} disabled={loading}>
          {loading ? t('loading') : t('submit')}
        </button>

        <div className="login-options">
          <span
            className="text-link reset-link"
            onClick={() => navigate('/reset-password')}
          >
            {t('resetPassword')}
          </span>

          <p className="create-account">
            {t('noAccount')}{' '}
            <span className="text-link" onClick={() => navigate('/signup')}>
              {t('createOne')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
