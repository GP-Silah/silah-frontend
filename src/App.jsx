import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import NotFound from './pages/NotFound/NotFound';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar/Sidebar';
import BidDetails from './pages/BidDetails/BidDetails';

// Automatically import all .jsx pages in /pages
const pages = import.meta.glob('./pages/**/*.jsx');

function App() {
  const { i18n } = useTranslation();

  //  LocalStorage لجلب معلومات المستخدم من
  const user = JSON.parse(localStorage.getItem('user')) || null;

  //  الصفحات اللي ما نبي فيها السايدبار (زي login/signup)
  const location = useLocation();
  const hideSidebarPaths = ['/login', '/signup'];

  // Supplier منطق التحقق: يخفي السايدبار إذا المستخدم مو
  const shouldHideSidebar =
    hideSidebarPaths.includes(location.pathname) ||
    !user ||
    user.role?.toLowerCase() !== 'supplier';

  const routeElements = Object.entries(pages).map(([filePath, resolver]) => {
    // Remove ./pages prefix and .jsx extension
    let routePath = filePath.replace('./pages', '').replace('.jsx', '');

    // Split into parts
    const parts = routePath.split('/').filter(Boolean);

    // Drop last part if it matches folder name (AboutUs/AboutUs.jsx -> AboutUs)
    if (
      parts.length > 1 &&
      parts[parts.length - 1].toLowerCase() ===
        parts[parts.length - 2].toLowerCase()
    ) {
      parts.pop();
    }

    // Convert to kebab-case
    routePath =
      '/' +
      parts
        .map((part) =>
          part
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // aB -> a-B
            .replace(/([A-Z]{2,})([A-Z][a-z]+)/g, '$1-$2') // HTMLParser -> HTML-Parser
            .toLowerCase(),
        )
        .join('/');

    // Special case: Landing page
    if (routePath === '/landing') routePath = '/';

    // Lazy load component
    const PageComponent = React.lazy(() =>
      resolver().then((mod) => ({ default: mod.default })),
    );

    return (
      <Route
        key={routePath}
        path={routePath}
        element={
          <React.Suspense fallback={<div>Loading...</div>}>
            <PageComponent />
          </React.Suspense>
        }
      />
    );
  });

  return (
    <div className={i18n.language === 'ar' ? 'lang-ar' : 'lang-en'}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {!shouldHideSidebar && <Sidebar />}
        <div style={{ flex: 1, padding: '20px' }}>
          {/* <Header />*/}
          <Routes>
            {routeElements}

            <Route path="*" element={<NotFound />} />

            <Route
              path="/bid-details/:id"
              element={
                <React.Suspense fallback={<div>Loading...</div>}>
                  <BidDetails />
                </React.Suspense>
              }
            />
          </Routes>
          {/* <Footer />*/}
        </div>
      </div>
    </div>
  );
}

export default App;
