import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipLoader } from 'react-spinners';
import { useAuth } from './context/AuthContext';

// Layouts
import BuyerLayout from './layouts/BuyerLayout';
import SupplierLayout from './layouts/SupplierLayout';
import GuestLayout from './layouts/GuestLayout';
import PublicLayout from './layouts/PublicLayout';

// Pages
import NotFound from './pages/NotFound/NotFound';
import Landing from './pages/Landing/Landing';

const pages = import.meta.glob('./pages/**/*.jsx');

function App() {
  const { i18n } = useTranslation();
  const { role, loading } = useAuth();

  const layoutRoutes = {
    public: [],
    guest: [],
    buyer: [],
    supplier: [],
  };

  // ✅ Build routes dynamically
  Object.entries(pages).forEach(([filePath, resolver]) => {
    let routePath = filePath.replace('./pages', '').replace('.jsx', '');
    const parts = routePath.split('/').filter(Boolean);

    // handle duplicate folder/component names
    if (
      parts.length > 1 &&
      parts[parts.length - 1].toLowerCase() ===
        parts[parts.length - 2].toLowerCase()
    ) {
      parts.pop();
    }

    // build normalized path
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

    if (routePath === '/not-found') routePath = '*';

    const PageComponent = React.lazy(() =>
      resolver().then((mod) => ({ default: mod.default })),
    );

    // ✅ Assign route to correct layout
    if (['/login', '/signup', '/verify-email', '*'].includes(routePath))
      layoutRoutes.public.push({ path: routePath, Component: PageComponent });
    else if (routePath.startsWith('/buyer'))
      layoutRoutes.buyer.push({ path: routePath, Component: PageComponent });
    else if (routePath.startsWith('/supplier'))
      layoutRoutes.supplier.push({ path: routePath, Component: PageComponent });
    else layoutRoutes.guest.push({ path: routePath, Component: PageComponent });
  });

  // ✅ Handle loading state
  if (loading) {
    return (
      <div className="loader-center">
        <ClipLoader color="#543361" size={60} />
      </div>
    );
  }

  // ✅ Role-based redirect
  const redirectByRole = () => {
    if (role === 'buyer') return <Navigate to="/buyer/homepage" replace />;
    if (role === 'supplier')
      return <Navigate to="/supplier/homepage" replace />;
    return <Navigate to="/landing" replace />;
  };

  return (
    <div className={i18n.language === 'ar' ? 'lang-ar' : 'lang-en'}>
      <React.Suspense
        fallback={
          <div className="loader-center">
            <ClipLoader color="#543361" size={60} />
          </div>
        }
      >
        <Routes>
          {/* ✅ Public layout (login/signup/etc) */}
          <Route element={<PublicLayout />}>
            {layoutRoutes.public.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          {/* ✅ Guest layout (landing and other visitor pages) */}
          <Route path="/" element={<GuestLayout />}>
            <Route index element={redirectByRole()} />
            <Route path="landing" element={<Landing />} />
            {layoutRoutes.guest.map(({ path, Component }) => (
              <Route
                key={path}
                path={path.replace(/^\//, '')} // make paths relative
                element={<Component />}
              />
            ))}
          </Route>

          {/* ✅ Buyer layout */}
          <Route
            path="/buyer"
            element={
              role === 'buyer' ? <BuyerLayout /> : <Navigate to="/landing" />
            }
          >
            {layoutRoutes.buyer.map(({ path, Component }) => (
              <Route
                key={path}
                path={path.replace(/^\/buyer\//, '')}
                element={<Component />}
              />
            ))}
          </Route>

          {/* ✅ Supplier layout */}
          <Route
            path="/supplier"
            element={
              role === 'supplier' ? (
                <SupplierLayout />
              ) : (
                <Navigate to="/landing" />
              )
            }
          >
            {layoutRoutes.supplier.map(({ path, Component }) => (
              <Route
                key={path}
                path={path.replace(/^\/supplier\//, '')}
                element={<Component />}
              />
            ))}
          </Route>

          {/* ✅ Root redirect */}
          <Route path="/" element={redirectByRole()} />

          {/* ✅ Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
