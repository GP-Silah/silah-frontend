import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './BidOffer.css';

const BidOffer = () => {
  const { t, i18n } = useTranslation('bidOffer');
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted offer:', formData);
    alert(t('submitted'));
  };

  return (
    <div className={`bid-offer-page ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Sidebar />
      <main className="bid-offer-content">
        <h1 className="bid-offer-title">{t('title')}</h1>
        <p className="bid-offer-instructions">{t('instructions')}</p>

        <section className="bid-offer-card">
          <form onSubmit={handleSubmit}>
            {/* Amount */}
            <div className="offer-field">
              <label>{t('amount')}</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="15,000"
                required
              />
            </div>

            {/* Completion Date */}
            <div className="offer-field">
              <label>{t('completionDate')}</label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Technical Details */}
            <div className="offer-field">
              <label>{t('technicalDetails')}</label>
              <textarea
                name="technicalDetails"
                value={formData.technicalDetails}
                onChange={handleChange}
                rows="4"
                placeholder={t('technicalPlaceholder')}
                required
              ></textarea>
            </div>

            {/* Execution Duration */}
            <div className="offer-field">
              <label>{t('executionDuration')}</label>
              <textarea
                name="executionDuration"
                value={formData.executionDuration}
                onChange={handleChange}
                rows="3"
                placeholder={t('durationPlaceholder')}
                required
              ></textarea>
            </div>

            {/* Notes */}
            <div className="offer-field">
              <label>{t('notes')}</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder={t('notesPlaceholder')}
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="offer-actions">
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
      </main>
    </div>
  );
};

export default BidOffer;
