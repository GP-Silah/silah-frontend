import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

function Login() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
    };

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
            <div className="login-header">
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="logo"
                    onClick={() => navigate('/')}
                />
                <button
                    className="lang-btn"
                    onClick={toggleLanguage}
                >
                    <FaGlobe />
                </button>
            </div>

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

                <button
                    className="enter-btn"
                    onClick={handleLogin}
                >
                    {t('login.enter')}
                </button>

                {/* الروابط تحت الباسوورد */}
                <div className="login-options">
                    <span
                        className="text-link reset-link"
                        onClick={() => navigate('/reset-password')}
                    >
                        {t('login.resetPassword')}
                    </span>

                    <p className="create-account">
                        {t('login.noAccount')}{' '}
                        <span
                            className="text-link"
                            onClick={() => navigate('/signup')}
                        >
                            {t('login.createOne')}
                        </span>
                    </p>
                </div>
            </div>

            {/* استدعاء الفوتر ككمبوننت */}
            <Footer />
        </div>
    );
}

export default Login;
