import React from 'react';
import { Routes, Route } from 'react-router-dom';


import NotFound from './pages/NotFound';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Footer from './components/Footer';


// Automatically import all .jsx pages in /pages
const pages = import.meta.glob('./pages/**/*.jsx');

function App() {
  const { i18n } = useTranslation();

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
      <Header />
      <Routes>{routeElements}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>

  );
}

export default App;