import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  FaEnvelope,
  FaFileInvoice,
  FaTag,
  FaTruck,
  FaStar,
  FaCheck,
} from 'react-icons/fa';
import styles from './Notifications.module.css';

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

  const { notifications, markAllAsRead, markSingleAsRead } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(t('allNotifications'));
  const [selectedDate, setSelectedDate] = useState(t('allDays'));

  // Stop loading once we have notifications
  useEffect(() => {
    if (notifications.length > 0) {
      setLoading(false);
    }
  }, [notifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(`.${styles['page-dropdown']}`)) {
        setTypeOpen(false);
        setDateOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Handle notification click + navigation
  const handleNotificationClick = (n) => {
    if (!n.isRead) markSingleAsRead(n.notificationId);

    switch (n.relatedEntityType) {
      case 'CHAT':
        navigate(`/supplier/chats/`);
        break;
      case 'ORDER':
        navigate(`/supplier/orders/${n.relatedEntityId}`);
        break;
      case 'REVIEW':
        navigate(`/supplier/analytics`);
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

  // Filter notifications
  const filtered = notifications.filter((n) => {
    // Type filter
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

    // Date filter
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
    <div className={styles['buyer-notif-page']} data-dir={dir}>
      {/* Header with filters */}
      <div className={styles['page-notif-header']}>
        <div className={styles['page-filters-center']}>
          {/* Type Filter */}
          <div className={styles['page-notif-filter-inline']}>
            <span className={styles['page-filter-label']}>{t('type')}</span>
            <div className={styles['page-dropdown']}>
              <button onClick={() => setTypeOpen((prev) => !prev)}>
                {selectedType} ▼
              </button>
              {typeOpen && (
                <div
                  className={`${styles['page-dropdown-menu']} ${styles['page-type-menu']}`}
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
                      className={styles['page-dropdown-item']}
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
          <div className={styles['page-notif-filter-inline']}>
            <span className={styles['page-filter-label']}>{t('date')}</span>
            <div className={styles['page-dropdown']}>
              <button onClick={() => setDateOpen((prev) => !prev)}>
                {selectedDate} ▼
              </button>
              {dateOpen && (
                <div
                  className={`${styles['page-dropdown-menu']} ${styles['page-date-menu']}`}
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
                      className={styles['page-dropdown-item']}
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

        <button className={styles['page-mark-all-btn']} onClick={markAllAsRead}>
          {t('markAllRead')}
        </button>
      </div>

      {/* Notifications List */}
      <div className={styles['page-notif-list']}>
        {loading ? (
          <div className={styles['page-loading']}>{t('loading')}</div>
        ) : filtered.length === 0 ? (
          <div className={styles['page-empty']}>{t('noNotifications')}</div>
        ) : (
          filtered.map((n) => {
            const Icon = TYPE_ICONS[n.relatedEntityType] || FaEnvelope;
            return (
              <div
                key={n.notificationId}
                className={`${styles['page-notif-item']} ${
                  !n.isRead ? styles['page-unread'] : ''
                }`}
                onClick={() => handleNotificationClick(n)}
              >
                {!n.isRead && <span className={styles['page-unread-dot']} />}
                <div className={styles['page-notif-icon-circle']}>
                  <Icon />
                </div>
                <div className={styles['page-notif-content']}>
                  <div className={styles['page-notif-title']}>{n.title}</div>
                  <div className={styles['page-notif-message']}>
                    {n.content}
                  </div>
                </div>
                <div className={styles['page-notif-meta']}>
                  <div className={styles['page-notif-date']}>
                    {formatDate(n.createdAt, i18n.language)}
                  </div>
                  <div className={styles['page-notif-time']}>
                    {formatTime(n.createdAt)}
                  </div>
                  {!n.isRead && (
                    <button
                      className={styles['page-mark-read-btn']}
                      onClick={(e) => {
                        e.stopPropagation();
                        markSingleAsRead(n.notificationId);
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

// Helper functions
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
