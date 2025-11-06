import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import GuestHeader from '@/components/GuestHeader/GuestHeader';
import BuyerHeader from '@/components/BuyerHeader/BuyerHeader';
import DemoBanner from '@/components/DemoBanner/DemoBanner';
import Footer from '@/components/Footer/Footer';

export default function SharedLayout() {
  const { role } = useAuth();

  const Header =
    {
      buyer: BuyerHeader,
    }[role] || GuestHeader;

  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
