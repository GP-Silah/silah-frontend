import React, { useState, useEffect } from 'react';
import './Reset.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function PasswordReset() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [error, setError] = useState('');
    const [banner, setBanner] = useState(null); // 'success' | 'expired' | null

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        if (status === 'expired') setBanner('expired');
        else if (status === 'success') setBanner('success');
    }, [location.search]);

    const handleSave = () => {
        setError('');
        if (!newPw || !confirmPw) {
            setError(t('reset.pwRequired'));
            return;
        }
        if (newPw.length < 6) {
            setError(t('reset.pwTooShort'));
            return;
        }
        if (newPw !== confirmPw) {
            setError(t('reset.pwMismatch'));
            return;
        }

        setBanner('success');

        setTimeout(() => navigate('/login'), 2000);
    };

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
                <h2>{t('reset.resetTitle')}</h2>

                {banner === 'success' && (
                    <div className="alert success">
                        {t('reset.bannerSuccess')}
                    </div>
                )}
                {banner === 'expired' && (
                    <div className="alert danger">
                        {t('reset.bannerExpired')}
                    </div>
                )}

                <label className="reset-label">{t('reset.newPw')}</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                />

                <label className="reset-label">{t('reset.confirmPw')}</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                />

                {error && <p className="error-message">{error}</p>}

                <button
                    className="primary-btn"
                    onClick={handleSave}
                >
                    {t('reset.save')}
                </button>
            </div>
        </div>
    );
}

export default PasswordReset;
