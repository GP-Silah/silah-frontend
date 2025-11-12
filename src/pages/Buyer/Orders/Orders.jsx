import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../Supplier/Orders/Orders.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

// Helper: extract first 10 digits from orderId → #1234567890
const refNumber = (orderId) => {
  const digits = orderId.match(/\d/g)?.slice(0, 10).join('');
  return digits ? `#${digits}` : '—';
};

export default function Orders() {
  const { t, i18n } = useTranslation('orders');
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -------------------------------------------------
  // Fetch Orders – filter is a dependency
  // -------------------------------------------------
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOrders([]); // clear previous results immediately

    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter.toUpperCase()); // PENDING, PROCESSING, …
      }

      const { data } = await axios.get(`${API_BASE}/api/orders/me`, {
        params,
        withCredentials: true,
      });

      setOrders(data);
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        t('errors.unknown');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filter, t]); // filter is a dependency

  // Run on mount **and** every time filter changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // only ONE useEffect

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // -------------------------------------------------
  // Update page title & dir
  // -------------------------------------------------
  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [t, isRTL]);

  // -------------------------------------------------
  // Row click → navigate to detail page
  // -------------------------------------------------
  const handleRowClick = (orderId) => {
    navigate(`/buyer/orders/${orderId}`);
  };

  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  if (loading) {
    return (
      <div className="orders-page">
        <div className="loader">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <p className="error-msg">{error}</p>
        <button onClick={fetchOrders} className="retry-btn">
          {t('retry')}
        </button>
      </div>
    );
  }

  const hasOrders = orders.length > 0;

  return (
    <div className="orders-page">
      <h2 className="page-title">{t('title')}</h2>

      {/* FILTER TABS */}
      <div className="tabs">
        {['all', 'pending', 'processing', 'shipped', 'completed'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* TABLE OR EMPTY STATE */}
      {hasOrders ? (
        <table className="orders-table">
          <thead>
            <tr>
              <th>{t('table.order')}</th>
              <th>{t('table.ordered')}</th>
              <th>{t('table.supplier')}</th>
              <th>{t('table.status')}</th>
              <th>{t('table.total')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isBuyer = order.buyer?.user?.role === 'BUYER';
              const displayName = isBuyer
                ? order.supplier?.businessName ||
                  order.supplier?.supplierName ||
                  t('unknown')
                : order.buyer?.user?.businessName || t('unknown');

              const formattedDate = new Date(
                order.createdAt,
              ).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-GB', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <tr
                  key={order.orderId}
                  className="order-row"
                  onClick={() => handleRowClick(order.orderId)}
                >
                  {/* Reference Number */}
                  <td className="order-ref">
                    <strong>{refNumber(order.orderId)}</strong>
                  </td>
                  <td>{formattedDate}</td>
                  <td>{displayName}</td>
                  <td>
                    <span
                      className={`status-badge ${order.status.toLowerCase()}`}
                    >
                      {t(`status.${order.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td>
                    {order.finalPrice.toLocaleString()}
                    <img src="/riyal.png" alt="SAR" className="sar" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <i className="fa fa-inbox empty-icon"></i>
          <h3>{t('empty.title')}</h3>
          <p>{t('empty.message')}</p>
        </div>
      )}
    </div>
  );
}
