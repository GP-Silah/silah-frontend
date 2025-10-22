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
import CategoryMegamenu from '../CategoryMegamenu/CategoryMegamenu';
import './BuyerHeader.css';

const BuyerHeader = () => {
  const { t, i18n } = useTranslation('header');
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

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

  // === Notifications (Fetch + SSE) ===
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

  // === Close dropdowns when clicking outside ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.isRead)
      .map((n) => n.notificationId);
    if (unreadIds.length === 0) return;

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
                  <div
                    className="notif-item"
                    style={{ justifyContent: 'center', color: '#555' }}
                  >
                    {t('noNotifications')}
                  </div>
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
                <>
                  <button
                    className="view-all-btn"
                    onClick={() => navigate('/buyer/notifications')}
                  >
                    {t('viewAll')}
                  </button>
                  <button className="mark-read-btn" onClick={markAllAsRead}>
                    {t('markAllRead')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* === Profile === */}
        <div className="profile-wrapper" ref={profileRef}>
          <button
            className="icon-btn"
            onClick={() => setProfileOpen((prev) => !prev)}
            title={t('profile')}
          >
            <FaUser />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              {/* Top Section */}
              <div className="profile-info">
                <h4 className="business-name">Amazing Company</h4>
                <p className="managed-by">
                  {t('profileChoices.managedBy')}: <span>Name</span>
                </p>
              </div>

              <div className="divider" />

              {/* Middle Section */}
              <div className="profile-actions">
                <button className="profile-item">
                  <FaEnvelope /> {t('profileChoices.directMessaging')}
                </button>
                <button className="profile-item">
                  <FaGavel /> {t('profileChoices.biddings')}
                </button>
                <button className="profile-item">
                  <FaShoppingCart /> {t('profileChoices.orders')}
                </button>
                <button className="profile-item">
                  <FaFileInvoice /> {t('profileChoices.invoices')}
                </button>
                <button className="profile-item">
                  <FaHeart /> {t('profileChoices.wishlist')}
                </button>
                <button className="profile-item">
                  <FaCog /> {t('profileChoices.settings')}
                </button>
              </div>

              <div className="divider" />

              {/* Bottom Section */}
              <div className="profile-actions">
                <button className="profile-item highlight">
                  <FaExchangeAlt /> {t('profileChoices.changeRoleToSupplier')}
                </button>
                <button className="profile-item logout">
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
