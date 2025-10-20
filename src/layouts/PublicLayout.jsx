import React from 'react';
import SimpleHeader from '@/components/SimpleHeader/SimpleHeader';
import Footer from '@/components/Footer/Footer';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <>
      <SimpleHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
