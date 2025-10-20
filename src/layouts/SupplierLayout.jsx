import React from 'react';
import SupplierSidebar from '@/components/SupplierSidebar/SupplierSidebar';
import Footer from '@/components/Footer/Footer';
import { Outlet } from 'react-router-dom';

export default function SupplierLayout() {
  return (
    <>
      <SupplierSidebar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
