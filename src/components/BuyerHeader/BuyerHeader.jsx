import React, { useEffect, useState, useRef } from 'react';
import {
  FaGlobe,
  FaSearch,
  FaShoppingCart,
  FaBell,
  FaUser,
  FaEnvelope,
  FaFileInvoice,
  FaClipboardList,
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
  const dropdownRef = useRef(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  // Fetch categories
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/categories`, {
        params: { lang: i18n.language },
        withCredentials: true,
      })
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to load categories', err));
  }, [i18n.language]);

  // Fetch unread notifications and set up SSE
  useEffect(() => {
    // Initial fetch
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/me`, {
        params: { lang: i18n.language },
        withCredentials: true,
      })
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error('Failed to load notifications', err));

    // SSE for live notifications
    const eventSource = new EventSource(
      `${import.meta.env.VITE_BACKEND_URL}/api/notifications/stream`,
      { withCredentials: true },
    );

    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(JSON.parse(e.data).data); // double parse
        setNotifications((prev) => [parsed, ...prev]);
      } catch (err) {
        console.error('Failed to parse notification', err);
      }
    };

    return () => eventSource.close();
  }, [i18n.language]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

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
        {/* Cart Icon */}
        <button
          className="icon-btn"
          onClick={() => navigate('/buyer/cart')}
          title={t('cart')}
        >
          <FaShoppingCart />
        </button>

        {/* Notifications Icon */}
        <div className="notification-wrapper" ref={dropdownRef}>
          <button
            className="icon-btn"
            onClick={toggleDropdown}
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
                      {/* Optional: Icon based on n.notificationType */}
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

        {/* Profile Icon */}
        <button className="icon-btn" title={t('profile')}>
          <FaUser />
        </button>

        {/* Language toggle */}
        <button className="language-toggle" onClick={toggleLanguage}>
          <FaGlobe />
        </button>
      </div>
    </header>
  );
};

export default BuyerHeader;
