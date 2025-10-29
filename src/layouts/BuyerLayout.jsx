import React from 'react';
import BuyerHeader from '@/components/BuyerHeader/BuyerHeader';
import Footer from '@/components/Footer/Footer';
import DemoBanner from '@/components/DemoBanner/DemoBanner';
import { Outlet } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';

export default function BuyerLayout() {
  const { i18n } = useTranslation();
  const { notifications } = useNotifications(i18n.language);
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <DemoBanner />
      <BuyerHeader unreadCount={unread} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
