import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './DemoBanner.css';

export default function DemoBanner() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  const storageKey = 'demoBannerClosedThisSession';
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    try {
      const isClosed = sessionStorage.getItem(storageKey) === '1';
      if (isClosed) {
        setClosed(true);
      }
    } catch {
      // ignore sessionStorage errors
    }
  }, []);

  const handleClose = () => {
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {}
    setClosed(true);
  };

  if (closed) return null;

  return (
    <div
      className={`demo-banner ${lang === 'ar' ? 'demo-banner--ar' : ''}`}
      role="region"
    >
      <div className="demo-banner__content">
        <p className="demo-banner__text">
          {lang === 'ar'
            ? 'هذا الموقع تجريبي. الموردين، والمنتجات، والخدمات للعرض فقط؛ ولا تتم أي عملية دفع أو توصيل حقيقية.'
            : 'This is a demo site for testing. All suppliers, products, and services are fictitious; no real payments or shipping will occur.'}
        </p>
        <button
          className="demo-banner__close"
          aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
          onClick={handleClose}
        >
          ×
        </button>
      </div>
    </div>
  );
}
