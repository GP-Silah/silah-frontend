import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Notifications.css';

export default function NotificationsSupplier() {
  const { t, i18n } = useTranslation('notifications');
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;

  // حالات الفتح للقوائم
  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(t('allNotifications'));
  const [selectedDate, setSelectedDate] = useState(t('allDays'));

  // بيانات الإشعارات (تجريبية)
  const notifications = [
    {
      id: 1,
      text: 'A new message from SkyLine',
      type: 'message',
      date: '04/04/2025',
      time: '2:45 PM',
    },
    {
      id: 2,
      text: 'A new review from Nasser',
      type: 'review',
      date: '15/03/2025',
      time: '2:00 PM',
    },
    {
      id: 3,
      text: 'A new order from Nivia',
      type: 'order',
      date: '01/03/2025',
      time: '1:30 PM',
    },
  ];

  const handleTypeSelect = (option) => {
    setSelectedType(option);
    setTypeOpen(false);
  };

  const handleDateSelect = (option) => {
    setSelectedDate(option);
    setDateOpen(false);
  };

  return (
    <div className="notif-page" data-dir={dir}>
      <div className="notif-header">
        <div className="notif-filters-row">
          {/* Type Filter */}
          <div className="notif-filter-inline">
            <span className="filter-label">{t('type')}</span>
            <div className="dropdown">
              <button onClick={() => setTypeOpen(!typeOpen)}>
                {selectedType} ▼
              </button>
              {typeOpen && (
                <div className="dropdown-menu">
                  {[
                    t('allNotifications'),
                    t('newReviews'),
                    t('bidsStatus'),
                    t('newMessages'),
                    t('newOrders'),
                    t('invoicesStatus'),
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className="dropdown-item"
                      onClick={() => handleTypeSelect(opt)}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date Filter */}
          <div className="notif-filter-inline">
            <span className="filter-label">{t('date')}</span>
            <div className="dropdown">
              <button onClick={() => setDateOpen(!dateOpen)}>
                {selectedDate} ▼
              </button>
              {dateOpen && (
                <div className="dropdown-menu">
                  {[
                    t('allDays'),
                    t('today'),
                    t('thisWeek'),
                    t('thisMonth'),
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className="dropdown-item"
                      onClick={() => handleDateSelect(opt)}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="notif-list">
        {notifications.map((n) => (
          <div key={n.id} className="notif-item">
            <div className="notif-icon">
              {n.type === 'message' && '💬'}
              {n.type === 'review' && '📝'}
              {n.type === 'order' && '📦'}
            </div>
            <div className="notif-info">
              <p className="notif-text">{n.text}</p>
              <p className="notif-date">
                {n.date} • {n.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
