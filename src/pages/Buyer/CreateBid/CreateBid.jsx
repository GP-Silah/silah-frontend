import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CreateBid.css';

export default function CreateBid() {
  const { t, i18n } = useTranslation('createBid');

  // direction: sync <html dir> + component container
  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }, [i18n.language]);

  const [form, setForm] = useState({
    bidName: '',
    mainActivity: '',
    submissionDeadline: '',
    responseDeadline: '2w', // default like the mock
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: hook with backend
    alert(t('publishSuccess'));
  };

  // min date = today
  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <div className="cb-page" data-dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="cb-card">
        <h1 className="cb-title">{t('title')}</h1>

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
              className="cb-input"
              placeholder={t('bidName.placeholder')}
              value={form.bidName}
              onChange={handleChange}
              required
            />
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
              className="cb-input"
              placeholder={t('mainActivity.placeholder')}
              value={form.mainActivity}
              onChange={handleChange}
              required
            />
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
              className="cb-input"
              min={todayISO}
              value={form.submissionDeadline}
              onChange={handleChange}
              required
            />
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
                className="cb-select"
                value={form.responseDeadline}
                onChange={handleChange}
              >
                <option value="1w">{t('responseDeadline.options.1w')}</option>
                <option value="2w">{t('responseDeadline.options.2w')}</option>
                <option value="3w">{t('responseDeadline.options.3w')}</option>
                <option value="1m">{t('responseDeadline.options.1m')}</option>
              </select>
            </div>
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
