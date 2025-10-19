import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NotFound.css';

export default function NotFound() {
  const { t, i18n } = useTranslation('notFound');

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t, i18n.language]);

  const isAr = i18n.language === 'ar';

  return (
    <main className={`notfound ${isAr ? 'notfound--ar' : ''}`}>
      <div className="notfound__inner">
        <div className="notfound__code">404</div>
        <h1 className="notfound__title">{t('title')}</h1>
        <h2 className="notfound__lead">{t('lead')}</h2>
        <p className="notfound__text">{t('text')}</p>
        <Link to="/" className="notfound__btn">
          {t('button')}
        </Link>
      </div>
    </main>
  );
}
