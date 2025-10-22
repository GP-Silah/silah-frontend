import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipLoader } from 'react-spinners';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import BuyerLayout from './layouts/BuyerLayout';
import SupplierLayout from './layouts/SupplierLayout';
import GuestLayout from './layouts/GuestLayout';
import PublicLayout from './layouts/PublicLayout';

// Pages
import NotFound from './pages/NotFound/NotFound';
import Landing from './pages/Landing/Landing';

const pages = import.meta.glob('./pages/**/*.jsx');

export default function App() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, loading } = useAuth();

  // Automatically redirect from "/" to the appropriate page
  useEffect(() => {
    if (!loading && location.pathname === '/') {
      if (role === 'buyer') navigate('/buyer/homepage', { replace: true });
      else if (role === 'supplier')
        navigate('/supplier/homepage', { replace: true });
      else navigate('/landing', { replace: true });
    }
  }, [role, loading, location.pathname, navigate]);

  // Collect pages by layout/role
  const layoutRoutes = { public: [], guest: [], buyer: [], supplier: [] };

  Object.entries(pages).forEach(([filePath, resolver]) => {
    let routePath = filePath.replace('./pages', '').replace('.jsx', '');
    const parts = routePath.split('/').filter(Boolean);
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
    if (routePath === '/not-found') routePath = '*';

    const PageComponent = React.lazy(() =>
      resolver().then((mod) => ({ default: mod.default })),
    );

    if (routePath.startsWith('/buyer/'))
      layoutRoutes.buyer.push({ path: routePath, Component: PageComponent });
    else if (routePath.startsWith('/supplier/'))
      layoutRoutes.supplier.push({ path: routePath, Component: PageComponent });
    else if (['/login', '/signup', '/verify-email'].includes(routePath))
      layoutRoutes.public.push({ path: routePath, Component: PageComponent });
    else layoutRoutes.guest.push({ path: routePath, Component: PageComponent });
  });

  if (loading)
    return (
      <div className="loader-center">
        <ClipLoader color="#543361" size={60} />
      </div>
    );

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
          {/* Public pages: login/signup/verify-email */}
          <Route element={<PublicLayout />}>
            {layoutRoutes.public.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          {/* Guest pages: landing, etc */}
          <Route element={<GuestLayout />}>
            <Route path="/landing" element={<Landing />} />
            {layoutRoutes.guest.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          {/* Buyer pages */}
          <Route element={<BuyerLayout />}>
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['buyer']}
                  redirectTo="/landing"
                />
              }
            >
              {layoutRoutes.buyer.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Route>
          </Route>

          {/* Supplier pages */}
          <Route element={<SupplierLayout />}>
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['supplier']}
                  redirectTo="/landing"
                />
              }
            >
              {layoutRoutes.supplier.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Route>
          </Route>

          {/* Root "/" */}
          <Route path="/" element={<Navigate to="/landing" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}
