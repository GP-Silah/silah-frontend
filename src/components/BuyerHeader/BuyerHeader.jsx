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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CategoryMegamenu from '../CategoryMegamenu/CategoryMegamenu';
import './BuyerHeader.css';

const BuyerHeader = () => {
  const { t, i18n } = useTranslation('header');
  const navigate = useNavigate();
  const { user, refreshUser, handleLogout, switchRole } = useAuth();

  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

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

  // === Fetch Notifications (and setup SSE) ===
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/me`, {
        params: { lang: i18n.language },
        withCredentials: true,
      })
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error('Failed to load notifications', err));

    const eventSource = new EventSource(
      `${import.meta.env.VITE_BACKEND_URL}/api/notifications/stream`,
      { withCredentials: true },
    );

    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(JSON.parse(e.data).data);
        setNotifications((prev) => [parsed, ...prev]);
      } catch (err) {
        console.error('Failed to parse notification', err);
      }
    };

    return () => eventSource.close();
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

  // === Mark Notifications as Read ===
  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.isRead)
      .map((n) => n.notificationId);
    if (!unreadIds.length) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/read-many`,
        { notificationIds: unreadIds },
        { withCredentials: true },
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  // === Handle Role Switch ===
  const handleSwitchRole = async () => {
    if (switching) return;
    setSwitching(true);
    try {
      const newRole = await switchRole(); // <--- CALL context's switchRole
      // now navigate based on returned role (safe)
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

      {/* === Search === */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input type="text" placeholder={t('searchPlaceholder')} />
        <select className="product-select">
          <option>{t('tabs.products')}</option>
          <option>{t('tabs.services')}</option>
          <option>{t('tabs.suppliers')}</option>
        </select>
      </div>

      {/* === Right Section === */}
      <div className="header-right">
        {/* === Cart === */}
        <button
          className="icon-btn"
          onClick={() => navigate('/buyer/cart')}
          title={t('cart')}
        >
          <FaShoppingCart />
        </button>

        {/* === Notifications === */}
        <div className="notification-wrapper" ref={dropdownRef}>
          <button
            className="icon-btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
            title={t('notifications')}
          >
            <FaBell />
            {notifications.some((n) => !n.isRead) && <span className="dot" />}
          </button>

          {dropdownOpen && (
            <div className="notification-dropdown">
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notif-item empty">{t('noNotifications')}</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.notificationId}
                      className={`notification-item ${
                        n.isRead ? '' : 'unread'
                      }`}
                    >
                      <div className="notification-content">
                        <strong>{n.title}</strong>
                        <p>{n.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="notification-footer">
                  <button
                    className="view-all-btn"
                    onClick={() => navigate('/buyer/notifications')}
                  >
                    {t('viewAll')}
                  </button>
                  <button className="mark-read-btn" onClick={markAllAsRead}>
                    {t('markAllRead')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* === Profile === */}
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
              {/* Top Section */}
              <div className="profile-info">
                <h4 className="business-name">
                  {user?.businessName || t('profileChoices.noBusinessName')}
                </h4>
                <p className="managed-by">
                  {t('profileChoices.managedBy')}: <span>{user?.name}</span>
                </p>
              </div>

              <div className="divider" />

              {/* Middle Section */}
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
                  onclick={() => {
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

              {/* Bottom Section */}
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

        {/* === Language Toggle === */}
        <button className="language-toggle" onClick={toggleLanguage}>
          <FaGlobe />
        </button>
      </div>
    </header>
  );
};

export default BuyerHeader;
