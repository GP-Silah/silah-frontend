import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import '../../../App.css';
import './Bids.css';

export default function Bids() {
  const { t, i18n } = useTranslation('bids');
  const navigate = useNavigate();

  const [allBids, setAllBids] = useState([]);
  const [joinedBids, setJoinedBids] = useState([]);
  const [showJoinedOnly, setShowJoinedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // -------------------------------------------------
  // 1. Load *all* bids (public)
  // -------------------------------------------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/bids`,
        );
        setAllBids(data);
      } catch (err) {
        setError(t('errors.fetchAll'));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [t]);

  // -------------------------------------------------
  // 2. Load *joined* bids when the checkbox is ON
  // -------------------------------------------------
  useEffect(() => {
    if (!showJoinedOnly) {
      setJoinedBids([]);
      return;
    }

    const fetchJoined = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/bids/joined/me`,
          { withCredentials: true },
        );
        setJoinedBids(data);
      } catch (err) {
        setError(t('errors.fetchJoined'));
      }
    };
    fetchJoined();
  }, [showJoinedOnly, t]);

  // -------------------------------------------------
  // 3. Page title
  // -------------------------------------------------
  useEffect(() => {
    document.title = t('title');
  }, [t]);

  // -------------------------------------------------
  // 4. Helpers
  // -------------------------------------------------
  const formatDate = (iso) => {
    const d = new Date(iso);
    const opts = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString(
      i18n.language === 'ar' ? 'ar-SA' : 'en-GB',
      opts,
    );
  };

  const refNumber = (bidId) => bidId.replace(/-/g, '').slice(0, 10);

  const displayedBids = showJoinedOnly ? joinedBids : allBids;

  // -------------------------------------------------
  // 5. Render
  // -------------------------------------------------
  return (
    <div className="bids-layout">
      <main
        className={`bids-container ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}
      >
        {/* Header + filter */}
        <div className="bids-header">
          <h2 className="bids-title">{t('title')}</h2>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={showJoinedOnly}
              onChange={(e) => setShowJoinedOnly(e.target.checked)}
            />
            <span>{t('showJoinedOnly')}</span>
          </label>
        </div>

        {/* States */}
        {loading && <div className="bids-loading">{t('loading')}</div>}
        {error && <div className="bids-error">{error}</div>}

        {/* Empty */}
        {!loading && !error && displayedBids.length === 0 && (
          <p className="bids-empty">
            {showJoinedOnly ? t('noJoinedBids') : t('noBids')}
          </p>
        )}

        {/* List */}
        <div className="bids-list">
          {displayedBids.map((bid) => (
            <div key={bid.bidId} className="bid-card">
              <p>
                <strong>{t('pubDate')}:</strong> {formatDate(bid.createdAt)}
              </p>

              <h3>{bid.bidName}</h3>

              <p>
                <strong>{t('activity')}:</strong> {bid.mainActivity}
              </p>

              <p>
                <strong>{t('refNumber')}:</strong> {refNumber(bid.bidId)}
              </p>

              <p>
                <strong>{t('deadline')}:</strong>{' '}
                <FontAwesomeIcon icon={faCalendarAlt} className="cal-icon" />
                {formatDate(bid.submissionDeadline)}
              </p>

              <button
                className="view-details-btn"
                onClick={() => navigate(`/bid-details/${bid.bidId}`)}
              >
                {t('viewDetails')}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
