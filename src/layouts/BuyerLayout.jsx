import React from 'react';
import BuyerHeader from '@/components/BuyerHeader/BuyerHeader';
import Footer from '@/components/Footer/Footer';
import DemoBanner from '@/components/DemoBanner/DemoBanner';
import { Outlet } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';

export default function BuyerLayout() {
  const { i18n } = useTranslation();
  const { notifications, profilePics, markSingleAsRead, markAllAsRead } =
    useNotifications(i18n.language);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const contextValue = {
    notifications,
    markAllAsRead,
    markSingleAsRead,
    unreadCount,
  };

  return (
    <>
      <DemoBanner />
      <BuyerHeader
        unreadCount={unreadCount}
        notifications={notifications}
        profilePics={profilePics}
        markSingleAsRead={markSingleAsRead}
        markAllAsRead={markAllAsRead}
      />
      <main>
        <Outlet context={contextValue} />
      </main>
      <Footer />
    </>
  );
}
