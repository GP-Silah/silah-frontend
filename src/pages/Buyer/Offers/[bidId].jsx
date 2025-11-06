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
    <div className="offers-container">
      <div className="offers-header">
        <h2 className="offers-title">{t('pageTitle')}</h2>
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
        <div className="offers-list">
          {offers.map((offer) => {
            const supplier = offer.supplier;
            return (
              <article key={offer.offerId} className="offer-card">
                {/* Clickable Supplier Header */}
                <div
                  className="supplier-header"
                  onClick={() =>
                    navigate(`/storefronts/${supplier.supplierId}`)
                  }
                >
                  {supplier.user?.pfpUrl ? (
                    <img
                      src={supplier.user.pfpUrl}
                      alt={supplier.businessName}
                      className="supplier-avatar"
                    />
                  ) : (
                    <div className="supplier-avatar-placeholder">LOGO</div>
                  )}
                  <div className="supplier-info">
                    <h3>{supplier.businessName || supplier.supplierName}</h3>
                    <p className="supplier-date">
                      {t('offerDate')}: {formatDate(offer.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="offer-details">
                  <div className="detail-item">
                    <span className="detail-label">{t('proposedAmount')}</span>
                    <span className="detail-value">
                      {offer.proposedAmount.toLocaleString()} SAR
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('completionTime')}</span>
                    <span className="detail-value">
                      {formatDate(offer.expectedCompletionTime)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                {offer.status !== 'PENDING' && (
                  <div style={{ margin: '12px 0' }}>
                    <span
                      className={`status-badge status-${offer.status.toLowerCase()}`}
                    >
                      {t(`status.${offer.status}`)}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="offer-actions">
                  <button
                    className="view-details-btn"
                    onClick={() =>
                      navigate(`/buyer/offers/offer/${offer.offerId}`, {
                        state: { offer },
                      })
                    }
                  >
                    {t('viewDetails')}
                  </button>

                  <div className="action-group">
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
                      <div className="reviewed-note">{t('offerUpdated')}</div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
