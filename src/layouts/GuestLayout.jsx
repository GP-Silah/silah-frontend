import React from 'react';
import GuestHeader from '@/components/GuestHeader/GuestHeader';
import Footer from '@/components/Footer/Footer';
import { Outlet } from 'react-router-dom';

export default function GuestLayout() {
  return (
    <>
      <GuestHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
