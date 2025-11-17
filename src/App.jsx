import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import SupplierProtectedRoute from '@/pages/ProtectedSupplierRoute';
import { ToastProvider } from '@/context/NotificationPopupToast/NotificationContext';
import NotificationListener from '@/components/NotificationListener';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import SharedLayout from './layouts/SharedLayout';
import BuyerLayout from './layouts/BuyerLayout';
import SupplierLayout from './layouts/SupplierLayout';

// Pages
import Landing from './pages/Landing/Landing';
import NotFound from './pages/NotFound/NotFound';

const pages = import.meta.glob('./pages/**/*.jsx');

export default function App() {
  const { i18n } = useTranslation();
  const { role, loading } = useAuth();

  if (loading) return null;

  // Determine theme (buyer = blue, supplier = purple)
  const isBuyer = role === 'buyer';

  const redirectByRole = () => {
    if (role === 'buyer') return <Navigate to="/buyer/homepage" replace />;
    if (role === 'supplier')
      return <Navigate to="/supplier/overview" replace />;
    return <Navigate to="/landing" replace />;
  };

  const layoutRoutes = { public: [], shared: [], buyer: [], supplier: [] };

  Object.entries(pages).forEach(([filePath, resolver]) => {
    let routePath = filePath.replace('./pages', '').replace('.jsx', '');
    const parts = routePath.split('/').filter(Boolean);

    // Remove duplicate folder/file name
    if (
      parts.length > 1 &&
      parts.at(-1).toLowerCase() === parts.at(-2).toLowerCase()
    ) {
      parts.pop();
    }

    routePath =
      '/' +
      parts
        .map((p) =>
          p.startsWith('[') && p.endsWith(']')
            ? `:${p.slice(1, -1)}`
            : p.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
        )
        .join('/');

    if (routePath === '/not-found') routePath = '*';

    const PageComponent = React.lazy(() =>
      resolver().then((mod) => ({ default: mod.default })),
    );

    // Public pages
    if (
      [
        '/login',
        '/signup',
        '/verify-email',
        '/request-password-reset',
        '/password-reset',
        '*',
      ].includes(routePath)
    ) {
      layoutRoutes.public.push({ path: routePath, Component: PageComponent });
    }
    // Buyer private
    else if (routePath.startsWith('/buyer')) {
      layoutRoutes.buyer.push({ path: routePath, Component: PageComponent });
    }
    // Supplier private
    else if (routePath.startsWith('/supplier')) {
      layoutRoutes.supplier.push({ path: routePath, Component: PageComponent });
    }
    // Everything else → shared
    else {
      layoutRoutes.shared.push({ path: routePath, Component: PageComponent });
    }
  });

  return (
    <div className={i18n.language === 'ar' ? 'lang-ar' : 'lang-en'}>
      <ToastProvider isBuyer={isBuyer}>
        <NotificationListener />
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              // optional: you can tweak style per language
              style: {
                direction: i18n.dir(), // forces correct text direction inside toast
              },
            }}
          />
          <React.Suspense fallback={null}>
            <Routes>
              {/* 1. PUBLIC PAGES (login, signup, 404) */}
              <Route element={<PublicLayout />}>
                {layoutRoutes.public.map(({ path, Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
              </Route>

              {/* 2. SHARED PAGES (search, product, storefront, about) */}
              <Route element={<SharedLayout />}>
                <Route index element={redirectByRole()} />
                <Route path="landing" element={<Landing />} />
                {layoutRoutes.shared.map(({ path, Component }) => (
                  <Route
                    key={path}
                    path={path.replace(/^\//, '')}
                    element={<Component />}
                  />
                ))}
              </Route>

              {/* 3. BUYER PRIVATE PAGES */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['buyer']} redirectTo="/" />
                }
              >
                <Route path="/buyer/*" element={<BuyerLayout />}>
                  {layoutRoutes.buyer.map(({ path, Component }) => (
                    <Route
                      key={path}
                      path={path.replace(/^\/buyer\//, '')}
                      element={<Component />}
                    />
                  ))}
                </Route>
              </Route>

              {/* 4. SUPPLIER PRIVATE PAGES */}
              <Route element={<SupplierProtectedRoute />}>
                <Route path="/supplier/*" element={<SupplierLayout />}>
                  {layoutRoutes.supplier.map(({ path, Component }) => (
                    <Route
                      key={path}
                      path={path.replace(/^\/supplier\//, '')}
                      element={<Component />}
                    />
                  ))}
                </Route>
              </Route>

              {/* 5. ROOT & 404 */}
              <Route path="/" element={redirectByRole()} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </CartProvider>
      </ToastProvider>
    </div>
  );
}
