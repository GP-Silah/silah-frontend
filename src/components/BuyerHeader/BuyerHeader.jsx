import React, { useEffect, useState, useRef } from 'react';
import {
  FaSearch,
  FaBell,
  FaEnvelope,
  FaGavel,
  FaShoppingCart,
  FaFileInvoice,
  FaHeart,
  FaCog,
  FaExchangeAlt,
  FaSignOutAlt,
  FaUser,
  FaGlobe,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CategoryMegamenu from '../CategoryMegamenu/CategoryMegamenu';
import { useNotifications } from '../../hooks/useNotifications';
import './BuyerHeader.global.css';

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

const BuyerHeader = ({
  unreadCount,
  notifications,
  profilePics,
  markSingleAsRead,
  markAllAsRead,
}) => {
  const { t, i18n } = useTranslation('header');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser, handleLogout, switchRole } = useAuth();
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);
  const selectRef = useRef(null);

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const isPaymentCallbackPage = location.pathname.includes('/callback');
  if (isPaymentCallbackPage) return null;

  // === Toggle Language ===
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  // === Fetch Categories ===
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
        params: { lang: i18n.language },
        withCredentials: true,
      })
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to load categories', err));
  }, [i18n.language]);

  // === Close dropdowns on outside click ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // === Mark All as Read ===
  const handleMarkAllAsRead = () => {
    markAllAsRead(); // ← هذا الآن يعمل ويحدّث العداد
  };

  // === Handle Role Switch ===
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

  // === Handle Logout ===
  const handleLogoutClick = async () => {
    await handleLogout();
    navigate('/');
  };

  // === Handle Notification Click ===
  const handleNotificationClick = (n) => {
    if (!n.isRead) markSingleAsRead(n.notificationId);
    switch (n.relatedEntityType) {
      case 'CHAT':
        navigate(`/buyer/chats`);
        break;
      case 'INVOICE':
        navigate(`/buyer/invoices/${n.relatedEntityId}`);
        break;
      case 'OFFER':
        // navigate(`/buyer/offers/${n.relatedEntityId}`); // he can't view them until deadline
        break;
      case 'ORDER':
        navigate(`/buyer/orders/${n.relatedEntityId}`);
        break;
      case 'GROUP_PURCHASE':
        navigate(`/buyer/invoices`);
        break;
      default:
        break;
    }
    setDropdownOpen(false);
  };

  // === SEARCH FUNCTION ===
  const handleSearch = () => {
    const text = searchInputRef.current?.value.trim();
    if (!text) return;

    const selectValue = selectRef.current?.value;
    const lang = i18n.language;

    const typeKey =
      TYPE_MAP[lang][selectValue] ||
      TYPE_MAP.en[selectValue.toLowerCase()] ||
      'products';
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
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <header
      className={`buyer-header ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}
    >
      <div className="header-left">
        <img
          src="/logo.png"
          alt="Logo"
          className="logo"
          onClick={() => navigate('/buyer/homepage')}
          style={{ cursor: 'pointer' }}
        />
        <CategoryMegamenu categories={categories} lang={i18n.language} />
      </div>

      {/* === SEARCH BAR === */}
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

      {/* === RIGHT SECTION === */}
      <div className="header-right">
        {/* Cart */}
        <button
          className="icon-btn"
          onClick={() => navigate('/buyer/cart')}
          title={t('cart')}
        >
          <FaShoppingCart />
        </button>

        {/* Notifications */}
        <div className="notification-wrapper" ref={dropdownRef}>
          <button
            className="icon-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title={t('notifications')}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="notification-dropdown">
              <div className="notif-title">{t('notifications')}</div>

              {unreadNotifications.length === 0 ? (
                <div className="notif-item empty">
                  {t('noNewNotifications') || 'No new notifications'}
                </div>
              ) : (
                <ul className="notif-list">
                  {unreadNotifications.map((n) => {
                    const pfp = profilePics[n.sender.userId];
                    return (
                      <li
                        key={n.notificationId}
                        onClick={() => handleNotificationClick(n)}
                        className="notif-item unread"
                      >
                        {pfp ? (
                          <img src={pfp} alt="" className="notif-pfp" />
                        ) : (
                          <div className="notif-pfp-placeholder">
                            {n.sender.name[0].toUpperCase()}
                          </div>
                        )}
                        <div className="notification-content">
                          <strong>{n.title}</strong>
                          <p>{n.content}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* ← هذا الجزء يظهر دائمًا */}
              <div className="notification-footer">
                <button
                  className="view-all-btn"
                  onClick={() => {
                    navigate('/buyer/notifications');
                    setDropdownOpen(false);
                  }}
                >
                  {t('viewAll')}
                </button>
                {unreadNotifications.length > 0 && (
                  <button
                    className="mark-read-btn"
                    onClick={handleMarkAllAsRead}
                  >
                    {t('markAllRead')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-wrapper" ref={profileRef}>
          <button
            className="icon-btn"
            onClick={() => setProfileOpen((p) => !p)}
            title={t('profile')}
          >
            {user?.pfpUrl ? (
              <img
                src={user.pfpUrl}
                alt="Profile"
                className="profile-pic"
                referrerPolicy="no-referrer"
              />
            ) : (
              <FaUser />
            )}
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <h4 className="business-name">
                  {user?.businessName || t('profileChoices.noBusinessName')}
                </h4>
                <p className="managed-by">
                  {t('profileChoices.managedBy')}: <span>{user?.name}</span>
                </p>
              </div>
              <div className="divider" />
              <div className="profile-actions">
                <button
                  className="profile-item"
                  onClick={() => {
                    navigate('/buyer/chats');
                    setProfileOpen(false);
                  }}
                >
                  <FaEnvelope /> {t('profileChoices.directMessaging')}
                </button>
                <button
                  className="profile-item"
                  onClick={() => {
                    navigate('/buyer/bids');
                    setProfileOpen(false);
                  }}
                >
                  <FaGavel /> {t('profileChoices.biddings')}
                </button>
                <button
                  className="profile-item"
                  onClick={() => {
                    navigate('/buyer/orders');
                    setProfileOpen(false);
                  }}
                >
                  <FaShoppingCart /> {t('profileChoices.orders')}
                </button>
                <button
                  className="profile-item"
                  onClick={() => {
                    navigate('/buyer/invoices');
                    setProfileOpen(false);
                  }}
                >
                  <FaFileInvoice /> {t('profileChoices.invoices')}
                </button>
                <button
                  className="profile-item"
                  onClick={() => {
                    navigate('/buyer/wishlist');
                    setProfileOpen(false);
                  }}
                >
                  <FaHeart /> {t('profileChoices.wishlist')}
                </button>
                <button
                  className="profile-item"
                  onClick={() => {
                    navigate('/buyer/settings');
                    setProfileOpen(false);
                  }}
                >
                  <FaCog /> {t('profileChoices.settings')}
                </button>
              </div>
              <div className="divider" />
              <div className="profile-actions">
                <button
                  className="profile-item highlight"
                  onClick={handleSwitchRole}
                  disabled={switching}
                >
                  <FaExchangeAlt />
                  {switching
                    ? t('profileChoices.switching')
                    : t('profileChoices.changeRoleToSupplier')}
                </button>
                <button
                  className="profile-item logout"
                  onClick={handleLogoutClick}
                >
                  <FaSignOutAlt /> {t('profileChoices.logout')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language */}
        <button className="language-toggle" onClick={toggleLanguage}>
          <FaGlobe />
        </button>
      </div>
    </header>
  );
};

export default BuyerHeader;
