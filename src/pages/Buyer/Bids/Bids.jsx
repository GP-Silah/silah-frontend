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

      {/* States */}
      {loading && <div className="bids-loading">{t('loading')}</div>}
      {error && <div className="bids-error">{error}</div>}
      {!loading && !error && bids.length === 0 && (
        <p className="bids-empty">{t('noBids')}</p>
      )}

      {/* Bids List */}
      <section className="bids-list">
        {bids.map((bid) => {
          const isOpenForOffers =
            new Date(bid.submissionDeadline) <= new Date();
          const refNumber =
            bid.bidId.match(/\d/g)?.slice(0, 10).join('') || '—';

          return (
            <article key={bid.bidId} className="bid-card">
              <p className="bid-published">
                {t('dateOfPublication')}: {formatDate(bid.createdAt)}
              </p>

              <h3 className="bid-title">{bid.bidName}</h3>
              <hr className="bid-divider" />

              <p className="bid-activity">
                <strong>{t('mainActivity')}:</strong> {bid.mainActivity}
              </p>

              <div className="bid-footer">
                <div className="bid-meta">
                  <div className="meta-item">
                    <span className="meta-label">{t('referenceNumber')}:</span>
                    <span className="meta-value">{refNumber}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">
                      {t('submissionDeadline')}:
                    </span>
                    <span className="meta-value">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="meta-icon"
                      />
                      {formatDate(bid.submissionDeadline)}
                    </span>
                  </div>
                </div>

                <div className="bid-actions">
                  <button
                    className="btn btn-secondary"
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
