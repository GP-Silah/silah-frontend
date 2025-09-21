import React, { useEffect, useState } from 'react';
import './Reset.css';
import { useNavigate } from 'react-router-dom';
import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const COUNTDOWN_SECONDS = 300;

function RequestPasswordReset() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
    const [error, setError] = useState('');

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
    };

    const handleSend = () => {
        setError('');
        if (!email.trim()) {
            setError(t('reset.emailRequired'));
            return;
        }

        setSent(true);
        setSecondsLeft(COUNTDOWN_SECONDS);
    };

    useEffect(() => {
        if (!sent) return;
        const timer = setInterval(() => {
            setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [sent]);

    const mm = String(Math.floor(secondsLeft / 60)).padStart(1, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');

    return (
        <div className="reset-page">
            <div className="reset-header">
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

            <div className="reset-container">
                <h2>{t('reset.requestTitle')}</h2>

                <p className="reset-desc">{t('reset.requestDesc')}</p>

                <label className="reset-label">{t('reset.emailLabel')}</label>
                <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {error && <p className="error-message">{error}</p>}

                <button
                    className="primary-btn"
                    onClick={handleSend}
                    disabled={sent && secondsLeft > 0}
                >
                    {t('reset.sendLink')}
                </button>

                {sent && (
                    <div className="timer">
                        {mm}:{ss}
                    </div>
                )}

                <p className="back-to-login">
                    {t('reset.remembered')}{' '}
                    <span
                        className="text-link"
                        onClick={() => navigate('/login')}
                    >
                        {t('reset.login')}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default RequestPasswordReset;
