import React from 'react';
import BuyerHeader from '@/components/BuyerHeader/BuyerHeader';
import Footer from '@/components/Footer/Footer';
import { Outlet } from 'react-router-dom';

export default function BuyerLayout() {
  return (
    <>
      <BuyerHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
