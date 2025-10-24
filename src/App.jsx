import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import BuyerLayout from './layouts/BuyerLayout';
import SupplierLayout from './layouts/SupplierLayout';
import GuestLayout from './layouts/GuestLayout';
import PublicLayout from './layouts/PublicLayout';

// Pages
import Landing from './pages/Landing/Landing';
import NotFound from './pages/NotFound/NotFound';

const pages = import.meta.glob('./pages/**/*.jsx');

export default function App() {
  const { i18n } = useTranslation();
  const { role, loading } = useAuth();

  if (loading) return null; // show spinner from ProtectedRoute

  const redirectByRole = () => {
    if (role === 'buyer') return <Navigate to="/buyer/homepage" replace />;
    if (role === 'supplier')
      return <Navigate to="/supplier/overview" replace />;
    return <Navigate to="/landing" replace />;
  };

  const layoutRoutes = { public: [], guest: [], buyer: [], supplier: [] };

  // Build page routes dynamically
  Object.entries(pages).forEach(([filePath, resolver]) => {
    let routePath = filePath.replace('./pages', '').replace('.jsx', '');
    const parts = routePath.split('/').filter(Boolean);
    if (
      parts.length > 1 &&
      parts.at(-1).toLowerCase() === parts.at(-2).toLowerCase()
    )
      parts.pop();
    routePath =
      '/' +
      parts
        .map((p) => {
          // turn [id] or [slug] or [anything] into :id, :slug etc.
          if (p.startsWith('[') && p.endsWith(']')) {
            return `:${p.slice(1, -1)}`;
          }
          // handle CamelCase to kebab-case
          return p.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        })
        .join('/');

    if (routePath === '/not-found') routePath = '*';
    const PageComponent = React.lazy(() =>
      resolver().then((mod) => ({ default: mod.default })),
    );

    if (
      [
        '/login',
        '/signup',
        '/verify-email',
        '/request-password-reset',
        '/password-reset',
        '*',
      ].includes(routePath)
    )
      layoutRoutes.public.push({ path: routePath, Component: PageComponent });
    else if (routePath.startsWith('/buyer'))
      layoutRoutes.buyer.push({ path: routePath, Component: PageComponent });
    else if (routePath.startsWith('/supplier'))
      layoutRoutes.supplier.push({ path: routePath, Component: PageComponent });
    else layoutRoutes.guest.push({ path: routePath, Component: PageComponent });
  });

  return (
    <div className={i18n.language === 'ar' ? 'lang-ar' : 'lang-en'}>
      <React.Suspense fallback={null}>
        <Routes>
          {/* Public layout */}
          <Route element={<PublicLayout />}>
            {layoutRoutes.public.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          {/* Guest layout */}
          <Route path="/" element={<GuestLayout />}>
            <Route index element={redirectByRole()} />
            <Route path="landing" element={<Landing />} />
            {layoutRoutes.guest.map(({ path, Component }) => (
              <Route
                key={path}
                path={path.replace(/^\//, '')}
                element={<Component />}
              />
            ))}
          </Route>

          {/* Buyer layout */}
          <Route
            element={<ProtectedRoute allowedRoles={['buyer']} redirectTo="/" />}
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

          {/* Supplier layout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['supplier']} redirectTo="/" />
            }
          >
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

          {/* Root redirect */}
          <Route path="/" element={redirectByRole()} />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}
