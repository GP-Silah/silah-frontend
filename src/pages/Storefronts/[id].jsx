// src/pages/SupplierStorefront.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Star, MapPin, MessageCircle, AlertCircle } from 'lucide-react';
import ItemCard from '../../components/ItemCard/ItemCard';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import { useAuth } from '../../context/AuthContext';
import './SupplierStorefront.css';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';
const PLACEHOLD_BANNER = 'https://placehold.co/300x200?text=No+Image';
const PLACEHOLD_PFP = 'https://placehold.co/300x200?text=No+Image';

export default function SupplierStorefront() {
  const { t, i18n } = useTranslation('supplierStorefront');
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isBuyer = role === 'buyer';
  const isRTL = i18n.language === 'ar';

  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  // ——————————————————————— FETCH SUPPLIER ———————————————————————
  const fetchSupplier = useCallback(async () => {
    if (!id) throw new Error(t('errors.noId'));
    const res = await axios.get(`${API}/api/suppliers/${id}`, {
      params: { lang: i18n.language },
      withCredentials: true,
    });
    return res.data;
  }, [id, i18n.language, t]);

  // ——————————————————————— FETCH PRODUCTS ———————————————————————
  const fetchProducts = async (supplierId) => {
    const res = await axios.get(`${API}/api/products/supplier/${supplierId}`, {
      params: { lang: i18n.language },
      withCredentials: true,
    });
    return res.data.map((p) => ({
      ...p,
      _id: p.productId,
      type: 'product',
    }));
  };

  // ——————————————————————— FETCH SERVICES ———————————————————————
  const fetchServices = async (supplierId) => {
    const res = await axios.get(`${API}/api/services/supplier/${supplierId}`, {
      params: { lang: i18n.language },
      withCredentials: true,
    });
    return res.data.map((s) => ({
      ...s,
      _id: s.serviceId,
      type: 'service',
    }));
  };

  // ——————————————————————— FETCH REVIEWS ———————————————————————
  const fetchReviews = async (supplierId) => {
    const res = await axios.get(`${API}/api/reviews/suppliers/${supplierId}`, {
      params: { lang: i18n.language },
      withCredentials: true,
    });
    return res.data.map((r) => ({
      reviewId: r.reviewId,
      buyerName: r.supplier?.user?.name || 'Unknown',
      supplierRating: r.supplierRating,
      writtenReviewOfSupplier: r.writtenReviewOfSupplier,
      createdAt: r.createdAt,
    }));
  };

  // ——————————————————————— OPEN CHAT (SAFE) ———————————————————————
  const openChat = async () => {
    if (!supplier?.user?.userId) return;

    const partner = {
      userId: supplier.user.userId,
      name: supplier.businessName || supplier.user.name,
      avatar: supplier.user.pfpUrl || PLACEHOLD_PFP,
      categories: supplier.user.categories || [],
    };

    try {
      // 1. Fetch all chats
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chats/me`,
        {
          withCredentials: true,
        },
      );

      const chats = res.data || [];

      // 2. Find existing chat with this supplier
      const existingChat = chats.find(
        (chat) => chat.otherUser?.userId === partner.userId,
      );

      // 3. Navigate correctly
      if (existingChat) {
        navigate(`/buyer/chats/${existingChat.chatId}`);
      } else {
        navigate(`/buyer/chats/new?with=${partner.userId}`, {
          state: { partner },
        });
      }
    } catch (err) {
      console.error('Failed to check chat history:', err);
      // Fallback: go to new chat (safe)
      navigate(`/buyer/chats/new?with=${partner.userId}`, {
        state: { partner },
      });
    }
  };

  // ——————————————————————— ACTIVE STORE CONTENT (SAFE) ———————————————————————
  function ActiveStorefrontContent() {
    const user = supplier.user || {};
    const pfpUrl = user.pfpUrl || PLACEHOLD_PFP;
    const displayName =
      supplier.businessName ||
      user.name ||
      supplier.supplierName ||
      'Unknown Store';
    const city = supplier.city || '—';
    const bio = supplier.storeBio || t('description');
    const bannerUrl = supplier.storeBannerFileUrl || PLACEHOLD_BANNER;

    return (
      <>
        {/* Banner */}
        <div className="ss-banner">
          <img src={bannerUrl} alt="Store banner" className="ss-banner-img" />
        </div>

        {/* Supplier Info */}
        <div className="ss-supplier-info">
          <img src={pfpUrl} alt={displayName} className="ss-logo" />
          <div className="ss-info">
            <div className="ss-name-row">
              <h1 className="ss-supplier-name">{displayName}</h1>
              {supplier.storeStatus === 'OPEN' && isBuyer && (
                <button onClick={openChat} className="ss-chat-btn">
                  <MessageCircle size={20} />
                </button>
              )}
            </div>
            <div className="ss-rating">
              <Star fill="#facc15" stroke="#facc15" size={18} />
              <span className="ss-rating-text">
                {supplier.avgRating?.toFixed(1) || '0.0'} (
                {supplier.ratingsCount || 0})
              </span>
            </div>
            <div className="ss-location">
              <MapPin size={16} />
              {city}
            </div>
            <p className="ss-bio">{bio}</p>
          </div>
        </div>

        {/* Listings */}
        <section className="ss-listings-section">
          <div className="ss-filter-layout">
            <aside className="ss-filter-sidebar">
              <button
                onClick={() => handleFilter('all')}
                className={`ss-filter-btn ${filter === 'all' ? 'active' : ''}`}
              >
                <span className="ss-count">
                  {counts.total} {t('filter.all')}
                </span>
              </button>
              <button
                onClick={() => handleFilter('product')}
                className={`ss-filter-btn ${
                  filter === 'product' ? 'active' : ''
                }`}
              >
                <span className="ss-count">
                  {counts.products} {t('filter.products')}
                </span>
              </button>
              <button
                onClick={() => handleFilter('service')}
                className={`ss-filter-btn ${
                  filter === 'service' ? 'active' : ''
                }`}
              >
                <span className="ss-count">
                  {counts.services} {t('filter.services')}
                </span>
              </button>
            </aside>

            <div className="ss-filter-grid">
              {filteredItems.length === 0 ? (
                <p className="ss-no-items">{t('noItems')}</p>
              ) : (
                filteredItems.map((item) => (
                  <ItemCard key={item._id} type={item.type} item={item} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="ss-reviews-section">
          <h2>{t('reviewsTitle')}</h2>
          {reviews.length === 0 ? (
            <p className="ss-no-reviews">{t('noReviews')}</p>
          ) : (
            <div className="ss-reviews-grid">
              {reviews.map((review) => (
                <ReviewCard key={review.reviewId} review={review} />
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  // ——————————————————————— MAIN FETCH ———————————————————————
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error(t('errors.noId'));
        const sup = await fetchSupplier();
        const [prods, servs, revs] = await Promise.all([
          fetchProducts(sup.supplierId),
          fetchServices(sup.supplierId),
          fetchReviews(sup.supplierId),
        ]);
        setSupplier(sup);
        setProducts(prods);
        setServices(servs);
        setReviews(revs);
        document.title = t('pageTitle', { businessName: sup.businessName });
      } catch (err) {
        const msg =
          err.response?.data?.error?.message ||
          err.message ||
          t('errors.generic');
        setError(msg);
        document.title = t('pageTitleFallback');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, i18n.language, t]);

  // ——————————————————————— FILTER LOGIC ———————————————————————
  const allItems = useMemo(
    () => [...products, ...services],
    [products, services],
  );
  const counts = useMemo(
    () => ({
      total: allItems.length,
      products: products.length,
      services: services.length,
    }),
    [allItems, products, services],
  );
  const filteredItems = useMemo(() => {
    if (filter === 'all') return allItems;
    return allItems.filter((item) => item.type === filter);
  }, [allItems, filter]);
  const handleFilter = (type) => setFilter(type);

  // ——————————————————————— LOADING / ERROR ———————————————————————
  if (loading) {
    return (
      <div className="ss-loading">
        <div className="ss-spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ss-error">
        <AlertCircle size={48} />
        <h2>{t('errors.title')}</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!supplier) return null;

  // ——————————————————————— CLOSED STORE ———————————————————————
  if (supplier.storeStatus === 'CLOSED') {
    return (
      <div className="ss-blurred">
        <div className="ss-blur-overlay">
          <div className="ss-blur-message">
            <AlertCircle size={48} color="#dc2626" />
            <h3 style={{ color: '#dc2626' }}>{t('status.closed.title')}</h3>
            <p>{supplier.storeClosedMsg || t('status.closed.default')}</p>
            <button onClick={() => navigate(-1)} className="ss-btn">
              {t('status.closed.back')}
            </button>
          </div>
        </div>

        {/* Make the content still visible but blurred */}
        <div className="ss-blurred-content">
          <ActiveStorefrontContent />
        </div>
      </div>
    );
  }

  // ——————————————————————— INACTIVE SUPPLIER (BLURRED) ———————————————————————
  const isInactive =
    supplier.supplierStatus === 'INACTIVE' ||
    supplier.storeStatus === 'INACTIVE';

  if (isInactive) {
    return (
      <div className="ss-blurred">
        <div className="ss-blur-overlay">
          <div className="ss-blur-message">
            <AlertCircle size={48} />
            <h3>{t('status.inactive.title')}</h3>
            <p>{t('status.inactive.message')}</p>
            <button onClick={() => navigate(-1)} className="ss-btn">
              {t('status.closed.back')}
            </button>
          </div>
        </div>
        <div className="ss-blurred-content">
          <ActiveStorefrontContent />
        </div>
      </div>
    );
  }

  // ——————————————————————— ACTIVE SUPPLIER ———————————————————————
  return (
    <div className="ss-storefront" data-dir={isRTL ? 'rtl' : 'ltr'}>
      <ActiveStorefrontContent />
    </div>
  );
}
