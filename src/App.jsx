import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import NotFound from './pages/NotFound/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar/Sidebar';

// ✅ مزوّد الكاتالوج (مسار نسبي بدون alias)
import { CatalogProvider } from './context/catalog/CatalogProvider';

// تلقائيًا: استيراد كل الصفحات .jsx من مجلد /pages
const pages = import.meta.glob('./pages/**/*.jsx');

function App() {
  const { i18n } = useTranslation();

  // جلب المستخدم من LocalStorage
  const user = JSON.parse(localStorage.getItem('user')) || null;

  // المسارات اللي نخفي فيها السايدبار (login / signup)
  const location = useLocation();
  const hideSidebarPaths = ['/login', '/signup'];

  // إظهار السايدبار فقط لو المستخدم Supplier
  const shouldHideSidebar =
    hideSidebarPaths.includes(location.pathname) ||
    !user ||
    user.role?.toLowerCase() !== 'supplier';

  // توليد الراوتات تلقائيًا من أسماء الملفات داخل /pages
  const routeElements = Object.entries(pages).map(([filePath, resolver]) => {
    // إزالة ./pages و .jsx
    let routePath = filePath.replace('./pages', '').replace('.jsx', '');

    // تقسيم المسار إلى أجزاء صالحة
    const parts = routePath.split('/').filter(Boolean);

    // إزالة التكرار لو كان اسم الملف يطابق اسم المجلد (AboutUs/AboutUs.jsx -> AboutUs)
    if (
      parts.length > 1 &&
      parts[parts.length - 1].toLowerCase() ===
        parts[parts.length - 2].toLowerCase()
    ) {
      parts.pop();
    }

    // تحويل إلى kebab-case
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

    // حالة خاصة: landing تكون هي الصفحة الرئيسية
    if (routePath === '/landing') routePath = '/';

    // تحميل كسول للمكوّن
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
      {/* ✅ لفّ كل التطبيق داخل CatalogProvider */}
      <CatalogProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {!shouldHideSidebar && <Sidebar />}
          <div style={{ flex: 1, padding: '20px' }}>
            {/* <Header /> */}
            <Routes>
              {routeElements}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* <Footer /> */}
          </div>
        </div>
      </CatalogProvider>
    </div>
  );
}

export default App;
