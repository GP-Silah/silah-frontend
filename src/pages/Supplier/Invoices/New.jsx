import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiLink,
  FiCheck,
  FiTrash2,
  FiInfo,
  FiSearch,
  FiX,
  FiLink2,
} from 'react-icons/fi';
import { format } from 'date-fns';
import './CreateInvoice.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const CreateInvoice = () => {
  const { t, i18n } = useTranslation('CreateInvoice');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId');
  const isRTL = i18n.dir() === 'rtl';

  // Form state
  const [deliveryDate, setDeliveryDate] = useState('');
  const [termsOfPayment, setTermsOfPayment] = useState('PARTIAL');
  const [upfrontAmount, setUpfrontAmount] = useState('');
  const [uponDeliveryAmount, setUponDeliveryAmount] = useState('');
  const [notesAndTerms, setNotesAndTerms] = useState('');

  // Data
  const [buyer, setBuyer] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [items, setItems] = useState([
    {
      name: '',
      description: '',
      agreedDetails: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      relatedProductId: null,
      relatedServiceId: null,
      linkedItem: null,
    },
  ]);

  // UI
  const [fetchingBuyer, setFetchingBuyer] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingIndex, setLinkingIndex] = useState(null);
  const [listings, setListings] = useState([]);
  const [listingsFilter, setListingsFilter] = useState('all');
  const [listingsSearch, setListingsSearch] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const issueDate = format(new Date(), 'dd/MM/yyyy');

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [t, isRTL]);

  // Fetch buyer
  useEffect(() => {
    if (!userId) {
      toast.error(t('errors.missingUserId'));
      navigate(-1);
      return;
    }

    const fetchBuyer = async () => {
      setFetchingBuyer(true);
      try {
        const res = await axios.get(`${API_BASE}/api/users/id/${userId}`, {
          withCredentials: true,
          headers: { 'accept-language': i18n.language },
        });
        setBuyer(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || t('errors.userNotFound');
        toast.error(msg);
        navigate(-1);
      } finally {
        setFetchingBuyer(false);
      }
    };
    fetchBuyer();
  }, [userId, i18n.language, navigate, t]);

  // Fetch supplier
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/suppliers/me`, {
          withCredentials: true,
          headers: { 'accept-language': i18n.language },
        });
        setSupplier(res.data);
      } catch (err) {
        toast.error(t('errors.supplierLoadFailed'));
      }
    };
    fetchSupplier();
  }, [i18n.language, t]);

  // Fetch listings
  // === FETCH LISTINGS (INSIDE useCallback) ===
  const fetchListings = useCallback(async () => {
    if (!supplier?.supplierId) return;
    try {
      const [prodRes, servRes] = await Promise.all([
        axios.get(`${API_BASE}/api/products/supplier/${supplier.supplierId}`, {
          withCredentials: true,
          headers: { 'accept-language': i18n.language },
        }),
        axios.get(`${API_BASE}/api/services/supplier/${supplier.supplierId}`, {
          withCredentials: true,
          headers: { 'accept-language': i18n.language },
        }),
      ]);

      const mapItem = (item, type) => ({
        id: type === 'product' ? item.productId : item.serviceId,
        type,
        name: item.name,
        img: item.imagesFilesUrls?.[0] || '/images/placeholder.png',
        price: item.price,
        stock: item.stock ?? null,
        isPublished: item.isPublished,
      });

      const mapped = [
        ...(prodRes.data || []).map((p) => mapItem(p, 'product')),
        ...(servRes.data || []).map((s) => mapItem(s, 'service')),
      ].filter((i) => i.isPublished === true); // ← CRITICAL: ONLY PUBLISHED

      setListings(mapped);
    } catch (err) {
      toast.error(t('errors.listingsLoadFailed'));
    }
  }, [supplier, i18n.language, t]);

  useEffect(() => {
    if (showLinkModal) fetchListings();
  }, [showLinkModal, fetchListings]);

  // Auto-add row
  useEffect(() => {
    const last = items[items.length - 1];
    if (
      last.name &&
      last.description &&
      last.agreedDetails &&
      last.quantity > 0 &&
      last.unitPrice > 0 &&
      items.length < 50
    ) {
      setItems((prev) => [
        ...prev,
        {
          name: '',
          description: '',
          agreedDetails: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          relatedProductId: null,
          relatedServiceId: null,
          linkedItem: null,
        },
      ]);
    }
  }, [items]);

  // Update total
  const updateItemTotal = (index) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index].totalPrice =
        updated[index].quantity * updated[index].unitPrice;
      return updated;
    });
  };

  // Validation
  const totalItemsPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [items]);

  const isPaymentValid = useMemo(() => {
    if (!totalItemsPrice) return false;
    const upfront = parseFloat(upfrontAmount) || 0;
    const upon = parseFloat(uponDeliveryAmount) || 0;
    const sum = upfront + upon;

    if (termsOfPayment === 'FULL') {
      return upon === totalItemsPrice && upfront === 0;
    }
    return sum === totalItemsPrice && upfront > 0 && upon > 0;
  }, [upfrontAmount, uponDeliveryAmount, totalItemsPrice, termsOfPayment]);

  const errors = useMemo(() => {
    const err = {};

    // Delivery Date
    if (!deliveryDate) err.deliveryDate = t('validation.deliveryDateRequired');
    else if (new Date(deliveryDate) <= new Date())
      err.deliveryDate = t('validation.deliveryDateFuture');

    // Items
    if (items.length < 2) err.items = t('validation.atLeastOneItem');
    else {
      const filledItems = items.slice(0, -1);
      const missing = filledItems.filter(
        (i) =>
          !i.name ||
          !i.description ||
          !i.agreedDetails ||
          i.quantity <= 0 ||
          i.unitPrice <= 0,
      );
      if (missing.length > 0) {
        err.items = t('validation.itemAllFieldsRequired');
      }
    }

    // Notes
    if (notesAndTerms.length > 500) err.notes = t('validation.notesTooLong');

    // Payment
    if (!isPaymentValid) {
      const upfront = parseFloat(upfrontAmount) || 0;
      const upon = parseFloat(uponDeliveryAmount) || 0;
      const sum = upfront + upon;

      if (termsOfPayment === 'PARTIAL') {
        if (upfront <= 0) err.upfront = t('validation.upfrontPositive');
        if (upon <= 0) err.uponDelivery = t('validation.uponDeliveryPositive');
        if (sum !== totalItemsPrice)
          err.payment = t('validation.paymentMustMatchTotal');
      } else if (termsOfPayment === 'FULL') {
        if (upon !== totalItemsPrice)
          err.uponDelivery = t('validation.paymentMustMatchTotal');
      }
    }

    setValidationErrors(err);
    return err;
  }, [
    deliveryDate,
    items,
    notesAndTerms,
    isPaymentValid,
    termsOfPayment,
    upfrontAmount,
    uponDeliveryAmount,
    t,
    totalItemsPrice,
  ]);

  const isFormValid = Object.keys(errors).length === 0 && buyer && supplier;

  // Handlers
  const handleLinkClick = (index) => {
    setLinkingIndex(index);
    setShowLinkModal(true);
  };

  const handleUnlink = (index) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        relatedProductId: null,
        relatedServiceId: null,
        linkedItem: null,
      };
      return updated;
    });
  };

  const handleLinkSelect = (listing) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[linkingIndex];
      // Only fill if empty
      if (!item.name) item.name = listing.name;
      if (!item.unitPrice) item.unitPrice = listing.price;
      if (listing.type === 'service') item.quantity = 1;

      item.relatedProductId = listing.type === 'product' ? listing.id : null;
      item.relatedServiceId = listing.type === 'service' ? listing.id : null;
      item.linkedItem = listing;

      item.totalPrice = item.quantity * item.unitPrice;
      return updated;
    });
    setShowLinkModal(false);
    setLinkingIndex(null);
  };

  const handleDeleteRow = (index) => {
    if (items.length <= 2) {
      toast.error(t('validation.cannotDeleteLastItem'));
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateInvoice = async () => {
    const payload = {
      buyerId: buyer.userId,
      supplierId: supplier.supplierId,
      deliveryDate,
      termsOfPayment,
      upfrontAmount:
        termsOfPayment === 'PARTIAL' ? parseFloat(upfrontAmount) : 0,
      notesAndTerms: notesAndTerms || undefined,
      items: items
        .slice(0, -1)
        .filter((i) => i.name)
        .map((i) => ({
          name: i.name,
          description: i.description,
          agreedDetails: i.agreedDetails,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          relatedProductId: i.relatedProductId || undefined,
          relatedServiceId: i.relatedServiceId || undefined,
        })),
    };

    try {
      await axios.post(`${API_BASE}/api/invoices`, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      toast.success(t('success'));
      navigate(-1);
    } catch (err) {
      const msg = err.response?.data?.message || t('errors.createFailed');
      toast.error(msg);
    }
  };

  // === FILTERED LISTINGS (useMemo) ===
  const filteredListings = useMemo(() => {
    let filtered = listings;

    // FILTER BY TYPE
    if (listingsFilter === 'products') {
      filtered = filtered.filter((i) => i.type === 'product');
    } else if (listingsFilter === 'services') {
      filtered = filtered.filter((i) => i.type === 'service');
    }

    // SEARCH
    if (listingsSearch) {
      const query = listingsSearch.toLowerCase();
      filtered = filtered.filter((i) => i.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [listings, listingsFilter, listingsSearch]);

  if (fetchingBuyer || !buyer || !supplier) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="create-invoice-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1>{t('title')}</h1>
      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="validation-summary">
          {Object.values(errors).map((msg, i) => (
            <div key={i} className="error-item">
              <FiInfo /> {msg}
            </div>
          ))}
        </div>
      )}
      {/* Info Grid */}
      <div className="info-grid">
        <div className="field">
          <label>{t('invoiceNumber')}</label>
          <div className="readonly-field">{t('invoiceNumberNote')}</div>
        </div>
        <div className="field">
          <label>{t('issueDate')}</label>
          <div className="readonly-field">{issueDate}</div>
        </div>
        <div className="field">
          <label>{t('deliveryDate')} *</label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            min={format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')}
            className={`input ${validationErrors.deliveryDate ? 'error' : ''}`}
          />
          {validationErrors.deliveryDate && (
            <small className="error-text">
              {validationErrors.deliveryDate}
            </small>
          )}
        </div>
        <div className="field">
          <label>{t('termsOfPayment')} *</label>
          <select
            value={termsOfPayment}
            onChange={(e) => setTermsOfPayment(e.target.value)}
            className="input"
          >
            <option value="PARTIAL">{t('partiallyPaid')}</option>
            <option value="FULL">{t('fullyPaid')}</option>
          </select>
        </div>
        {termsOfPayment === 'PARTIAL' && (
          <>
            <div className="field">
              <label>{t('upfrontAmount')} *</label>
              <input
                type="number"
                value={upfrontAmount}
                onChange={(e) => setUpfrontAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className={`input ${validationErrors.upfront ? 'error' : ''}`}
                placeholder="0.00"
              />
              {validationErrors.upfront && (
                <small className="error-text">{validationErrors.upfront}</small>
              )}
            </div>
            <div className="field">
              <label>{t('uponDeliveryAmount')} *</label>
              <input
                type="number"
                value={uponDeliveryAmount}
                onChange={(e) => setUponDeliveryAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className={`input ${
                  validationErrors.uponDelivery || validationErrors.payment
                    ? 'error'
                    : ''
                }`}
                placeholder="0.00"
              />
              {(validationErrors.uponDelivery || validationErrors.payment) && (
                <small className="error-text">
                  {validationErrors.uponDelivery || validationErrors.payment}
                </small>
              )}
            </div>
          </>
        )}
        {termsOfPayment === 'FULL' && (
          <div className="field">
            <label>{t('uponDeliveryAmount')} *</label>
            <input
              type="number"
              value={uponDeliveryAmount}
              onChange={(e) => setUponDeliveryAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className={`input ${
                validationErrors.uponDelivery || validationErrors.payment
                  ? 'error'
                  : ''
              }`}
              placeholder="0.00"
            />
            {(validationErrors.uponDelivery || validationErrors.payment) && (
              <small className="error-text">
                {validationErrors.uponDelivery || validationErrors.payment}
              </small>
            )}
          </div>
        )}
      </div>
      {/* Parties */}
      <div className="party-section">
        <div className="party-card">
          <h3>{t('supplier')}</h3>
          <p>
            <strong>{supplier.businessName}</strong>
          </p>
          <p>{supplier.user.name}</p>
          <p>{supplier.city}</p>
          <p>{supplier.user.email}</p>
        </div>
        <div className="party-card">
          <h3>{t('buyer')}</h3>
          <p>
            <strong>{buyer.businessName}</strong>
          </p>
          <p>{buyer.name}</p>
          <p>{buyer.city}</p>
          <p>{buyer.email}</p>
        </div>
      </div>
      {/* Items Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>{t('items')}</h3>
          <div className="tooltip">
            <FiInfo />
            <span className="tooltip-text">{t('linkTooltip')}</span>
          </div>
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
              <th>{t('link')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 60);
                      setItems((prev) => {
                        const updated = [...prev];
                        updated[index].name = val;
                        return updated;
                      });
                    }}
                    placeholder={t('itemPlaceholder')}
                    className="input small"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 150);
                      setItems((prev) => {
                        const updated = [...prev];
                        updated[index].description = val;
                        return updated;
                      });
                    }}
                    placeholder={t('descPlaceholder')}
                    className="input small"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.agreedDetails}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 150);
                      setItems((prev) => {
                        const updated = [...prev];
                        updated[index].agreedDetails = val;
                        return updated;
                      });
                    }}
                    placeholder={t('detailsPlaceholder')}
                    className="input small"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setItems((prev) => {
                        const updated = [...prev];
                        updated[index].quantity = val;
                        updated[index].totalPrice =
                          val * updated[index].unitPrice;
                        return updated;
                      });
                    }}
                    min="1"
                    className="input small"
                    disabled={item.linkedItem?.type === 'service'}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setItems((prev) => {
                        const updated = [...prev];
                        updated[index].unitPrice = val;
                        updated[index].totalPrice =
                          updated[index].quantity * val;
                        return updated;
                      });
                    }}
                    min="0.01"
                    step="0.01"
                    className="input small"
                  />
                </td>
                <td className="total-cell">{item.totalPrice.toFixed(2)}</td>
                <td>
                  {item.linkedItem ? (
                    <div className="linked-icon">
                      <FiCheck />
                      <div className="linked-tooltip">
                        <img src={item.linkedItem.img} alt="" />
                        <span>{item.linkedItem.name}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="link-btn"
                      onClick={() => handleLinkClick(index)}
                      disabled={index === items.length - 1}
                    >
                      <FiLink />
                    </button>
                  )}
                </td>
                <td>
                  {index < items.length - 1 && (
                    <div className="action-buttons">
                      {item.linkedItem && (
                        <button
                          className="unlink-btn"
                          onClick={() => handleUnlink(index)}
                          title={t('unlink')}
                        >
                          <FiLink2 />
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteRow(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {validationErrors.items && (
          <div className="error-text table-error">{validationErrors.items}</div>
        )}
        <div className="total-summary">
          <strong>
            {t('total')}: {totalItemsPrice.toFixed(2)} SAR
          </strong>
        </div>
      </div>
      {/* Notes */}
      <div className="notes-section">
        <label>{t('notesAndTerms')}</label>
        <textarea
          value={notesAndTerms}
          onChange={(e) => setNotesAndTerms(e.target.value.slice(0, 500))}
          placeholder={t('notesPlaceholder')}
          rows="4"
          className={`textarea ${validationErrors.notes ? 'error' : ''}`}
        />
        <small className={validationErrors.notes ? 'error-text' : ''}>
          {notesAndTerms.length}/500
        </small>
      </div>
      {/* Submit */}
      <div className="submit-wrapper">
        <button
          className="create-btn"
          onClick={handleCreateInvoice}
          disabled={!isFormValid}
        >
          {t('createInvoice')}
        </button>
        {!isFormValid && (
          <div className="create-btn-tooltip">
            {Object.values(errors).map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        )}
      </div>
      {/* Link Modal */}
      {showLinkModal && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('selectListing')}</h3>
              <button onClick={() => setShowLinkModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="listings-toolbar">
              <div className="search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={listingsSearch}
                  onChange={(e) => setListingsSearch(e.target.value)}
                />
              </div>
              <div className="filters">
                {['all', 'products', 'services'].map((f) => (
                  <label
                    key={f}
                    className={`filter ${listingsFilter === f ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      checked={listingsFilter === f}
                      onChange={() => setListingsFilter(f)}
                    />
                    {t(`filters.${f}`)}
                  </label>
                ))}
              </div>
            </div>

            <div className="listings-table-container">
              {filteredListings.length === 0 ? (
                <div className="empty-modal">
                  {listings.length === 0
                    ? t('noPublishedListings')
                    : t('noResultsFound')}
                </div>
              ) : (
                <table className="listings-table">
                  <thead>
                    <tr>
                      <th>{t('image')}</th>
                      <th>{t('name')}</th>
                      <th>{t('price')}</th>
                      <th>{t('stock')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((listing) => (
                      <tr
                        key={listing.id}
                        onClick={() => handleLinkSelect(listing)}
                        className="clickable"
                      >
                        <td>
                          <div className="thumb">
                            <img src={listing.img} alt="" />
                          </div>
                        </td>
                        <td>
                          <div className="name-cell">
                            <span className="tag">
                              {t(`type.${listing.type}`)}
                            </span>
                            <span>{listing.name}</span>
                          </div>
                        </td>
                        <td>{listing.price.toFixed(2)}</td>
                        <td>{listing.stock !== null ? listing.stock : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInvoice;
