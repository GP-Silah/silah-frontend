import React, { useEffect, useState, useRef } from 'react';
import './GuestHeader.css';
import { FaGlobe, FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CategoryMegamenu from '../CategoryMegamenu/CategoryMegamenu';

const TYPE_MAP = {
  en: {
    Products: 'products',
    Services: 'services',
    Suppliers: 'suppliers',
  },
  ar: {
    المنتجات: 'products',
    الخدمات: 'services',
    الموردين: 'suppliers',
  },
};

const GuestHeader = () => {
  const { t, i18n } = useTranslation('header');
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const searchInputRef = useRef(null);
  const selectRef = useRef(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
        params: { lang: i18n.language },
      })
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to load categories', err));
  }, [i18n.language]);

  const handleSearch = () => {
    const text = searchInputRef.current?.value.trim();
    if (!text) return;

    const selectValue = selectRef.current?.value;
    const lang = i18n.language;

    // Map display value → backend key
    const typeKey =
      TYPE_MAP[lang][selectValue] ||
      TYPE_MAP.en[selectValue.toLowerCase()] ||
      'products';

    // Arabic URL param
    const typeParam =
      lang === 'ar'
        ? typeKey === 'products'
          ? 'المنتجات'
          : typeKey === 'services'
          ? 'الخدمات'
          : 'الموردين'
        : selectValue;

    navigate(`/search?type=${typeParam}&text=${encodeURIComponent(text)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
        <FaSearch
          className="search-icon"
          onClick={handleSearch}
          style={{ cursor: 'pointer' }}
        />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          ref={searchInputRef}
          onKeyDown={handleKeyDown}
        />
        <select
          className="product-select"
          ref={selectRef}
          defaultValue={t('tabs.products')}
        >
          <option value={t('tabs.products')}>{t('tabs.products')}</option>
          <option value={t('tabs.services')}>{t('tabs.services')}</option>
          <option value={t('tabs.suppliers')}>{t('tabs.suppliers')}</option>
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
