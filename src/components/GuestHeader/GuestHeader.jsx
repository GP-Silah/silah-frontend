import React, { useEffect, useState } from 'react';
import './GuestHeader.css';
import { FaGlobe, FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CategoryMegamenu from '../CategoryMegamenu/CategoryMegamenu';

const GuestHeader = () => {
  const { t, i18n } = useTranslation('header');
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
        params: { lang: i18n.language },
        withCredentials: true,
      })
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to load categories', err));
  }, [i18n.language]);

  return (
    <header className={`header ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="header-left">
        <img
          src="/logo.png"
          alt="Logo"
          className="logo"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />

        <CategoryMegamenu categories={categories} lang={i18n.language} />
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
