import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiInfo,
} from 'react-icons/fi';
import './InvoiceDetails.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Helper: first 10 digits → #1234567890
const refNumber = (id) => {
  const digits = id.match(/\d/g)?.slice(0, 10).join('');
  return digits ? `#${digits}` : '—';
};

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('invoiceDetails');
  const isRTL = i18n.dir() === 'rtl';

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [t, isRTL]);

  useEffect(() => {
    if (!id) {
      toast.error(t('errors.missingId'));
      navigate('/supplier/invoices');
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/api/invoices/me/${id}`, {
          withCredentials: true,
          headers: { 'accept-language': i18n.language },
        });
        setInvoice(res.data);
      } catch (err) {
        const msg = err.response?.data?.error?.message || t('errors.notFound');
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, i18n.language, navigate, t]);

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  if (error || !invoice) {
    return (
      <div className="invoice-details-page" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="error-container">
          <FiInfo className="error-icon" />
          <p>{error || t('errors.notFound')}</p>
          <button
            className="back-btn"
            onClick={() => navigate('/supplier/invoices')}
          >
            {t('backToInvoices')}
          </button>
        </div>
      </div>
    );
  }

  const isPreInvoice = invoice.type === 'PRE_INVOICE';
  const status = invoice.status;
  const statusColor = {
    PENDING: '#f59e0b',
    ACCEPTED: '#10b981',
    REJECTED: '#ef4444',
    FAILED: '#ef4444',
    SUCCESSFUL: '#10b981',
    PARTIALLY_PAID: '#3b82f6',
    FULLY_PAID: '#10b981',
  }[status];

  const issueDate = format(new Date(invoice.createdAt), 'dd/MM/yyyy');
  const deliveryDate = invoice.deliveryDate
    ? format(new Date(invoice.deliveryDate), 'dd/MM/yyyy')
    : '-';

  return (
    <div className="invoice-details-page" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> {t('back')}
        </button>
        <h1>
          {isPreInvoice ? t('preInvoice') : t('invoice')}{' '}
          {refNumber(invoice.invoiceId || invoice.preInvoiceId)}
        </h1>
        <div className="status-badge" style={{ backgroundColor: statusColor }}>
          {t(`status.${status}`)}
        </div>
      </div>

      {/* Info Grid */}
      <div className="info-grid">
        <div className="field">
          <label>{t('issueDate')}</label>
          <div className="readonly-field">
            <FiCalendar /> {issueDate}
          </div>
        </div>
        <div className="field">
          <label>{t('deliveryDate')}</label>
          <div className="readonly-field">
            <FiCalendar /> {deliveryDate}
          </div>
        </div>
        {invoice.termsOfPayment && (
          <div className="field">
            <label>{t('termsOfPayment')}</label>
            <div className="readonly-field">
              {invoice.termsOfPayment === 'PARTIAL'
                ? t('partiallyPaid')
                : t('fullyPaid')}
            </div>
          </div>
        )}
        <div className="field">
          <label>{t('totalAmount')}</label>
          <div className="readonly-field highlight">
            <FiDollarSign /> {invoice.amount.toFixed(2)}{' '}
            <img src="/riyal.png" alt="SAR" className="sar" />
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="party-section">
        <div className="party-card">
          <h3>{t('supplier')}</h3>
          <p>
            <strong>{invoice.supplier?.businessName || '-'}</strong>
          </p>
          <p>{invoice.supplier?.user?.name || '-'}</p>
          <p>{invoice.supplier?.city || '-'}</p>
          <p>{invoice.supplier?.user?.email || '-'}</p>
        </div>
        <div className="party-card">
          <h3>{t('buyer')}</h3>
          <p>
            <strong>{invoice.buyer?.user?.businessName || '-'}</strong>
          </p>
          <p>{invoice.buyer?.user?.name || '-'}</p>
          <p>{invoice.buyer?.user?.city || '-'}</p>
          <p>{invoice.buyer?.user?.email || '-'}</p>
        </div>
      </div>

      {/* Pre-invoice Specific Info */}
      {isPreInvoice && (
        <div className="pre-invoice-info">
          {invoice.product && (
            <div className="linked-item">
              <img
                src={
                  invoice.product.imagesFilesUrls?.[0] ||
                  '/images/placeholder.png'
                }
                alt=""
              />
              <div>
                <strong>{invoice.product.name}</strong>
                <p>{invoice.product.description}</p>
                <p>
                  {invoice.product.price.toFixed(2)}{' '}
                  <img src="/riyal.png" alt="SAR" className="sar" />
                </p>
              </div>
            </div>
          )}
          {invoice.offer && (
            <div className="offer-info">
              <h4>{t('fromOffer')}</h4>
              <p>
                <strong>{invoice.offer.bid?.bidName}</strong>
              </p>
              <p>
                {t('proposed')}: {invoice.offer.proposedAmount.toFixed(2)}{' '}
                <img src="/riyal.png" alt="SAR" className="sar" />
              </p>
              <p>
                {t('deadline')}:{' '}
                {format(
                  new Date(invoice.offer.bid?.submissionDeadline),
                  'dd/MM/yyyy',
                )}
              </p>
            </div>
          )}
          {invoice.groupPurchaseBuyer && (
            <div className="group-info">
              <h4>{t('groupPurchase')}</h4>
              <p>
                {t('quantity')}: {invoice.groupPurchaseBuyer.quantity}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Items Table */}
      {!isPreInvoice && invoice.items?.length > 0 && (
        <div className="table-container">
          <div className="table-header">
            <h3>{t('items')}</h3>
          </div>
          <table className="items-table">
            <thead>
              <tr>
                <th>{t('item')}</th>
                <th>{t('description')}</th>
                <th>{t('agreedDetails')}</th>
                <th>{t('qty')}</th>
                <th>{t('unitPrice')}</th>
                <th>{t('totalPrice')}</th>
                <th>{t('linked')}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.invoiceItemId}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.agreedDetails}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unitPrice.toFixed(2)}</td>
                  <td className="total-cell">
                    {item.priceBasedQuantity.toFixed(2)}
                  </td>
                  <td>
                    {item.relatedProduct ? (
                      <div className="linked-icon">
                        <FiFileText style={{ color: '#10b981' }} />
                        <div className="linked-tooltip">
                          <img
                            src={
                              item.relatedProduct.imagesFilesUrls?.[0] ||
                              '/images/placeholder.png'
                            }
                            alt=""
                          />
                          <span>{item.relatedProduct.name}</span>
                        </div>
                      </div>
                    ) : item.relatedService ? (
                      <div className="linked-icon">
                        <FiFileText style={{ color: '#3b82f6' }} />
                        <div className="linked-tooltip">
                          <img
                            src={
                              item.relatedService.imagesFilesUrls?.[0] ||
                              '/images/placeholder.png'
                            }
                            alt=""
                          />
                          <span>{item.relatedService.name}</span>
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="total-summary">
            <strong>
              {t('total')}: {invoice.amount.toFixed(2)}{' '}
              <img src="/riyal.png" alt="SAR" className="sar" />
            </strong>
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notesAndTerms && (
        <div className="notes-section">
          <label>{t('notesAndTerms')}</label>
          <div className="notes-content">{invoice.notesAndTerms}</div>
        </div>
      )}

      {/* Payment Info */}
      {invoice.termsOfPayment === 'PARTIAL' && (
        <div className="payment-info">
          <div className="payment-row">
            <span>{t('upfrontAmount')}</span>
            <strong>
              {invoice.upfrontAmount?.toFixed(2) || '0.00'}{' '}
              <img src="/riyal.png" alt="SAR" className="sar" />
            </strong>
          </div>
          {invoice.tapChargeIdForUpfront && (
            <div className="payment-row">
              <span>{t('upfrontPaid')}</span>
              <span className="paid">{t('paid')}</span>
            </div>
          )}
          <div className="payment-row">
            <span>{t('uponDeliveryAmount')}</span>
            <strong>
              {(invoice.amount - (invoice.upfrontAmount || 0)).toFixed(2)}{' '}
              <img src="/riyal.png" alt="SAR" className="sar" />
            </strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;
