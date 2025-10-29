import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaEnvelope,
  FaFileInvoice,
  FaTag,
  FaTruck,
  FaStar,
  FaCheck,
} from 'react-icons/fa';
import './Notifications.css';

const TYPE_ICONS = {
  CHAT: FaEnvelope,
  ORDER: FaTruck,
  REVIEW: FaStar,
  BID: FaTag,
  OFFER: FaTag,
  INVOICE: FaFileInvoice,
};

export default function NotificationsSupplier() {
  const { t, i18n } = useTranslation('notifications');
  const navigate = useNavigate();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(t('allNotifications'));
  const [selectedDate, setSelectedDate] = useState(t('allDays'));

  // === Fetch Notifications ===
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications/me`,
          { params: { lang: i18n.language }, withCredentials: true },
        );
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [i18n.language]);

  // === Close dropdowns on outside click ===
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.page-dropdown')) {
        setTypeOpen(false);
        setDateOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // === Mark Single as Read ===
  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/read`,
        {},
        { withCredentials: true },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  // === Mark All as Read ===
  const markAllAsRead = async () => {
    const ids = notifications
      .filter((n) => !n.isRead)
      .map((n) => n.notificationId);
    if (!ids.length) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/read-many`,
        { notificationIds: ids },
        { withCredentials: true },
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  // === Handle Click ===
  const handleNotificationClick = (n) => {
    if (!n.isRead) markAsRead(n.notificationId);

    switch (n.relatedEntityType) {
      case 'CHAT':
        navigate(`/supplier/chats/${n.relatedEntityId}`);
        break;
      case 'ORDER':
        navigate(`/supplier/orders/${n.relatedEntityId}`);
        break;
      case 'REVIEW':
        navigate(`/supplier/reviews/${n.relatedEntityId}`);
        break;
      case 'BID':
      case 'OFFER':
        navigate(`/supplier/bids/${n.relatedEntityId}`);
        break;
      case 'INVOICE':
        navigate(`/supplier/invoices/${n.relatedEntityId}`);
        break;
      default:
        break;
    }
  };

  // === Filter Logic ===
  const filtered = notifications.filter((n) => {
    if (selectedType !== t('allNotifications')) {
      const typeMap = {
        [t('newMessages')]: 'CHAT',
        [t('newOrders')]: 'ORDER',
        [t('newReviews')]: 'REVIEW',
        [t('bidsStatus')]: ['BID', 'OFFER'],
        [t('invoicesStatus')]: 'INVOICE',
      };
      const allowed = typeMap[selectedType];
      if (Array.isArray(allowed)) {
        if (!allowed.includes(n.relatedEntityType)) return false;
      } else if (allowed !== n.relatedEntityType) return false;
    }

    if (selectedDate !== t('allDays')) {
      const today = new Date();
      const created = new Date(n.createdAt);
      if (selectedDate === t('today') && !isSameDay(created, today))
        return false;
      if (selectedDate === t('thisWeek') && !isThisWeek(created)) return false;
      if (
        selectedDate === t('thisMonth') &&
        created.getMonth() !== today.getMonth()
      )
        return false;
    }

    return true;
  });

  return (
    <div className="buyer-notif-page" data-dir={dir}>
      <div className="page-notif-header">
        <div className="page-filters-center">
          {/* Type Filter */}
          <div className="page-notif-filter-inline">
            <span className="page-filter-label">{t('type')}</span>
            <div className="page-dropdown">
              <button onClick={() => setTypeOpen((prev) => !prev)}>
                {selectedType} ▼
              </button>
              {typeOpen && (
                <div
                  className="page-dropdown-menu page-type-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  {[
                    t('allNotifications'),
                    t('newMessages'),
                    t('newOrders'),
                    t('newReviews'),
                    t('bidsStatus'),
                    t('invoicesStatus'),
                  ].map((opt) => (
                    <div
                      key={opt}
                      className="page-dropdown-item"
                      onClick={() => {
                        setSelectedType(opt);
                        setTypeOpen(false);
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date Filter */}
          <div className="page-notif-filter-inline">
            <span className="page-filter-label">{t('date')}</span>
            <div className="page-dropdown">
              <button onClick={() => setDateOpen((prev) => !prev)}>
                {selectedDate} ▼
              </button>
              {dateOpen && (
                <div
                  className="page-dropdown-menu page-date-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  {[
                    t('allDays'),
                    t('today'),
                    t('thisWeek'),
                    t('thisMonth'),
                  ].map((opt) => (
                    <div
                      key={opt}
                      className="page-dropdown-item"
                      onClick={() => {
                        setSelectedDate(opt);
                        setDateOpen(false);
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button className="page-mark-all-btn" onClick={markAllAsRead}>
          {t('markAllRead')}
        </button>
      </div>

      <div className="page-notif-list">
        {loading ? (
          <div className="page-loading">{t('loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="page-empty">{t('noNotifications')}</div>
        ) : (
          filtered.map((n) => {
            const Icon = TYPE_ICONS[n.relatedEntityType] || FaEnvelope;
            return (
              <div
                key={n.notificationId}
                className={`page-notif-item ${n.isRead ? '' : 'page-unread'}`}
                onClick={() => handleNotificationClick(n)}
              >
                {!n.isRead && <span className="page-unread-dot" />}

                <div className="page-notif-icon-circle">
                  <Icon />
                </div>

                <div className="page-notif-content">
                  <div className="page-notif-title">{n.title}</div>
                  <div className="page-notif-message">{n.content}</div>
                </div>

                <div className="page-notif-meta">
                  <div className="page-notif-date">
                    {formatDate(n.createdAt, i18n.language)}
                  </div>
                  <div className="page-notif-time">
                    {formatTime(n.createdAt)}
                  </div>
                  {!n.isRead && (
                    <button
                      className="page-mark-read-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.notificationId);
                      }}
                    >
                      <FaCheck />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// === Helpers ===
const formatDate = (iso, lang) => {
  const date = new Date(iso);
  return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (iso) => {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
const isThisWeek = (d) => {
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  return d >= weekStart;
};
