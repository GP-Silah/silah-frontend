// src/pages/Buyer/Bids/BidDetailsBuyer.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './BidDetailsBuyer.css';

const BidDetailsBuyer = () => {
  const { t, i18n } = useTranslation('bidDetailsBuyer');

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="page-content">
        <div className="bid-details-container">
          <h2 className="bid-details-title">{t('title')}</h2>

          <div className="bid-details-card">
            <div className="bid-detail-row">
              <strong>{t('bidName')}</strong>
              <span>
                Supply and Installation of Smart Street Lighting Systems
              </span>
            </div>

            <div className="bid-detail-row">
              <strong>{t('mainActivity')}</strong>
              <span>
                Electrical Works & Lighting - Installation and Maintenance
              </span>
            </div>

            <div className="bid-detail-row">
              <strong>{t('organizationName')}</strong>
              <span>SkyLine</span>
            </div>

            <div className="bid-detail-row">
              <strong>{t('referenceNumber')}</strong>
              <span>1286362961</span>
            </div>

            <div className="bid-detail-row">
              <strong>{t('timeRemaining')}</strong>
              <span>10 days</span>
            </div>

            <div className="bid-detail-row">
              <strong>{t('publicationDate')}</strong>
              <span>05/Feb/2025</span>
            </div>

            <div className="bid-detail-row">
              <strong>{t('submissionDeadline')}</strong>
              <span>15/Feb/2025</span>
            </div>

            <div className="bid-detail-row">
              <strong>{t('expectedResponse')}</strong>
              <span>2 weeks after submission deadline</span>
            </div>
          </div>

          <footer className="bid-footer">
            <p>
              © 2025 Silah. All Rights Reserved. |{' '}
              <a href="/about">{t('about')}</a> |{' '}
              <a href="/terms">{t('terms')}</a> |{' '}
              <a href="/privacy">{t('privacy')}</a> |{' '}
              <a href="mailto:info@silah.site">{t('contact')}</a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default BidDetailsBuyer;
