import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './OrderDetails.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

// Helper: extract first 10 digits from orderId → #1234567890
const refNumber = (orderId) => {
  const digits = orderId.match(/\d/g)?.slice(0, 10).join('');
  return digits ? `#${digits}` : '—';
};

export default function OrderDetailsBuyer() {
  const { t, i18n } = useTranslation('orderDetails');
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(null); // null = loading, true/false
  const [hasDraft, setHasDraft] = useState(false);

  // -------------------------------------------------
  // Fetch Order
  // -------------------------------------------------
  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError(t('errors.invalidId'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get(`${API_BASE}/api/orders/${orderId}`, {
        params: { lang: i18n.language },
        withCredentials: true,
      });
      setOrder(data);

      // === CHECK IF ALREADY REVIEWED (only if COMPLETED)
      if (data.status === 'COMPLETED') {
        try {
          const reviewRes = await axios.get(
            `${API_BASE}/api/reviews/has-reviewed/${orderId}`,
            { withCredentials: true },
          );
          setHasReviewed(reviewRes.data.hasReviewed);
        } catch (err) {
          setHasReviewed(false); // 404, 401, 403 → not reviewed
        }
      }

      // === CHECK FOR DRAFT ===
      if (data.status === 'COMPLETED') {
        const draftKey = `review_draft_${orderId}`;
        const draft = localStorage.getItem(draftKey);
        setHasDraft(!!draft);
      }
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        t('errors.unknown');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // -------------------------------------------------
  // Confirm Delivery
  // -------------------------------------------------
  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);

    try {
      await axios.patch(
        `${API_BASE}/api/orders/${orderId}/confirm-delivery`,
        {},
        { withCredentials: true },
      );

      // 1. Update order status locally
      setOrder((prev) => ({ ...prev, status: 'COMPLETED' }));

      // 2. === RE-RUN REVIEW CHECK ===
      try {
        const reviewRes = await axios.get(
          `${API_BASE}/api/reviews/has-reviewed/${orderId}`,
          { withCredentials: true },
        );
        setHasReviewed(reviewRes.data.hasReviewed);
      } catch (err) {
        setHasReviewed(false);
      }

      // 3. === CHECK FOR DRAFT ===
      const draftKey = `review_draft_${orderId}`;
      const draft = localStorage.getItem(draftKey);
      setHasDraft(!!draft);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('errors.confirmFailed');
      setError(msg);
    } finally {
      setIsConfirming(false);
    }
  };

  // -------------------------------------------------
  // Page title & RTL
  // -------------------------------------------------
  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [t, isRTL]);

  // -------------------------------------------------
  // Loading / Error
  // -------------------------------------------------
  if (loading) {
    return (
      <div className="order-details-container">
        <div className="loader">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-container">
        <p className="error-msg">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-container">
        <p className="error-msg">{t('errors.notFound')}</p>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    i18n.language === 'ar' ? 'ar-SA' : 'en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' },
  );
  const formattedTime = new Date(order.createdAt).toLocaleTimeString(
    i18n.language === 'ar' ? 'ar-SA' : 'en-US',
    { hour: 'numeric', minute: '2-digit' },
  );

  const isShipped = order.status === 'SHIPPED';
  const isCompleted = order.status === 'COMPLETED';

  return (
    <div className="order-details-container">
      <h2 className="order-title">
        {t('order.title')} {refNumber(order.orderId)}
        <span className={`order-status ${order.status.toLowerCase()}`}>
          {t(`order.status.${order.status.toLowerCase()}`)}
        </span>
      </h2>

      <p className="order-info">
        {t('order.orderedOn')} <b>{formattedDate}</b> - {formattedTime}
      </p>

      <p className="order-info">
        {t('order.supplier')}{' '}
        <b
          className="clickable-supplier"
          onClick={() => navigate(`/storefronts/${order.supplierId}`)}
        >
          {order.supplier?.businessName || t('unknown')}
        </b>
      </p>

      <p className="order-info">
        {t('order.totalPrice')}{' '}
        <b>
          {order.finalPrice.toLocaleString()}{' '}
          <img src="/riyal.png" alt={t('sarAlt')} className="sar" />
        </b>{' '}
        {t('order.paid')}
      </p>

      <h3 className="section-title">{t('items.title')}</h3>
      <table className="order-table">
        <thead>
          <tr>
            <th>{t('items.image')}</th>
            <th>{t('items.name')}</th>
            <th>{t('items.unitPrice')}</th>
            <th>{t('items.quantity')}</th>
            <th>{t('items.total')}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => {
            const imgUrl = item.product?.imagesFilesUrls?.[0] || '/riyal.png';
            return (
              <tr key={item.orderItemId}>
                <td>
                  <div className="item-image-placeholder">
                    <img
                      src={imgUrl}
                      alt={item.product?.name}
                      className="item-image"
                    />
                  </div>
                </td>
                <td>{item.product?.name || t('unknown')}</td>
                <td>{item.unitPrice.toLocaleString()}</td>
                <td>{item.quantity}</td>
                <td>{item.totalPrice.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="order-action">
        {isShipped && (
          <>
            <button
              className="action-btn confirm"
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? t('buttons.confirming') : t('buttons.confirm')}
            </button>
            <p className="action-note">{t('notes.confirmNote')}</p>
          </>
        )}

        {isCompleted && hasReviewed === false && (
          <>
            <div className="confirmed-msg">{t('confirmedMsg')}</div>
            <button
              className="action-btn review"
              onClick={() => navigate(`/buyer/reviews/new?id=${orderId}`)}
            >
              {hasDraft ? t('continueWriteReview') : t('buttons.review')}
            </button>
            <p className="action-note">{t('notes.reviewNote')}</p>
          </>
        )}

        {/* Already reviewed */}
        {isCompleted && hasReviewed === true && (
          <div className="confirmed-msg reviewed">{t('alreadyReviewed')}</div>
        )}
      </div>
    </div>
  );
}
