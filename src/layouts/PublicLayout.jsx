import React from 'react';
import SimpleHeader from '@/components/SimpleHeader/SimpleHeader';
import Footer from '@/components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import DemoBanner from '@/components/DemoBanner/DemoBanner';

export default function PublicLayout() {
  return (
    <>
      <DemoBanner />
      <SimpleHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
