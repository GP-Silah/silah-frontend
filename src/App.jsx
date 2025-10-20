import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipLoader } from 'react-spinners';

// Layouts
import BuyerLayout from './layouts/BuyerLayout';
import SupplierLayout from './layouts/SupplierLayout';
import GuestLayout from './layouts/GuestLayout';
import PublicLayout from './layouts/PublicLayout';

// Pages
import NotFound from './pages/NotFound/NotFound';
import RedirectHome from './pages/RedirectHome';

const pages = import.meta.glob('./pages/**/*.jsx');

function App() {
  const { i18n } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user'));

  // Group routes by layout type
  const layoutRoutes = {
    public: [],
    guest: [],
    buyer: [],
    supplier: [],
  };

  // Dynamically map pages to routes + assign layout group
  Object.entries(pages).forEach(([filePath, resolver]) => {
    let routePath = filePath.replace('./pages', '').replace('.jsx', '');
    const parts = routePath.split('/').filter(Boolean);

    // Drop duplicate folder name if repeated (AboutUs/AboutUs.jsx)
    if (
      parts.length > 1 &&
      parts[parts.length - 1].toLowerCase() ===
        parts[parts.length - 2].toLowerCase()
    ) {
      parts.pop();
    }

    routePath =
      '/' +
      parts
        .map((part) =>
          part
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .replace(/([A-Z]{2,})([A-Z][a-z]+)/g, '$1-$2')
            .toLowerCase(),
        )
        .join('/');

    if (routePath === '/landing') routePath = '/landing';
    if (routePath === '/not-found') routePath = '*';

    const PageComponent = React.lazy(() =>
      resolver().then((mod) => ({ default: mod.default })),
    );

    // Layout detection based on folder
    if (routePath.startsWith('/buyer/'))
      layoutRoutes.buyer.push({ path: routePath, Component: PageComponent });
    else if (routePath.startsWith('/supplier/'))
      layoutRoutes.supplier.push({ path: routePath, Component: PageComponent });
    else if (['/login', '/signup', '/verify-email', '*'].includes(routePath))
      layoutRoutes.public.push({ path: routePath, Component: PageComponent });
    else layoutRoutes.guest.push({ path: routePath, Component: PageComponent });
  });

  return (
    <div className={i18n.language === 'ar' ? 'lang-ar' : 'lang-en'}>
      <React.Suspense
        fallback={
          <div className="loader-center">
            <ClipLoader color="#543361" size={60} />
          </div>
        }
      >
        {' '}
        <Routes>
          {/* Public pages */}
          <Route element={<PublicLayout />}>
            {layoutRoutes.public.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          {/* Guest pages */}
          <Route element={<GuestLayout />}>
            {layoutRoutes.guest.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          {/* Buyer pages */}
          <Route
            element={
              user?.role === 'buyer' ? (
                <BuyerLayout />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            {layoutRoutes.buyer.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          {/* Supplier pages */}
          <Route
            element={
              user?.role === 'supplier' ? (
                <SupplierLayout />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            {layoutRoutes.supplier.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          {/* Redirect root */}
          <Route path="/" element={<RedirectHome />} />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
