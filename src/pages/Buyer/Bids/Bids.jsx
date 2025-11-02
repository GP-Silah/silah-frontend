import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import './Bids.css';

export default function BidsYouCreated() {
  const { t, i18n } = useTranslation('BidsCreated');
  const navigate = useNavigate();

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // -------------------------------------------------
  // 1. Fetch bids
  // -------------------------------------------------
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/bids/created/me`,
          { withCredentials: true },
        );
        setBids(data);
      } catch (err) {
        setError(err.response?.data?.error?.message || t('errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [t]);

  // -------------------------------------------------
  // 2. Page title + dir
  // -------------------------------------------------
  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n.language, t]);

  // -------------------------------------------------
  // 3. Helpers – format dates (en: DD/MMM/YYYY, ar: DD/MMM/YYYY)
  // -------------------------------------------------
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    const opts = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString(
      i18n.language === 'ar' ? 'ar-SA' : 'en-GB',
      opts,
    );
  };

  // -------------------------------------------------
  // 4. Render
  // -------------------------------------------------
  return (
    <main className={`bids-page ${i18n.dir() === 'rtl' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bids-header">
        <h2 className="bids-title">{t('bidsTitle')}</h2>
        <button
          className="create-bid-btn"
          onClick={() => navigate('/buyer/bids/new')}
        >
          {t('createNewBid')}
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <div className="bids-loading">{t('loading')}</div>}
      {error && <div className="bids-error">{error}</div>}

      {/* Bids list */}
      {!loading && !error && bids.length === 0 && (
        <p className="bids-empty">{t('noBids')}</p>
      )}

      <section className="bids-list">
        {bids.map((bid) => {
          const isOpenForOffers =
            new Date(bid.submissionDeadline) <= new Date();

          return (
            <article key={bid.bidId} className="bid-card">
              {/* Published date */}
              <p className="muted top-note">
                {t('dateOfPublication')}:{' '}
                <span>{formatDate(bid.createdAt)}</span>
              </p>

              {/* Title */}
              <h3 className="bid-title">{bid.bidName}</h3>
              <hr className="divider" />

              {/* Main activity */}
              <p className="activity">
                <strong className="activity-label">{t('mainActivity')}:</strong>{' '}
                <span className="activity-text">{bid.mainActivity}</span>
              </p>

              <hr className="divider thin" />

              {/* Footer */}
              <div className="bid-footer">
                <div className="meta">
                  <div className="meta-block">
                    <span className="meta-label">{t('referenceNumber')}:</span>
                    <span className="meta-value">
                      {bid.bidId.match(/\d/g)?.slice(0, 10).join('') || '—'}
                    </span>
                  </div>

                  <div className="meta-block">
                    <span className="meta-label">
                      {t('submissionDeadline')}:
                    </span>
                    <span className="meta-value with-icon">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="cal-icon"
                      />
                      {formatDate(bid.submissionDeadline)}
                    </span>
                  </div>
                </div>

                <div className="actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/buyer/bids/${bid.bidId}`)}
                  >
                    {t('viewDetails')}
                  </button>

                  {isOpenForOffers ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/buyer/offers/${bid.bidId}`)}
                    >
                      {t('viewOffers')}
                    </button>
                  ) : (
                    <button className="btn btn-disabled" disabled>
                      {t('offersLockedNote')}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
