import React, { useEffect, useState } from 'react';
import './OfferDetails.css';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function OfferDetails() {
  const { t, i18n } = useTranslation('offerDetails');
  const { id: offerId } = useParams(); // <-- offerId from URL
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Format date: 15/Aug/2025
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en', { month: 'short' });
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch offer
  useEffect(() => {
    const fetchOffer = async () => {
      if (!offerId) {
        setError(t('missingOfferId'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/offers/${offerId}`,
          { withCredentials: true },
        );

        setOffer(response.data);
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

    fetchOffer();
  }, [offerId, t]);

  // Accept / Decline
  const handleStatusChange = async (status) => {
    if (updating || offer?.status !== 'PENDING') return;

    setUpdating(true);

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/offers/${offerId}`,
        null,
        {
          params: { status },
          withCredentials: true,
        },
      );

      // Update local state
      setOffer((prev) => ({ ...prev, status }));

      toast.success(
        status === 'ACCEPTED' ? t('offerAccepted') : t('offerDeclined'),
      );

      // Navigate back after 1.5s
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('updateError');
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  // Page title + dir
  useEffect(() => {
    document.title = t('pageTitle.offerDetails', { ns: 'common' });
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n.language, t]);

  if (loading) {
    return (
      <div className="offer-details-container">
        <div className="offer-details-card">
          <p style={{ textAlign: 'center', padding: '40px' }}>
            {t('loadingOffer')}
          </p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="offer-details-container">
        <div className="offer-details-card">
          <p
            className="error-message"
            style={{ textAlign: 'center', color: '#e63946' }}
          >
            {error || t('offerNotFound')}
          </p>
        </div>
      </div>
    );
  }

  const supplier = offer.supplier;

  return (
    <div className={`offer-details-container ${i18n.dir()}`}>
      <div className="offer-details-card">
        <h2 className="offer-title">
          {t('supplierOfferDetails', {
            supplier: supplier.businessName || supplier.supplierName,
          })}
        </h2>
        <p className="offer-subtitle">{t('offerSubtitle')}</p>

        {/* Supplier Block – centered & clickable */}
        <div className="supplier-block">
          <button
            className="supplier-link"
            onClick={() => navigate(`/storefronts/${supplier.supplierId}`)}
            style={{ all: 'unset', cursor: 'pointer', width: '100%' }}
          >
            <div className="supplier-info-centered">
              {/* Optional logo */}
              {supplier.user?.pfpUrl ? (
                <img
                  src={supplier.user.pfpUrl}
                  alt={supplier.businessName}
                  className="supplier-avatar"
                />
              ) : (
                <div className="supplier-avatar placeholder">LOGO</div>
              )}

              <div className="supplier-text">
                <strong className="supplier-name">
                  {supplier.businessName || supplier.supplierName}
                </strong>
                <br />
                <small className="supplier-city">{supplier.city}</small>
              </div>
            </div>
          </button>
        </div>

        <div className="offer-info">
          <p>
            <strong>{t('proposedAmount')}:</strong>
            <br />
            {offer.proposedAmount.toLocaleString()} {t('sar')}
          </p>

          <p>
            <strong>{t('expectedCompletionTime')}:</strong>
            <br />
            {formatDate(offer.expectedCompletionTime)}
          </p>

          {offer.offerDetails && (
            <p>
              <strong>{t('technicalOfferDetails')}:</strong>
              <br />
              {offer.offerDetails}
            </p>
          )}

          {offer.executionDetails && (
            <p>
              <strong>{t('projectExecutionDuration')}:</strong>
              <br />
              {offer.executionDetails}
            </p>
          )}

          {offer.notes && (
            <p>
              <strong>{t('notes')}:</strong>
              <br />
              {offer.notes}
            </p>
          )}

          {offer.status !== 'PENDING' && (
            <p style={{ marginTop: '20px', textAlign: 'center' }}>
              <span
                className={`status-badge status-${offer.status.toLowerCase()}`}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                }}
              >
                {t(`status.${offer.status}`)}
              </span>
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="offer-btns">
          {offer.status === 'PENDING' ? (
            <>
              <button
                className="decline-btn"
                onClick={() => handleStatusChange('DECLINED')}
                disabled={updating}
              >
                {updating ? '...' : t('declineOffer')}
              </button>
              <button
                className="accept-btn"
                onClick={() => handleStatusChange('ACCEPTED')}
                disabled={updating}
              >
                {updating ? '...' : t('acceptOffer')}
              </button>
            </>
          ) : (
            <button
              className="accept-btn"
              style={{ background: '#4caf50', width: '100%' }}
              onClick={() => navigate(-1)}
            >
              {t('backToOffers')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
