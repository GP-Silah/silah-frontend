import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './Invoices.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

// Helper: first 10 digits → #1234567890
const refNumber = (id) => {
  const digits = id.match(/\d/g)?.slice(0, 10).join('');
  return digits ? `#${digits}` : '—';
};

export default function Invoices() {
  const { t, i18n } = useTranslation('invoices');
  const isRTL = i18n.dir() === 'rtl';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all'); // showFor
  const [statusFilter, setStatusFilter] = useState('all'); // status

  // ——————————————————————— FETCH INVOICES ———————————————————————
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (typeFilter !== 'all') params.showFor = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const { data } = await axios.get(`${API_BASE}/api/invoices/me`, {
        params,
        withCredentials: true,
      });

      setInvoices(data || []);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || t('errors.unknown');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, t]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ——————————————————————— PAGE TITLE & RTL ———————————————————————
  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [t, isRTL]);

  // ——————————————————————— HELPER: Format Date ———————————————————————
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  // ——————————————————————— RENDER ———————————————————————
  if (loading) {
    return (
      <div className="invoices-page">
        <div className="loader">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoices-page">
        <p className="error-msg">{error}</p>
      </div>
    );
  }

  return (
    <div className="invoices-page">
      {/* ——— Filter by Type (showFor) ——— */}
      <div className="filter-bar">
        <span>{t('showInvoicesFor')}:</span>
        {['all', 'products', 'services', 'bids', 'groups'].map((type) => (
          <label key={type}>
            <input
              type="radio"
              name="invoiceType"
              checked={typeFilter === type}
              onChange={() => setTypeFilter(type)}
            />
            {t(`filter.${type}`)}
          </label>
        ))}
      </div>

      <h2 className="page-title">{t('pageTitle')}</h2>

      {/* ——— Tabs: Status Filter ——— */}
      <div className="tabs">
        {[
          'all',
          'accepted',
          'rejected',
          'partiallyPaid',
          'fullyPaid',
          'pending',
        ].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${statusFilter === tab ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* ——— Table ——— */}
      <table className="invoices-table">
        <thead>
          <tr>
            <th>{t('table.invoice')}</th>
            <th>{t('table.created')}</th>
            <th>{t('table.supplier')}</th>
            <th>{t('table.status')}</th>
            <th>{t('table.preInvoiceStatus')}</th> {/* ← NEW */}
            <th>{t('table.total')}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                {t('noInvoices')}
              </td>
            </tr>
          ) : (
            invoices.map((inv) => {
              const isPreInvoice = inv.type === 'PRE_INVOICE';
              const preStatus = inv.preInvoice?.status || inv.status;
              const preBadge = isPreInvoice ? 'pre' : null;
              const canceledBadge = preStatus === 'FAILED' ? 'canceled' : null;

              return (
                <tr key={inv.invoiceId || inv.preInvoiceId}>
                  {/* Invoice ID + Badges */}
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>
                        {refNumber(inv.invoiceId || inv.preInvoiceId)}
                      </span>
                      {preBadge && <span className="badge-pre">Pre</span>}
                      {canceledBadge && (
                        <span className="badge-canceled">Canceled</span>
                      )}
                    </div>
                  </td>

                  {/* Created Date */}
                  <td>{formatDate(inv.createdAt)}</td>

                  {/* Supplier Name */}
                  <td>
                    {inv.supplier?.businessName ||
                      inv.supplier?.user?.businessName ||
                      inv.supplier?.supplierName ||
                      t('unknown')}
                  </td>

                  {/* Invoice Status */}
                  <td>
                    <span
                      className={`status-badge ${inv.status.toLowerCase()}`}
                    >
                      {t(`status.${inv.status.toLowerCase()}`)}
                    </span>
                  </td>

                  {/* Pre-invoice Status */}
                  <td>
                    {isPreInvoice && preStatus ? (
                      <span
                        className={`status-badge ${preStatus.toLowerCase()}`}
                      >
                        {t(`preStatus.${preStatus.toLowerCase()}`)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Total */}
                  <td>
                    {inv.amount?.toLocaleString() || '0'}
                    <img src="/riyal.png" alt="SAR" className="sar" />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
