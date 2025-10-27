import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './BidDetailsBuyer.css';

export default function BidDetailsBuyer() {
  const { t, i18n } = useTranslation('bidDetailsBuyer');

  // ضبط الاتجاه تلقائي حسب اللغة
  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }, [i18n.language]);

  // بيانات تجريبية (placeholder)
  const bid = {
    name: 'Supply and Installation of Smart Street Lighting Systems',
    activity:
      'Electrical Works & Lighting - Installation and Maintenance of Electrical Systems',
    organization: 'SkyLine',
    reference: '1286362961',
    remaining: '10 days',
    publication: '05/Feb/2025',
    submission: '15/Feb/2025',
    response: '2 weeks after the submission deadline',
  };

  return (
    <div className="bdb-page" data-dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bdb-card">
        <h2 className="bdb-title">{t('title')}</h2>

        <div className="bdb-details">
          <div className="bdb-item">
            <span className="bdb-label">{t('bidName')}</span>
            <span className="bdb-value">{bid.name}</span>
          </div>

          <div className="bdb-item">
            <span className="bdb-label">{t('mainActivity')}</span>
            <span className="bdb-value">{bid.activity}</span>
          </div>

          <div className="bdb-item">
            <span className="bdb-label">{t('organizationName')}</span>
            <span className="bdb-value">{bid.organization}</span>
          </div>

          <div className="bdb-item">
            <span className="bdb-label">{t('referenceNumber')}</span>
            <span className="bdb-value">{bid.reference}</span>
          </div>

          <div className="bdb-item">
            <span className="bdb-label">{t('timeRemaining')}</span>
            <span className="bdb-value">{bid.remaining}</span>
          </div>

          <div className="bdb-item">
            <span className="bdb-label">{t('publicationDate')}</span>
            <span className="bdb-value">{bid.publication}</span>
          </div>

          <div className="bdb-item">
            <span className="bdb-label">{t('submissionDeadline')}</span>
            <span className="bdb-value">{bid.submission}</span>
          </div>

          <div className="bdb-item">
            <span className="bdb-label">{t('expectedResponse')}</span>
            <span className="bdb-value">{bid.response}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
