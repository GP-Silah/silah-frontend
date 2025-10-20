import React from 'react';
import GuestHeader from '@/components/GuestHeader/GuestHeader';
import Footer from '@/components/Footer/Footer';
import DemoBanner from '@/components/DemoBanner/DemoBanner';
import { Outlet } from 'react-router-dom';

export default function GuestLayout() {
  return (
    <>
      <DemoBanner />
      <GuestHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
