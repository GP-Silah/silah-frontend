import React from 'react';
import BuyerHeader from '@/components/BuyerHeader/BuyerHeader';
import Footer from '@/components/Footer/Footer';
import DemoBanner from '@/components/DemoBanner/DemoBanner';
import { Outlet } from 'react-router-dom';

export default function BuyerLayout() {
  return (
    <>
      <DemoBanner />
      <BuyerHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
