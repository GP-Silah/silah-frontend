import React, { useEffect, useState } from 'react';
import './ReceivedOffers.css';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BiddingOffersBuyer() {
  const { t, i18n } = useTranslation('receivedOffers');
  const navigate = useNavigate();
  const { bidId } = useParams(); // <-- GET bidId from URL

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({}); // { offerId: true } while updating

  // Format date like "06/Feb/2025"
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en', { month: 'short' });
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      if (!bidId) {
        setError(t('missingBidId'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/offers/bid/${bidId}`,
          { withCredentials: true },
        );
        setOffers(response.data);
      } catch (err) {
        const message =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          t('fetchError');
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [bidId, t]);

  // Update offer status
  const handleStatusChange = async (offerId, status) => {
    if (updating[offerId]) return;

    setUpdating((prev) => ({ ...prev, [offerId]: true }));

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/offers/${offerId}`,
        null,
        {
          params: { status },
        },
        { withCredentials: true },
      );

      // Optimistically update UI
      setOffers((prev) =>
        prev.map((offer) =>
          offer.offerId === offerId ? { ...offer, status } : offer,
        ),
      );

      toast.success(
        status === 'ACCEPTED' ? t('offerAccepted') : t('offerDeclined'),
      );
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('updateError');
      toast.error(message);
    } finally {
      setUpdating((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  // Page title & dir
  useEffect(() => {
    document.title = t('pageTitle.receivedOffers', { ns: 'common' });
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n.language, t]);

  const hasOffers = offers.length > 0;

  return (
    <div className="bids-container">
      <div className="bids-header">
        <h2 className="bids-title">{t('pageTitle')}</h2>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="loading-state">
          <p>{t('loadingOffers')}</p>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="error-state">
          <p className="error-message">{error}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!hasOffers && !loading && !error && (
        <div className="empty-state">
          <p className="empty-message">{t('noOffersMessage')}</p>
          <button
            className="new-bid-btn"
            onClick={() => navigate('/buyer/bids/new')}
          >
            {t('openNewBid')}
          </button>
        </div>
      )}

      {/* OFFERS LIST */}
      {hasOffers && !loading && (
        <div className="bids-list">
          {offers.map((offer) => (
            <div key={offer.offerId} className="bid-card">
              <div className="offer-header">
                <p className="offer-date">
                  {t('offerDate')}: <span>{formatDate(offer.createdAt)}</span>
                </p>
              </div>

              <div className="offer-body">
                <div className="offer-logo">
                  {offer.supplier.user.pfpUrl ? (
                    <img
                      src={offer.supplier.user.pfpUrl}
                      alt={offer.supplier.businessName}
                      className="supplier-logo-img"
                    />
                  ) : (
                    'LOGO'
                  )}
                </div>

                <div className="offer-info">
                  <h3 className="offer-supplier">
                    {offer.supplier.businessName || offer.supplier.supplierName}
                  </h3>

                  <p className="info-line">
                    <span className="info-label">{t('proposedAmount')}:</span>{' '}
                    <strong className="info-value">
                      {offer.proposedAmount.toLocaleString()}
                    </strong>
                  </p>

                  <p className="info-line">
                    <span className="info-label">{t('completionTime')}:</span>{' '}
                    <strong className="info-value">
                      {formatDate(offer.expectedCompletionTime)}
                    </strong>
                  </p>

                  {offer.status !== 'PENDING' && (
                    <p
                      className={`status-badge status-${offer.status.toLowerCase()}`}
                    >
                      {t(`status.${offer.status}`)}
                    </p>
                  )}
                </div>
              </div>

              {/* BUTTONS */}
              <div className="offer-buttons">
                {/* LEFT: View Details */}
                <button
                  onClick={() =>
                    navigate(`/buyer/offers/offer/${offer.offerId}`, {
                      state: { offer },
                    })
                  }
                  className="view-btn"
                >
                  {t('viewDetails')}
                </button>

                {/* RIGHT: Actions */}
                <div className="action-buttons">
                  {offer.status === 'PENDING' ? (
                    <>
                      <button
                        className="decline-btn"
                        onClick={() =>
                          handleStatusChange(offer.offerId, 'DECLINED')
                        }
                        disabled={updating[offer.offerId]}
                      >
                        {updating[offer.offerId] ? '...' : t('decline')}
                      </button>
                      <button
                        className="accept-btn"
                        onClick={() =>
                          handleStatusChange(offer.offerId, 'ACCEPTED')
                        }
                        disabled={updating[offer.offerId]}
                      >
                        {updating[offer.offerId] ? '...' : t('accept')}
                      </button>
                    </>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        textAlign: 'right',
                        color: '#888',
                        fontSize: '0.9rem',
                      }}
                    >
                      {t('offerUpdated')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
