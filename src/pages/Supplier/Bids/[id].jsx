import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './BidDetails.css';

export default function BidDetails() {
  const { t, i18n } = useTranslation('bidDetails');
  const { id } = useParams(); // <-- bid ID from URL
  const navigate = useNavigate();

  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // -------------------------------------------------
  // 1. Fetch bid by ID
  // -------------------------------------------------
  useEffect(() => {
    const fetchBid = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/bids/${id}`,
        );
        setBid(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError(t('errors.notFound'));
        } else {
          setError(t('errors.fetchFailed'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBid();
  }, [id, t]);

  // -------------------------------------------------
  // 2. RTL/LTR direction
  // -------------------------------------------------
  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }, [i18n.language]);

  // -------------------------------------------------
  // 3. Helpers
  // -------------------------------------------------
  const formatDate = (iso) => {
    const d = new Date(iso);
    const opts = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString(
      i18n.language === 'ar' ? 'ar-SA' : 'en-GB',
      opts,
    );
  };

  const timeRemaining = (deadlineISO) => {
    const now = new Date();
    const deadline = new Date(deadlineISO);
    const diffMs = deadline - now;
    if (diffMs <= 0) return t('timeRemaining.expired');

    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return t('timeRemaining.days', { count: days });
  };

  const responseTimeText = (enumVal) => {
    const map = {
      ONE_WEEK: t('responseTime.oneWeek'),
      TWO_WEEKS: t('responseTime.twoWeeks'),
      FOUR_WEEKS: t('responseTime.fourWeeks'),
      SIX_WEEKS: t('responseTime.sixWeeks'),
    };
    return map[enumVal] || enumVal;
  };

  const refNumber = (bidId) => bidId.match(/\d/g)?.slice(0, 10).join('') || '—';

  // -------------------------------------------------
  // 4. Render
  // -------------------------------------------------
  if (loading) {
    return (
      <div
        className={`bid-details-page ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}
      >
        <main className="bid-details-content">
          <p className="bid-loading">{t('loading')}</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bid-details-page ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}
      >
        <main className="bid-details-content">
          <p className="bid-error">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`bid-details-page ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}
    >
      <main className="bid-details-content">
        <h1
          className="bid-details-title"
          style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
        >
          {t('title')}
        </h1>

        <section className="bid-details-card">
          {/* Bid Name */}
          <div className="detail-row">
            <span className="label">{t('name')}:</span>
            <span
              className="value"
              dir={i18n.language === 'ar' ? 'ltr' : 'auto'}
            >
              {bid.bidName}
            </span>
          </div>

          {/* Main Activity */}
          <div className="detail-row">
            <span className="label">{t('mainActivity')}:</span>
            <span
              className="value"
              dir={i18n.language === 'ar' ? 'ltr' : 'auto'}
            >
              {bid.mainActivity}
            </span>
          </div>

          {/* Organization */}
          <div className="detail-row">
            <span className="label">{t('organization')}:</span>
            <span
              className="value"
              dir={i18n.language === 'ar' ? 'ltr' : 'auto'}
            >
              {bid.buyer.user.businessName}
            </span>
          </div>

          {/* Reference */}
          <div className="detail-row">
            <span className="label">{t('reference')}:</span>
            <span
              className="value"
              dir={i18n.language === 'ar' ? 'ltr' : 'auto'}
            >
              {refNumber(bid.bidId)}
            </span>
          </div>

          {/* Time Remaining */}
          <div className="detail-row">
            <span className="label">{t('remaining')}:</span>
            <span
              className="value"
              dir={i18n.language === 'ar' ? 'ltr' : 'auto'}
            >
              {timeRemaining(bid.submissionDeadline)}
            </span>
          </div>

          {/* Publication Date */}
          <div className="detail-row">
            <span className="label">{t('publication')}:</span>
            <span
              className="value"
              dir={i18n.language === 'ar' ? 'ltr' : 'auto'}
            >
              {formatDate(bid.createdAt)}
            </span>
          </div>

          {/* Submission Deadline */}
          <div className="detail-row">
            <span className="label">{t('deadline')}:</span>
            <span
              className="value"
              dir={i18n.language === 'ar' ? 'ltr' : 'auto'}
            >
              {formatDate(bid.submissionDeadline)}
            </span>
          </div>

          {/* Expected Response */}
          <div className="detail-row no-sep">
            <span className="label">{t('responseTimeTitle')}:</span>
            <span
              className="value"
              dir={i18n.language === 'ar' ? 'ltr' : 'auto'}
            >
              {responseTimeText(bid.expectedResponseTime)}
            </span>
          </div>

          {/* Actions */}
          <div className="bid-details-actions">
            <button className="back-btn" onClick={() => navigate(-1)}>
              {t('back')}
            </button>
            <button
              className="participate-btn"
              onClick={() => navigate(`/supplier/offers/bid/${id}`)}
            >
              {t('participate')}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
