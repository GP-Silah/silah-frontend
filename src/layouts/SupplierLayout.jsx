import React from 'react';
import SupplierSidebar from '@/components/SupplierSidebar/SupplierSidebar';
import Footer from '@/components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import DemoBanner from '@/components/DemoBanner/DemoBanner';

export default function SupplierLayout() {
  return (
    <>
      <DemoBanner />
      <div className="supplier-layout-container">
        <SupplierSidebar />
        <main className="supplier-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
