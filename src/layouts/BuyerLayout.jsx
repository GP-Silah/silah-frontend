import React from 'react';
import BuyerHeader from '@/components/BuyerHeader/BuyerHeader';
import Footer from '@/components/Footer/Footer';
import DemoBanner from '@/components/DemoBanner/DemoBanner';
import { Outlet } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

export default function BuyerLayout() {
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
