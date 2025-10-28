import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateBid.css';

export default function CreateBid() {
  const { t, i18n } = useTranslation('createBid');
  const navigate = useNavigate();

  // Map translation keys to backend enum values
  const responseTimeMap = {
    '1w': 'ONE_WEEK',
    '2w': 'TWO_WEEKS',
    '3w': 'FOUR_WEEKS',
    '1m': 'SIX_WEEKS',
  };

  // Initialize form state, load from localStorage if available
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('createBidForm');
    return saved
      ? JSON.parse(saved)
      : {
          bidName: '',
          mainActivity: '',
          submissionDeadline: '',
          responseDeadline: '2w', // default
        };
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Sync form state to localStorage on change
  useEffect(() => {
    localStorage.setItem('createBidForm', JSON.stringify(form));
  }, [form]);

  // Sync HTML dir attribute for RTL/LTR
  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }, [i18n.language]);

  // Real-time validation for bidName and mainActivity
  useEffect(() => {
    const newErrors = {};

    // bidName validation
    if ((form.bidName || '').length > 100) {
      newErrors.bidName = t('errors.bidName.maxLength');
    } else {
      newErrors.bidName = '';
    }

    // mainActivity validation
    if ((form.mainActivity || '').length > 500) {
      newErrors.mainActivity = t('errors.mainActivity.maxLength');
    } else {
      newErrors.mainActivity = '';
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
  }, [form.bidName, form.mainActivity, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!form.bidName) {
      newErrors.bidName = t('errors.bidName.required');
    } else if (form.bidName.length > 100) {
      newErrors.bidName = t('errors.bidName.maxLength');
    }

    if (!form.mainActivity) {
      newErrors.mainActivity = t('errors.mainActivity.required');
    } else if (form.mainActivity.length > 500) {
      newErrors.mainActivity = t('errors.mainActivity.maxLength');
    }

    if (!form.submissionDeadline) {
      newErrors.submissionDeadline = t('errors.submissionDeadline.required');
    } else if (form.submissionDeadline < today) {
      newErrors.submissionDeadline = t('errors.submissionDeadline.future');
    }

    if (!form.responseDeadline) {
      newErrors.responseDeadline = t('errors.responseDeadline.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        bidName: form.bidName,
        mainActivity: form.mainActivity,
        submissionDeadline: form.submissionDeadline,
        expectedResponseTime: responseTimeMap[form.responseDeadline],
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/bids`,
        payload,
        {
          withCredentials: true,
        },
      );

      // Clear localStorage on success
      localStorage.removeItem('createBidForm');

      // Redirect to bid details page
      navigate(`/buyer/bids/${response.data.bidId}`);
    } catch (error) {
      setApiError(error.response?.data?.error?.message || t('errors.apiError'));
    }
  };

  // Min date for submissionDeadline (today)
  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <div className="cb-page" data-dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="cb-card">
        <h1 className="cb-title">{t('title')}</h1>

        {apiError && <div className="cb-error">{apiError}</div>}

        <form className="cb-form" onSubmit={handleSubmit}>
          {/* Bid Name */}
          <div className="cb-field">
            <label htmlFor="bidName" className="cb-label">
              {t('bidName.label')}
            </label>
            <input
              id="bidName"
              name="bidName"
              type="text"
              className={`cb-input ${errors.bidName ? 'cb-input-error' : ''}`}
              placeholder={t('bidName.placeholder')}
              value={form.bidName}
              onChange={handleChange}
              maxLength={100}
              required
            />
            <div className="cb-char-count">{form.bidName.length}/100</div>
            {errors.bidName && <div className="cb-error">{errors.bidName}</div>}
          </div>

          {/* Main Activity */}
          <div className="cb-field">
            <label htmlFor="mainActivity" className="cb-label">
              {t('mainActivity.label')}
            </label>
            <input
              id="mainActivity"
              name="mainActivity"
              type="text"
              className={`cb-input ${
                errors.mainActivity ? 'cb-input-error' : ''
              }`}
              placeholder={t('mainActivity.placeholder')}
              value={form.mainActivity}
              onChange={handleChange}
              maxLength={500}
              required
            />
            <div className="cb-char-count">{form.mainActivity.length}/500</div>
            {errors.mainActivity && (
              <div className="cb-error">{errors.mainActivity}</div>
            )}
          </div>

          {/* Submission Deadline */}
          <div className="cb-field">
            <label htmlFor="submissionDeadline" className="cb-label">
              {t('submissionDeadline.label')}
            </label>
            <input
              id="submissionDeadline"
              name="submissionDeadline"
              type="date"
              className={`cb-input ${
                errors.submissionDeadline ? 'cb-input-error' : ''
              }`}
              min={todayISO}
              value={form.submissionDeadline}
              onChange={handleChange}
              required
            />
            {errors.submissionDeadline && (
              <div className="cb-error">{errors.submissionDeadline}</div>
            )}
          </div>

          {/* Response Deadline for Offers */}
          <div className="cb-field">
            <label htmlFor="responseDeadline" className="cb-label">
              {t('responseDeadline.label')}
            </label>
            <div className="cb-row">
              <select
                id="responseDeadline"
                name="responseDeadline"
                className={`cb-select ${
                  errors.responseDeadline ? 'cb-input-error' : ''
                }`}
                value={form.responseDeadline}
                onChange={handleChange}
                required
              >
                <option value="1w">{t('responseDeadline.options.1w')}</option>
                <option value="2w">{t('responseDeadline.options.2w')}</option>
                <option value="3w">{t('responseDeadline.options.3w')}</option>
                <option value="1m">{t('responseDeadline.options.1m')}</option>
              </select>
            </div>
            {errors.responseDeadline && (
              <div className="cb-error">{errors.responseDeadline}</div>
            )}
          </div>

          <div className="cb-actions">
            <button type="submit" className="cb-btn">
              {t('publishBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
