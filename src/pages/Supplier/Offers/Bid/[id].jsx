import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './BidOffer.css';

const STORAGE_KEY = 'bidOfferDraft'; // global

export default function BidOffer() {
  const { t, i18n } = useTranslation('bidOffer');
  const { id } = useParams(); // <-- bidId from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: '',
    completionDate: '',
    technicalDetails: '',
    executionDuration: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  // 1. Load draft
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse saved draft');
      }
    }
  }, []);

  // 2. Save draft on change
  useEffect(() => {
    if (!submitSuccess) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, submitSuccess]);

  // 3. CLEAR DRAFT WHEN LEAVING PAGE (if not submitted)
  useEffect(() => {
    return () => {
      if (!submitSuccess) {
        localStorage.removeItem(STORAGE_KEY);
      }
    };
  }, [submitSuccess]);

  // -------------------------------------------------
  // 3. Page title + RTL
  // -------------------------------------------------
  useEffect(() => {
    document.title = t('pageTitle.bidOffer', { ns: 'common' });
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }, [t, i18n.language]);

  // -------------------------------------------------
  // 4. Validation
  // -------------------------------------------------
  const validate = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    // Amount
    const amountNum = parseFloat(formData.amount);
    if (!formData.amount) {
      newErrors.amount = t('validation.amount.required');
    } else if (isNaN(amountNum) || amountNum < 1) {
      newErrors.amount = t('validation.amount.min');
    }

    // Completion Date
    if (!formData.completionDate) {
      newErrors.completionDate = t('validation.completionDate.required');
    } else if (formData.completionDate < today) {
      newErrors.completionDate = t('validation.completionDate.future');
    }

    // Text fields (max 500)
    ['technicalDetails', 'executionDuration', 'notes'].forEach((field) => {
      if (formData[field].length > 500) {
        newErrors[field] = t('validation.maxLength', { count: 500 });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------------------------------
  // 5. Handle change (clear error on type)
  // -------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // -------------------------------------------------
  // 6. Submit
  // -------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!id) {
      setErrors({ general: t('errors.missingBidId') });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        proposedAmount: parseFloat(formData.amount),
        expectedCompletionTime: formData.completionDate,
        offerDetails: formData.technicalDetails,
        executionDetails: formData.executionDuration,
        notes: formData.notes || undefined,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/offers/bid/${id}`,
        payload,
        { withCredentials: true },
      );

      // Clear storage & state
      localStorage.removeItem(STORAGE_KEY);
      setSubmitSuccess(true);

      // Navigate to biddings page because we don't have offer details page for supplier
      navigate(`/supplier/bids`);
    } catch (err) {
      setErrors({
        general: err.response?.data?.error?.message || t('errors.submitFailed'),
      });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // 7. Render
  // -------------------------------------------------
  return (
    <div className={`bid-offer-page ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <main className="bid-offer-content">
        <div className="bid-offer-wrapper">
          <h1 className="bid-offer-title">{t('title')}</h1>

          <section className="bid-offer-card">
            <p className="instructions">{t('instructions')}</p>

            {errors.general && (
              <p className="error general">{errors.general}</p>
            )}
            {submitSuccess && <p className="success">{t('submitted')}</p>}

            <form onSubmit={handleSubmit}>
              {/* Amount */}
              <div className="form-group">
                <label>{t('amount')}</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder={t('amountPlaceholder')}
                  min="1"
                  step="0.01"
                  className={errors.amount ? 'error' : ''}
                />
                {errors.amount && (
                  <span className="error">{errors.amount}</span>
                )}
              </div>

              {/* Completion Date */}
              <div className="form-group">
                <label>{t('completionDate')}</label>
                <input
                  type="date"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.completionDate ? 'error' : ''}
                />
                {errors.completionDate && (
                  <span className="error">{errors.completionDate}</span>
                )}
              </div>

              {/* Technical Details */}
              <div className="form-group">
                <label>{t('technicalDetails')}</label>
                <textarea
                  name="technicalDetails"
                  rows="4"
                  value={formData.technicalDetails}
                  onChange={handleChange}
                  placeholder={t('technicalPlaceholder')}
                  maxLength={500}
                  className={errors.technicalDetails ? 'error' : ''}
                />
                <div className="char-count">
                  {formData.technicalDetails.length}/500
                </div>
                {errors.technicalDetails && (
                  <span className="error">{errors.technicalDetails}</span>
                )}
              </div>

              {/* Execution Duration */}
              <div className="form-group">
                <label>{t('executionDuration')}</label>
                <textarea
                  name="executionDuration"
                  rows="4"
                  value={formData.executionDuration}
                  onChange={handleChange}
                  placeholder={t('durationPlaceholder')}
                  maxLength={500}
                  className={errors.executionDuration ? 'error' : ''}
                />
                <div className="char-count">
                  {formData.executionDuration.length}/500
                </div>
                {errors.executionDuration && (
                  <span className="error">{errors.executionDuration}</span>
                )}
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>{t('notes')}</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t('notesPlaceholder')}
                  maxLength={500}
                  className={errors.notes ? 'error' : ''}
                />
                <div className="char-count">{formData.notes.length}/500</div>
                {errors.notes && <span className="error">{errors.notes}</span>}
              </div>

              {/* Actions */}
              <div className="bid-offer-actions">
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  {t('back')}
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? t('submitting') : t('submit')}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
