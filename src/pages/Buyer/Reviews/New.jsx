import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star } from 'lucide-react';
import './WriteReview.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export default function WriteReview() {
  const { t, i18n } = useTranslation('writeReview');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');
  const isRtl = i18n.language === 'ar';

  // State
  const [data, setData] = useState(null);
  const [supplierRating, setSupplierRating] = useState(5); // DEFAULT 5
  const [supplierHover, setSupplierHover] = useState(0);
  const [supplierReview, setSupplierReview] = useState('');
  const [itemRatings, setItemRatings] = useState({}); // { itemId: { rating: 5, review: '' } }
  const [itemHovers, setItemHovers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Set page title & dir
  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [t, isRtl]);

  // Fetch data
  useEffect(() => {
    if (!id) {
      setError(t('errors.noId'));
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let res;
        try {
          res = await axios.get(`${API_BASE}/api/invoices/me/${id}`, {
            withCredentials: true,
          });
          if (res.data.type === 'PRE_INVOICE') {
            setError(t('errors.preInvoiceNotAllowed'));
            setLoading(false);
            return;
          }
          setData({ type: 'invoice', ...res.data });
        } catch (err) {
          res = await axios.get(`${API_BASE}/api/orders/${id}`, {
            withCredentials: true,
          });
          setData({ type: 'order', ...res.data });
        }

        // Initialize item ratings to 5
        const items = res.data.items || [];
        const initial = {};
        items.forEach((item) => {
          const itemId = item.orderItemId || item.invoiceItemId;
          initial[itemId] = { rating: 5, review: '' }; // DEFAULT 5
        });
        setItemRatings(initial);
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, t]);

  // Star Component
  const StarRating = ({ value, hover, onRate, onHover, onLeave }) => (
    <div className="wrb-stars">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        return (
          <Star
            key={i}
            size={28}
            className={`wrb-star ${
              starValue <= (hover || value) ? 'active' : ''
            }`}
            fill={starValue <= (hover || value) ? '#f5b301' : 'none'}
            stroke={starValue <= (hover || value) ? '#f5b301' : '#ddd'}
            onClick={() => onRate(starValue)}
            onMouseEnter={() => onHover(starValue)}
            onMouseLeave={() => onLeave(value)}
          />
        );
      })}
    </div>
  );

  // Submit
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        supplierRating,
        writtenReviewOfSupplier: supplierReview.trim() || undefined,
        itemsReview: Object.entries(itemRatings)
          .filter(([_, v]) => v.rating > 0)
          .map(([itemId, v]) => ({
            [data.type === 'order' ? 'orderItemId' : 'invoiceItemId']:
              Number(itemId),
            itemRating: v.rating,
            writtenReviewOfItem: v.review.trim() || undefined,
          })),
      };

      await axios.post(`${API_BASE}/api/reviews/${id}`, payload, {
        withCredentials: true,
      });
      navigate(-1);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="wrb-page">{t('common.loading')}…</div>;
  if (error)
    return (
      <div className="wrb-page" dir={isRtl ? 'rtl' : 'ltr'}>
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      </div>
    );

  const supplier = data.supplier;
  const items = data.items || [];
  const companyName = supplier.businessName || supplier.supplierName;
  const bannerUrl =
    supplier.storeBannerFileUrl || 'https://via.placeholder.com/900x200';
  const logoUrl = supplier.user.pfpUrl || 'https://via.placeholder.com/60';

  return (
    <div className="wrb-page" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* FULL WIDTH BANNER */}
      <div className="wrb-banner">
        <img src={bannerUrl} alt={companyName} className="wrb-banner-img" />
      </div>

      {/* LOGO + NAME (OVERLAP) */}
      <div className="wrb-header">
        <div className="wrb-company-wrapper">
          <img src={logoUrl} alt={companyName} className="wrb-logo" />
          <h2 className="wrb-company">{companyName}</h2>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="wrb-card">
        <h3 className="wrb-title">
          {t('mainTitle', { company: companyName })}
        </h3>

        {/* Supplier Review */}
        <div className="wrb-review-box">
          <StarRating
            value={supplierRating}
            hover={supplierHover}
            onRate={setSupplierRating}
            onHover={setSupplierHover}
            onLeave={setSupplierRating}
          />
          <textarea
            placeholder={t('optional')}
            className="wrb-textarea"
            value={supplierReview}
            onChange={(e) => setSupplierReview(e.target.value)}
            rows={3}
          />
        </div>

        {/* Items */}
        {items.length > 0 && (
          <>
            <h4 className="wrb-subtitle">
              {t('itemsTitle', { count: items.length })}
            </h4>
            <div className="wrb-items">
              {items.map((item) => {
                const itemId = item.orderItemId || item.invoiceItemId;
                const product = item.product || item.relatedProduct;
                const name = product?.name || item.name;
                const image =
                  product?.imagesFilesUrls?.[0] ||
                  item.imagesFilesUrls?.[0] ||
                  'https://via.placeholder.com/70';

                return (
                  <div key={itemId} className="wrb-item-card">
                    {/* ROW 1: Image + Name */}
                    <div className="wrb-item-header">
                      <img src={image} alt={name} className="wrb-item-img" />
                      <h5 className="wrb-item-name">{name}</h5>
                    </div>

                    {/* ROW 2: Stars */}
                    <div className="wrb-item-stars">
                      <StarRating
                        value={itemRatings[itemId]?.rating || 5}
                        hover={itemHovers[itemId] || 0}
                        onRate={(val) =>
                          setItemRatings((prev) => ({
                            ...prev,
                            [itemId]: { ...prev[itemId], rating: val },
                          }))
                        }
                        onHover={(val) =>
                          setItemHovers((prev) => ({ ...prev, [itemId]: val }))
                        }
                        onLeave={() =>
                          setItemHovers((prev) => ({ ...prev, [itemId]: 0 }))
                        }
                      />
                    </div>

                    {/* ROW 3: Textarea */}
                    <textarea
                      placeholder={t('optional')}
                      className="wrb-textarea wrb-item-textarea"
                      value={itemRatings[itemId]?.review || ''}
                      onChange={(e) =>
                        setItemRatings((prev) => ({
                          ...prev,
                          [itemId]: { ...prev[itemId], review: e.target.value },
                        }))
                      }
                      rows={2}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Submit */}
        <button
          className="wrb-submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? t('common.submitting') : t('submit')}
        </button>
      </div>
    </div>
  );
}
