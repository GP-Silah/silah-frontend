import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './BidDetailsBuyer.css';

export default function BidDetailsBuyer() {
  const { t, i18n } = useTranslation('BidDetailsBuyer');
  const { id } = useParams(); // <-- bid ID from URL

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
        className="bdb-page"
        data-dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="bdb-card">
          <p className="bdb-loading">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bdb-page"
        data-dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="bdb-card">
          <p className="bdb-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bdb-page" data-dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bdb-card">
        <h2 className="bdb-title">{t('title')}</h2>

        <div className="bdb-details">
          {/* Bid Name */}
          <div className="bdb-item">
            <span className="bdb-label">{t('bidName')}</span>
            <span className="bdb-value">{bid.bidName}</span>
          </div>

          {/* Main Activity */}
          <div className="bdb-item">
            <span className="bdb-label">{t('mainActivity')}</span>
            <span className="bdb-value">{bid.mainActivity}</span>
          </div>

          {/* Organization */}
          <div className="bdb-item">
            <span className="bdb-label">{t('organizationName')}</span>
            <span className="bdb-value">{bid.buyer.user.businessName}</span>
          </div>

          {/* Reference */}
          <div className="bdb-item">
            <span className="bdb-label">{t('referenceNumber')}</span>
            <span className="bdb-value">{refNumber(bid.bidId)}</span>
          </div>

          {/* Time Remaining */}
          <div className="bdb-item">
            <span className="bdb-label">{t('timeRemainingTitle')}</span>
            <span className="bdb-value">
              {timeRemaining(bid.submissionDeadline)}
            </span>
          </div>

          {/* Publication Date */}
          <div className="bdb-item">
            <span className="bdb-label">{t('publicationDate')}</span>
            <span className="bdb-value">{formatDate(bid.createdAt)}</span>
          </div>

          {/* Submission Deadline */}
          <div className="bdb-item">
            <span className="bdb-label">{t('submissionDeadline')}</span>
            <span className="bdb-value">
              {formatDate(bid.submissionDeadline)}
            </span>
          </div>

          {/* Expected Response */}
          <div className="bdb-item">
            <span className="bdb-label">{t('expectedResponse')}</span>
            <span className="bdb-value">
              {responseTimeText(bid.expectedResponseTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
