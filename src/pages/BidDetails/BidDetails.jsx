import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './BidDetails.css';

const BidDetails = () => {
  const { t, i18n } = useTranslation('bidDetails');
  const navigate = useNavigate();

  const bid = {
    name: 'Supply and Installation of Smart Street Lighting Systems',
    mainActivity:
      'Electrical Works & Lighting - Installation and Maintenance of Electrical Systems',
    organization: 'SkyLine',
    reference: '1286362961',
    remaining: '10 days',
    publication: '05/Feb/2025',
    deadline: '15/Feb/2025',
    responseTime: '1 - 2 weeks after the submission deadline',
  };

  // مساعد بسيط: نخلي القيم LTR في الواجهة العربية عشان ما تلخبط البيدي
  const valueDir = i18n.language === 'ar' ? 'ltr' : 'auto';

  return (
    <div
      className={`bid-details-page ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}
    >
      <Sidebar />

      <main className="bid-details-content">
        {/* ✅ تعديل 1: العنوان يكون محاذي يمين بالعربية */}
        <h1
          className="bid-details-title"
          style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
        >
          {t('title')}
        </h1>

        {/* الكارد – يحتوي التفاصيل + الأزرار */}
        <section className="bid-details-card">
          <div className="detail-row">
            <span className="label">{t('name')}:</span>
            <span className="value" dir={valueDir}>
              {bid.name}
            </span>
          </div>

          <div className="detail-row">
            <span className="label">{t('mainActivity')}:</span>
            <span className="value" dir={valueDir}>
              {bid.mainActivity}
            </span>
          </div>

          <div className="detail-row">
            <span className="label">{t('organization')}:</span>
            <span className="value" dir={valueDir}>
              {bid.organization}
            </span>
          </div>

          {/* ✅ تعديل 2: ترجمة refNumber */}
          <div className="detail-row">
            <span className="label">{t('reference')}:</span>
            <span className="value" dir={valueDir}>
              {bid.reference}
            </span>
          </div>

          <div className="detail-row">
            <span className="label">{t('remaining')}:</span>
            <span className="value" dir={valueDir}>
              {bid.remaining}
            </span>
          </div>

          <div className="detail-row">
            <span className="label">{t('publication')}:</span>
            <span className="value" dir={valueDir}>
              {bid.publication}
            </span>
          </div>

          <div className="detail-row">
            <span className="label">{t('deadline')}:</span>
            <span className="value" dir={valueDir}>
              {bid.deadline}
            </span>
          </div>

          {/* ✅ تعديل 3: ترجمة response */}
          <div className="detail-row no-sep">
            <span className="label">{t('responseTime')}:</span>
            <span className="value" dir={valueDir}>
              {bid.responseTime}
            </span>
          </div>

          {/* الأزرار داخل الكارد وبالوسط */}
          <div className="bid-details-actions">
            <button className="back-btn" onClick={() => navigate(-1)}>
              {t('back')}
            </button>
            {/*<button className="participate-btn">{t('participate')}</button>*/}
            <button
              className="participate-btn"
              onClick={() => navigate('/bid-offer')}
            >
              {t('participate')}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BidDetails;
