import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './BidOffer.css';
import { useEffect } from 'react';

const BidOffer = () => {
  const { t, i18n } = useTranslation('bidOffer');

  useEffect(() => {
    document.title = t('pageTitle.bidOffer', { ns: 'common' });
  }, [t, i18n.language]);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: '',
    completionDate: '',
    technicalDetails: '',
    executionDuration: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Offer submitted:', formData);
  };

  return (
    <div className={`bid-offer-page ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Sidebar />

      <main className="bid-offer-content">
        <div className="bid-offer-wrapper">
          <h1>{t('title')}</h1>

          <section className="bid-offer-card">
            <p className="instructions">{t('instructions')}</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('amount')}</label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="15,000"
                />
              </div>

              <div className="form-group">
                <label>{t('completionDate')}</label>
                <input
                  type="date"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>{t('technicalDetails')}</label>
                <textarea
                  name="technicalDetails"
                  rows="3"
                  value={formData.technicalDetails}
                  onChange={handleChange}
                  placeholder={t('technicalPlaceholder')}
                ></textarea>
              </div>

              <div className="form-group">
                <label>{t('executionDuration')}</label>
                <textarea
                  name="executionDuration"
                  rows="3"
                  value={formData.executionDuration}
                  onChange={handleChange}
                  placeholder={t('durationPlaceholder')}
                ></textarea>
              </div>

              <div className="form-group">
                <label>{t('notes')}</label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t('notesPlaceholder')}
                ></textarea>
              </div>

              <div className="bid-offer-actions">
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => navigate(-1)}
                >
                  {t('back')}
                </button>
                <button type="submit" className="submit-btn">
                  {t('submit')}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BidOffer;
