import React from 'react';
import SupplierSidebar from '@/components/SupplierSidebar/SupplierSidebar';
import Footer from '@/components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import DemoBanner from '@/components/DemoBanner/DemoBanner';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';

export default function SupplierLayout() {
  const { i18n } = useTranslation();
  const { notifications } = useNotifications(i18n.language);
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <DemoBanner />
      <div className="supplier-layout-container">
        <SupplierSidebar unreadCount={unread} />
        <main className="supplier-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
