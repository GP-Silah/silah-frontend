import React from 'react';
import './GuestHeader.css';
import { FaGlobe, FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const GuestHeader = () => {
  const { t, i18n } = useTranslation('header');
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="header">
      <div className="header-left">
        <img
          src="/logo.png"
          alt="Logo"
          className="logo"
          onClick={() => navigate('/')} // ✅ ينقلك للـ Landing page
          style={{ cursor: 'pointer' }} // يخلي شكل الماوس "يد"
        />

        <select className="category-select">
          <option hidden>{t('category')}</option>
          <option>{t('filters.agriculture')}</option>
          <option>{t('filters.beauty')}</option>
          <option>{t('filters.fashion')}</option>
          <option>{t('filters.food')}</option>
          <option>{t('filters.home')}</option>
          <option>{t('filters.hardware')}</option>
          <option>{t('filters.packaging')}</option>
          <option>{t('filters.energy')}</option>
          <option>{t('filters.business')}</option>
          <option>{t('filters.it')}</option>
          <option>{t('filters.shipping')}</option>
          <option>{t('filters.design')}</option>
          <option>{t('filters.manufacturing')}</option>
          <option>{t('filters.technical')}</option>
          <option>{t('filters.legal')}</option>
        </select>
      </div>

      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input type="text" placeholder={t('searchPlaceholder')} />
        <select className="product-select">
          <option>{t('tabs.products')}</option>
          <option>{t('tabs.services')}</option>
          <option>{t('tabs.suppliers')}</option>
        </select>
      </div>

      <div className="header-right">
        <button className="language-toggle" onClick={toggleLanguage}>
          <FaGlobe />
        </button>

        <button className="login-btn" onClick={() => navigate('/login')}>
          {t('login')}
        </button>

        <button className="signup-btn" onClick={() => navigate('/signup')}>
          {t('signup')}
        </button>
      </div>
    </header>
  );
};

export default GuestHeader;
