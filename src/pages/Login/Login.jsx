import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Login() {
  const { t, i18n } = useTranslation('login');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = t('pageTitle.login', {ns: 'common'});
  }, [t, i18n.language]);

  const handleLogin = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (
      storedUser &&
      storedUser.email === email &&
      storedUser.password === password
    ) {
      alert(t('success'));
      navigate('/');
    } else {
      setError(t('error'));
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>{t('title')}</h2>

        <input
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-message">{error}</p>}

        <button className="enter-btn" onClick={handleLogin}>
          {t('submit')}
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
