import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './BidsCreated.css';

export default function BidsYouCreated() {
  const { t, i18n } = useTranslation('bidsCreated');
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  const handleCreateBid = () => {
    navigate('/buyer/create-bid');
  };
  const handleViewDetails = () => {
    navigate('/buyer/create-bid/bid-details-buyer');
  };

  const handleReceivedOffers = () => {
    navigate('/buyer/offers/received-offers');
  };

  useEffect(() => {
    // عنوان المتصفح + اتجاه الصفحة
    document.title = t('pageTitle', { ns: 'common' });
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n.language, t]);

  // بيانات تجريبية (نبدلها ببيانات من API)
  const bids = [
    {
      id: 'b1',
      publishedAt: '05/Feb/2025',
      title: 'Supply and Installation of Smart Street Lighting Systems',
      activity:
        'Electrical Works & Lighting - Installation and Maintenance of Electrical Systems',
      ref: '1286362961',
      deadline: '15/Feb/2025',
      offersAvailable: true,
    },
    {
      id: 'b2',
      publishedAt: '01/Apr/2025',
      title: 'Restaurant Equipment and Supplies for Operation',
      activity:
        'Supplying equipment, furniture and decorations necessary for restaurant operation',
      ref: '6428547942',
      deadline: '10/Apr/2025',
      offersAvailable: false, // مغلقة إلى أن يوصل الموعد
    },
  ];

  return (
    <main
      className={`bids-page ${isRTL ? 'rtl' : 'ltr'}`}
      data-dir={i18n.dir()}
    >
      <div className="bids-header">
        <h2 className="bids-title">{t('bidsTitle')}</h2>

        <button className="create-bid-btn" onClick={handleCreateBid}>
          Create a New Bid +
        </button>
      </div>

      <section className="bids-list">
        {bids.map((bid) => (
          <article key={bid.id} className="bid-card">
            {/* سطر "تاريخ النشر" */}
            <p className="muted top-note">
              {t('dateOfPublication')}: <span>{bid.publishedAt}</span>
            </p>

            {/* العنوان */}
            <h3 className="bid-title">{bid.title}</h3>

            <hr className="divider" />

            {/* النشاط الرئيسي */}
            <p className="activity">
              <strong className="activity-label">{t('mainActivity')}:</strong>{' '}
              <span className="activity-text">{bid.activity}</span>
            </p>

            <hr className="divider thin" />

            {/* الشريط السفلي */}
            <div className="bid-footer">
              <div className="meta">
                <div className="meta-block">
                  <span className="meta-label">{t('referenceNumber')}:</span>
                  <span className="meta-value">{bid.ref}</span>
                </div>

                <div className="meta-block">
                  <span className="meta-label">{t('submissionDeadline')}:</span>
                  <span className="meta-value with-icon">
                    {/* آيقونة تقويم بسيطة (رمز) */}
                    <span className="emoji">📅</span>
                    {bid.deadline}
                  </span>
                </div>
              </div>

              <div className="actions">
                <button className="btn btn-primary" onClick={handleViewDetails}>
                  View Details
                </button>

                {bid.offersAvailable ? (
                  <button
                    className="btn btn-primary"
                    onClick={handleReceivedOffers}
                  >
                    View Offers
                  </button>
                ) : (
                  <button className="btn btn-disabled" disabled>
                    {t('offersLockedNote')}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
