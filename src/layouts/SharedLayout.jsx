import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useTranslation } from 'react-i18next';
import GuestHeader from '@/components/GuestHeader/GuestHeader';
import BuyerHeader from '@/components/BuyerHeader/BuyerHeader';
import DemoBanner from '@/components/DemoBanner/DemoBanner';
import Footer from '@/components/Footer/Footer';

export default function SharedLayout() {
  const { role } = useAuth();
  const { i18n } = useTranslation();
  const location = useLocation();

  // فقط إذا كان buyer → جيب الإشعارات
  const notificationsData =
    role === 'buyer' ? useNotifications(i18n.language) : null;

  const unreadCount = notificationsData
    ? notificationsData.notifications.filter((n) => !n.isRead).length
    : 0;

  const Header = role === 'buyer' ? BuyerHeader : GuestHeader;

  return (
    <>
      <DemoBanner />
      {role === 'buyer' ? (
        <BuyerHeader
          unreadCount={unreadCount}
          notifications={notificationsData.notifications}
          profilePics={notificationsData.profilePics}
          markSingleAsRead={notificationsData.markSingleAsRead}
          markAllAsRead={notificationsData.markAllAsRead}
        />
      ) : (
        <Header />
      )}
      <main>
        <Outlet context={{ notificationsData, unreadCount }} />
      </main>
      <Footer />
    </>
  );
}
