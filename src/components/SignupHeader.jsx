// components/SignupHeader.jsx
import React from 'react';
import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './SignupHeader.css'; // لو تبين ننسقه

function SignupHeader() {
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="signup-header">
            <img
                src="/logo.png"
                alt="Logo"
                className="signup-logo"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            />

            <button
                className="language-toggle"
                onClick={toggleLanguage}
            >
                <FaGlobe />
            </button>
        </div>
    );
}

export default SignupHeader;
