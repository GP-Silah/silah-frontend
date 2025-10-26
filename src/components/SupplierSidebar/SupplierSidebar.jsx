import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FaSignOutAlt,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './SupplierSidebar.css';

const SupplierSidebar = () => {
  const { t, i18n } = useTranslation('sidebar');
  const { user, refreshUser, handleLogout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate('/');
  };

  const handleSwitchRole = async () => {
    if (switching) return;
    setSwitching(true);
    try {
      const newRole = await switchRole();
      if (newRole === 'supplier')
        navigate('/supplier/overview', { replace: true });
      else if (newRole === 'buyer')
        navigate('/buyer/homepage', { replace: true });
      else navigate('/', { replace: true });
    } finally {
      setSwitching(false);
    }
  };

  const logoSrc =
    i18n.language === 'ar' ? '/sidebar-logo-ar.png' : '/sidebar-logo.png';

  return (
    <aside
      className={`sidebar-container ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logoSrc} alt="Silah Logo" />
      </div>

      <hr className="divider" />

      {/* Top navigation */}
      <ul className="sidebar-links top-links">
        <li>
          <Link to="/supplier/overview">
            <FaHome /> {t('overview')}
          </Link>
        </li>
        <li>
          <Link to="/supplier/listings">
            <FaCube /> {t('listings')}
          </Link>
        </li>
        <li>
          <Link to="/supplier/bids">
            <FaGavel /> {t('biddings')}
          </Link>
        </li>
        <li>
          <Link to="/supplier/orders">
            <FaShoppingCart /> {t('orders')}
          </Link>
        </li>
        <li>
          <Link to="/supplier/invoices">
            <FaFileInvoice /> {t('invoices')}
          </Link>
        </li>
        <li>
          <Link to="/supplier/analytics">
            <FaChartLine /> {t('analytics')}
          </Link>
        </li>
        <li>
          <Link to="/supplier/messages" className="sidebar-action">
            <FaEnvelope /> {t('messages')}
          </Link>
        </li>
        <li>
          <Link to="/supplier/notifications" className="sidebar-action">
            <FaBell /> {t('notifications')}
          </Link>
        </li>
        <li>
          <Link to="/supplier/settings">
            <FaCog /> {t('settings')}
          </Link>
        </li>
      </ul>

      {/* Push bottom section to bottom */}
      <div className="sidebar-bottom">
        {/* Switch role, logout, and language at the bottom */}
        <div className="sidebar-actions">
          <button
            className="sidebar-action switch-role"
            onClick={handleSwitchRole}
            disabled={switching}
          >
            <FaExchangeAlt />
            {switching ? t('switching') : t('changeRoleToBuyer')}
          </button>

          <button className="sidebar-action logout" onClick={handleLogoutClick}>
            <FaSignOutAlt /> {t('logout')}
          </button>

          <div className="language-switch" onClick={toggleLanguage}>
            <FaGlobe />{' '}
            <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
          </div>
        </div>

        <hr className="divider" />

        {/* Profile */}
        <div className="profile">
          {user?.pfpUrl ? (
            <img
              src={user.pfpUrl}
              alt="Profile"
              className="profile-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <FaUserCircle className="profile-icon" />
          )}
          <div>
            <p className="company">{user?.businessName}</p>
            <span className="role">{user?.name}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SupplierSidebar;
