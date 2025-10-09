import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../App.css';
import './Bids.css';
import Sidebar from '../../components/Sidebar/Sidebar';

function Bids() {
  const { t, i18n } = useTranslation('bids');

  useEffect(() => {
    document.title = t('pageTitle.bids', { ns: 'common' });
  }, [t, i18n.language]);

  const bids = [
    {
      id: 1,
      title: t('bid1.title'),
      activity: t('bid1.activity'),
      refNumber: '1286362961',
      pubDate: '05/Feb/2025',
      deadline: '15/Feb/2025',
    },
    {
      id: 2,
      title: t('bid2.title'),
      activity: t('bid2.activity'),
      refNumber: '6428549742',
      pubDate: '10/Mar/2025',
      deadline: '25/Mar/2025',
    },
  ];

  return (
    <div className="bids-layout">
      {/* ✅ السايدبار يظل يسار دائمًا */}
      <Sidebar />
      {/* ✅ الصفحة الرئيسية */}
      <main
        className={`bids-container ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}
      >
        <h2 className="bids-title">{t('title')}</h2>
        <div className="bids-list">
          {bids.map((bid) => (
            <div key={bid.id} className="bid-card">
              <p>
                <strong>{t('pubDate')}:</strong> {bid.pubDate}
              </p>
              <h3>{bid.title}</h3>
              <p>
                <strong>{t('activity')}:</strong> {bid.activity}
              </p>
              <p>
                <strong>{t('refNumber')}:</strong> {bid.refNumber}
              </p>
              <p>
                <strong>{t('deadline')}:</strong> {bid.deadline}
              </p>
              <button
                onClick={() => alert(t('details.soon'))}
                className="view-details-btn"
              >
                {t('viewDetails')}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Bids;
