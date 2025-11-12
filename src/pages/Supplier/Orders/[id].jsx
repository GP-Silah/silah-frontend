import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { MessageCircle } from 'lucide-react';
import '../../Buyer/Orders/OrderDetails.css'; // same CSS

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

// Helper: first 10 digits → #1234567890
const refNumber = (orderId) => {
  const digits = orderId.match(/\d/g)?.slice(0, 10).join('');
  return digits ? `#${digits}` : '—';
};

export default function OrderDetailsSupplier() {
  const { t, i18n } = useTranslation('orderDetails');
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // -------------------------------------------------
  // FETCH ORDER
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
  }, [orderId, i18n.language, t]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // -------------------------------------------------
  // UPDATE STATUS (PATCH)
  // -------------------------------------------------
  const updateStatus = async (newStatus) => {
    if (updating) return;
    setUpdating(true);
    try {
      await axios.patch(
        `${API_BASE}/api/orders/${orderId}/status`,
        { newStatus },
        { withCredentials: true },
      );
      setOrder((prev) => ({ ...prev, status: newStatus }));
      setShowDropdown(false);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        t('errors.statusUpdateFailed');
      setError(msg);
    } finally {
      setUpdating(false);
    }
  };

  // -------------------------------------------------
  // OPEN CHAT (same logic as SupplierStorefront)
  // -------------------------------------------------
  const openChat = async () => {
    if (!order?.buyer?.user.userId) return;

    const partner = {
      userId: order.buyer.user.userId,
      name: order.buyer.user.businessName || order.buyer.user.name || 'Buyer',
      avatar: order.buyer.user.pfpUrl || '/placeholder-pfp.png',
    };

    try {
      const { data: chats } = await axios.get(`${API_BASE}/api/chats/me`, {
        withCredentials: true,
      });
      const existing = (chats || []).find(
        (c) => c.otherUser?.userId === partner.userId,
      );
      if (existing) {
        navigate(`/supplier/chats/${existing.chatId}`);
      } else {
        navigate(`/supplier/chats/new?with=${partner.userId}`, {
          state: { partner },
        });
      }
    } catch {
      // fallback – go to new chat
      navigate(`/supplier/chats/new?with=${partner.userId}`, {
        state: { partner },
      });
    }
  };

  // -------------------------------------------------
  // PAGE TITLE & RTL
  // -------------------------------------------------
  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [t, isRTL]);

  // -------------------------------------------------
  // LOADING / ERROR
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

  const currentStatus = order.status.toUpperCase();

  // Supplier can only change PENDING → PROCESSING → SHIPPED
  const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED'];
  const canChangeStatus = allowedStatuses.includes(currentStatus);

  return (
    <div className="order-details-container">
      {/* ---------- TITLE + STATUS ---------- */}
      <h2 className="order-title">
        {t('order.title')} {refNumber(order.orderId)}
        <div className="status-wrapper" style={{ position: 'relative' }}>
          {canChangeStatus ? (
            <button
              className={`order-status ${currentStatus.toLowerCase()} clickable`}
              onClick={() => setShowDropdown((v) => !v)}
              disabled={updating}
              style={{ cursor: updating ? 'not-allowed' : 'pointer' }}
            >
              {t(`order.status.${currentStatus.toLowerCase()}`)}
            </button>
          ) : (
            <span className={`order-status ${currentStatus.toLowerCase()}`}>
              {t(`order.status.${currentStatus.toLowerCase()}`)}
            </span>
          )}

          {/* Dropdown */}
          {showDropdown && canChangeStatus && (
            <div className="status-dropdown">
              {allowedStatuses
                .filter((s) => s !== currentStatus)
                .map((s) => (
                  <button
                    key={s}
                    className={`status-option ${s.toLowerCase()}`}
                    onClick={() => updateStatus(s)}
                    disabled={updating}
                  >
                    {t(`order.status.${s.toLowerCase()}`)}
                  </button>
                ))}
            </div>
          )}
        </div>
      </h2>

      {/* ---------- ORDER INFO ---------- */}
      <p className="order-info">
        {t('order.orderedOn')} <b>{formattedDate}</b> - {formattedTime}
      </p>

      <p className="order-info">
        {t('order.buyer')}{' '}
        <b
          className="clickable-supplier"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {order.buyer?.user.businessName || t('unknown')}
          <button onClick={openChat} className="chat-btn-inline">
            <MessageCircle size={16} />
          </button>
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

      {/* ---------- ITEMS TABLE ---------- */}
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

      {/* ---------- NO ACTION BUTTONS ---------- */}
      <div className="order-action" style={{ minHeight: '40px' }} />
    </div>
  );
}
