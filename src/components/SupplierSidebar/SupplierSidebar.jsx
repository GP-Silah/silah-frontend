import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome,
  FaCube,
  FaGavel,
  FaShoppingCart,
  FaFileInvoice,
  FaChartLine,
  FaCog,
  FaExchangeAlt,
  FaEnvelope,
  FaBell,
  FaGlobe,
  FaUserCircle,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import './SupplierSidebar.css';

const SupplierSidebar = () => {
  const { t, i18n } = useTranslation('sidebar');

  // بيانات المستخدم من LocalStorage (مؤقت)
  const user = JSON.parse(localStorage.getItem('user')) || {
    companyName: 'Company XYZ',
    role: t('profile.defaultRole'),
  };

  //  دالة لتبديل اللغة
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang); // نحفظها عشان تبقى حتى بعد التحديث
  };

  return (
    <aside
      className={`sidebar-container sidebar ${
        i18n.language === 'ar' ? 'rtl' : 'ltr'
      }`}
    >
      {/*  اللوغو  */}
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Silah Logo" />
        <div className="logo-text">
          <span>Connecting</span>
          <span>Businesses</span>
        </div>
      </div>

      {/*  الروابط  */}
      <ul className="sidebar-links">
        <li>
          <Link to="/overview">
            <FaHome /> {t('overview')}
          </Link>
        </li>
        <li>
          <Link to="/supplier-product-details">
            <FaCube /> {t('products')}
          </Link>
        </li>
        <li>
          <Link to="/bids">
            <FaGavel /> {t('biddings')}
          </Link>
        </li>
        <li>
          <Link to="/orders">
            <FaShoppingCart /> {t('orders')}
          </Link>
        </li>
        <li>
          <Link to="/invoices">
            <FaFileInvoice /> {t('invoices')}
          </Link>
        </li>
        <li>
          <Link to="/analytics">
            <FaChartLine /> {t('analytics')}
          </Link>
        </li>
        <li>
          <Link to="/settings-page/settings">
            <FaCog /> {t('settings')}
          </Link>
        </li>
        <li claasName="change-role">
          <Link to="/role">
            <FaExchangeAlt />
            <span>{t('changeRole')}</span>
            <span className="buyer">{t('buyer')}</span>
          </Link>
        </li>
        <li>
          <Link to="/messages">
            <FaEnvelope /> {t('messages')}
          </Link>
        </li>
        <li>
          <Link to="/notifications">
            <FaBell /> {t('notifications')}
          </Link>
        </li>
      </ul>

      {/*  البروفايل + اللغة */}
      <div className="profile">
        <FaUserCircle className="profile-icon" />
        <div>
          <p className="company">{user.companyName}</p>
          <span className="role">{user.role}</span>
        </div>
      </div>

      {/*  زر اللغة  */}
      <div className="language-switch" onClick={toggleLanguage}>
        <FaGlobe />
        <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
      </div>
    </aside>
  );
};

export default SupplierSidebar;
