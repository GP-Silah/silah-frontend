import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Heart, Star, MapPin, Clock, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import { useAuth } from '../../context/AuthContext';
import './ServiceDetails.css';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export default function ServiceDetails() {
  const { t, i18n } = useTranslation('serviceDetails');
  const { id } = useParams(); // :id
  const navigate = useNavigate();
  const { role } = useAuth();
  const isBuyer = role === 'buyer';

  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // --------------------------------------------------------------
  // 1. FETCH SERVICE
  // --------------------------------------------------------------
  const fetchService = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/services/${id}`, {
        params: { lang: i18n.language },
        withCredentials: true,
      });
      setService(res.data);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      setError(msg);
    }
  }, [id, i18n.language]);

  // --------------------------------------------------------------
  // 2. FETCH REVIEWS
  // --------------------------------------------------------------
  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/reviews/items/${id}`, {
        params: { lang: i18n.language },
        withCredentials: true,
      });
      setReviews(res.data);
    } catch (err) {
      console.error('Reviews error', err);
    }
  }, [id, i18n.language]);

  // --------------------------------------------------------------
  // 3. WISHLIST CHECK + TOGGLE
  // --------------------------------------------------------------
  const checkWishlist = async () => {
    if (!service?.serviceId) return;
    try {
      const res = await axios.get(`${API}/api/buyers/me/wishlist`, {
        withCredentials: true,
      });
      const inList = res.data.some(
        (e) =>
          e.itemType === 'SERVICE' &&
          e.service?.serviceId === service.serviceId,
      );
      setFavorited(inList);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!service?.serviceId) return;
    setFavLoading(true);
    try {
      const res = await axios.patch(
        `${API}/api/buyers/me/wishlist/${service.serviceId}`,
        {},
        { withCredentials: true },
      );
      const { isAdded } = res.data;
      setFavorited(isAdded);
      Swal.fire({
        icon: 'success',
        title: t('wishlist.successTitle'),
        text: t(isAdded ? 'wishlist.added' : 'wishlist.removed'),
        confirmButtonColor: '#476DAE',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('wishlist.errorTitle'),
        text: t('wishlist.errorText'),
      });
    } finally {
      setFavLoading(false);
    }
  };

  // --------------------------------------------------------------
  // 4. EFFECTS
  // --------------------------------------------------------------
  useEffect(() => {
    if (service?.name) {
      document.title = t('pageTitle', { name: service.name });
    } else {
      document.title = t('pageTitleFallback');
    }
  }, [service, t]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchService(), fetchReviews()]);
      setLoading(false);
    })();
  }, [fetchService, fetchReviews]);

  useEffect(() => {
    if (service) checkWishlist();
  }, [service]);

  // --------------------------------------------------------------
  // 5. OPEN CHAT
  // --------------------------------------------------------------
  const openChat = () => {
    if (!service?.supplier?.user?.userId) return;
    const partner = {
      userId: service.supplier.user.userId,
      name: service.supplier.user.businessName || service.supplier.user.name,
      avatar: service.supplier.user.pfpUrl,
      categories: service.supplier.user.categories || [],
    };
    navigate(`/buyer/chats/new?with=${partner.userId}`, { state: { partner } });
  };

  // --------------------------------------------------------------
  // 6. RENDER
  // --------------------------------------------------------------
  if (loading) return <div className="sd-loading">{t('loading')}</div>;
  if (error) return <div className="sd-error">{error}</div>;
  if (!service) return null;

  const {
    name,
    description,
    price,
    isPriceNegotiable,
    serviceAvailability,
    imagesFilesUrls = [],
    avgRating = 0,
    ratingsCount = 0,
    supplier,
  } = service;

  const supplierName =
    supplier?.user?.businessName || supplier?.user?.name || '';
  const supplierCity = supplier?.user?.city || '';
  const supplierAvatar = supplier?.user?.pfpUrl || '';
  const supplierId = supplier?.supplierId;

  const heroImg = imagesFilesUrls[0] || '/placeholder-service.jpg';
  const thumb1 = imagesFilesUrls[1] || null;
  const thumb2 = imagesFilesUrls[2] || null;

  return (
    <div className="service-details" data-dir={dir}>
      {/* ---------- SUPPLIER BAR ---------- */}
      <div
        className="sd-supplier-bar"
        onClick={() =>
          supplierId && navigate(`/suppliers/storefront/${supplierId}`)
        }
      >
        <img
          src={supplierAvatar || '/avatar-placeholder.png'}
          alt={supplierName}
          className="sd-sup-avatar"
        />
        <div className="sd-sup-info">
          <h2 className="sd-sup-name">{supplierName}</h2>
          <div className="sd-sup-rating">
            <Star fill="#facc15" stroke="#facc15" size={18} />
            <span>
              {supplier?.avgRating?.toFixed(1) ?? '—'} (
              {supplier?.ratingsCount ?? 0})
            </span>
          </div>
          <div className="sd-sup-city">
            <MapPin size={16} />
            {supplierCity}
          </div>
        </div>
      </div>

      {/* ---------- HERO SECTION (pink bg) ---------- */}
      <section className="sd-hero" style={{ backgroundColor: '#FAF7FC' }}>
        <div className="sd-hero-images">
          <img src={heroImg} alt={name} className="sd-hero-main" />
          {(thumb1 || thumb2) && (
            <div className="sd-hero-thumbs">
              {thumb1 && <img src={thumb1} alt="" className="sd-thumb" />}
              {thumb2 && <img src={thumb2} alt="" className="sd-thumb" />}
            </div>
          )}
        </div>

        <div className="sd-hero-content">
          <div className="sd-title-row">
            <h1 className="sd-title">{name}</h1>
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className="sd-heart-btn"
            >
              <Heart
                fill={favorited ? '#ef4444' : 'none'}
                stroke="#ef4444"
                size={28}
              />
            </button>
          </div>

          <div className="sd-rating">
            <Star fill="#facc15" stroke="#facc15" size={20} />
            <span>
              {avgRating.toFixed(1)} ({ratingsCount})
            </span>
          </div>

          <div className="sd-price-row">
            <span className="sd-price">
              {price} <img src="/riyal.png" alt="SAR" className="sd-currency" />
            </span>
            {isPriceNegotiable && (
              <span className="sd-negotiable">{t('negotiable')}</span>
            )}
          </div>

          {isPriceNegotiable && (
            <p className="sd-negotiate-hint">{t('contactToNegotiate')}</p>
          )}

          <div className="sd-availability">
            <Clock size={18} />
            {t(`availability.${serviceAvailability}`)}
          </div>

          {/* Request Button – will be hidden/disabled for guests */}
          {isBuyer ? (
            <button onClick={openChat} className="sd-request-btn">
              <MessageCircle size={20} />
              {t('requestService', { name: supplierName.split(' ')[0] })}
            </button>
          ) : (
            <button
              disabled
              className="sd-request-btn"
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              <MessageCircle size={20} />
              {t('loginToRequest')}
            </button>
          )}
        </div>
      </section>

      {/* ---------- DESCRIPTION ---------- */}
      <section className="sd-description">
        <h2>{t('descriptionTitle')}</h2>
        <p>{description}</p>
      </section>

      {/* ---------- REVIEWS ---------- */}
      <section className="sd-reviews">
        <h2>{t('reviewsTitle')}</h2>
        {reviews.length === 0 ? (
          <p className="sd-no-reviews">{t('noReviews')}</p>
        ) : (
          <div className="sd-reviews-grid">
            {reviews.map((r) => (
              <ReviewCard key={r.itemReviewId} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
