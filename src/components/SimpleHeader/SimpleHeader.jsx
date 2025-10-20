import React from 'react';
import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './SimpleHeader.css';

export default function SimpleHeader() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="simple-header">
      <img
        src="/logo.png"
        alt="Logo"
        className="simple-header__logo"
        onClick={() => navigate('/')}
      />
      <button
        className="simple-header__lang-btn"
        onClick={toggleLanguage}
        aria-label="Change language"
      >
        <FaGlobe />
      </button>
    </header>
  );
}
