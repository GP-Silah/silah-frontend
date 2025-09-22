import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Login() {
  useEffect(() => {
    document.title = 'Login';
  }, []);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (
      storedUser &&
      storedUser.email === email &&
      storedUser.password === password
    ) {
      alert(t('login.success'));
      navigate('/');
    } else {
      setError(t('login.error'));
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>{t('login.title')}</h2>

        <input
          type="email"
          placeholder={t('login.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder={t('login.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-message">{error}</p>}

        <button className="enter-btn" onClick={handleLogin}>
          {t('login.submit')}
        </button>

        <div className="login-options">
          <span
            className="text-link reset-link"
            onClick={() => navigate('/reset-password')}
          >
            {t('login.resetPassword')}
          </span>

          <p className="create-account">
            {t('login.noAccount')}{' '}
            <span className="text-link" onClick={() => navigate('/signup')}>
              {t('login.createOne')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
