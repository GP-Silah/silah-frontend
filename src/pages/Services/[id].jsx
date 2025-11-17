import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Heart,
  Star,
  MapPin,
  Clock,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import { useAuth } from '../../context/AuthContext';
import styles from './ServiceDetails.module.css';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export default function ServiceDetails() {
  const { t, i18n } = useTranslation('serviceDetails');
  const { id } = useParams();
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
  const reviewsCarouselRef = useRef(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  // Fetch Service
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

  // Fetch Reviews
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

  // Wishlist Check + Toggle
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

  // Page Title
  useEffect(() => {
    if (service?.name) {
      document.title = t('pageTitle', { name: service.name });
    } else {
      document.title = t('pageTitleFallback');
    }
  }, [service, t]);

  // Initial Data Load
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

  // Open Chat with Supplier
  const openChat = async () => {
    if (!service?.supplier?.user?.userId) return;
    const partner = {
      userId: service.supplier.user.userId,
      name: service.supplier.user.businessName || service.supplier.user.name,
      avatar: service.supplier.user.pfpUrl,
      categories: service.supplier.user.categories || [],
    };

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chats/me`,
        {
          withCredentials: true,
        },
      );
      const chats = res.data || [];
      const existingChat = chats.find(
        (chat) => chat.otherUser?.userId === partner.userId,
      );

      if (existingChat) {
        navigate(`/buyer/chats/${existingChat.chatId}`);
      } else {
        navigate(`/buyer/chats/new?with=${partner.userId}`, {
          state: { partner },
        });
      }
    } catch (err) {
      console.error('Failed to check chat history:', err);
      navigate(`/buyer/chats/new?with=${partner.userId}`, {
        state: { partner },
      });
    }
  };

  // RTL-Aware Carousel Scroll
  const scrollCarousel = (ref, direction) => {
    if (!ref.current) return;
    const firstCard =
      ref.current.querySelector(`.${styles['review-card-wrapper']}`) ||
      ref.current.children[0];
    const cardWidth = firstCard?.offsetWidth || 400;
    const gap = parseFloat(getComputedStyle(ref.current).gap) || 56;
    const scrollAmount = cardWidth + gap;
    const directionFactor = direction === 'right' ? 1 : -1;
    const rtlFactor = i18n.language === 'ar' ? -1 : 1;

    ref.current.scrollBy({
      left: scrollAmount * directionFactor * rtlFactor,
      behavior: 'smooth',
    });
  };

  const canGoBack = (ref) => {
    if (!ref.current) return false;
    const { scrollLeft } = ref.current;
    return i18n.language === 'ar' ? scrollLeft < -5 : scrollLeft > 5;
  };

  const canGoForward = (ref) => {
    if (!ref.current) return false;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    const maxScroll = scrollWidth - clientWidth;
    return i18n.language === 'ar'
      ? scrollLeft > -(maxScroll - 5)
      : scrollLeft < maxScroll - 5;
  };

  // Update Arrow Visibility
  useEffect(() => {
    const updateArrows = () => {
      setCanScrollBack(canGoBack(reviewsCarouselRef));
      setCanScrollForward(canGoForward(reviewsCarouselRef));
    };
    updateArrows();
    const carousel = reviewsCarouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateArrows);
      return () => carousel.removeEventListener('scroll', updateArrows);
    }
  }, [reviews, i18n.language]);

  // Reset scroll on reviews change
  useEffect(() => {
    if (reviewsCarouselRef.current) {
      reviewsCarouselRef.current.scrollLeft = 0;
    }
  }, [reviews]);

  // Loading / Error States
  if (loading)
    return <div className={styles['sd-loading']}>{t('loading')}</div>;
  if (error) return <div className={styles['sd-error']}>{error}</div>;
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
    <div className={styles['service-details']} data-dir={dir}>
      {/* SUPPLIER BAR */}
      <div
        className={styles['sd-supplier-bar']}
        onClick={() => supplierId && navigate(`/storefronts/${supplierId}`)}
      >
        <img
          src={supplierAvatar || '/avatar-placeholder.png'}
          alt={supplierName}
          className={styles['sd-sup-avatar']}
        />
        <div className={styles['sd-sup-info']}>
          <h2 className={styles['sd-sup-name']}>{supplierName}</h2>
          <div className={styles['sd-sup-rating']}>
            <Star fill="#facc15" stroke="#facc15" size={18} />
            <span>
              {supplier?.avgRating?.toFixed(1) ?? '—'} (
              {supplier?.ratingsCount ?? 0})
            </span>
          </div>
          <div className={styles['sd-sup-city']}>
            <MapPin size={16} />
            {supplierCity}
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section
        className={styles['sd-hero']}
        style={{ backgroundColor: '#FAF7FC' }}
      >
        <div className={styles['sd-hero-images']}>
          <img src={heroImg} alt={name} className={styles['sd-hero-main']} />
          {(thumb1 || thumb2) && (
            <div className={styles['sd-hero-thumbs']}>
              {thumb1 && (
                <img src={thumb1} alt="" className={styles['sd-thumb']} />
              )}
              {thumb2 && (
                <img src={thumb2} alt="" className={styles['sd-thumb']} />
              )}
            </div>
          )}
        </div>

        <div className={styles['sd-hero-content']}>
          <div className={styles['sd-title-row']}>
            <h1 className={styles['sd-title']}>{name}</h1>
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={styles['sd-heart-btn']}
            >
              <Heart
                fill={favorited ? '#ef4444' : 'none'}
                stroke="#ef4444"
                size={28}
              />
            </button>
          </div>

          <div className={styles['sd-rating']}>
            <Star fill="#facc15" stroke="#facc15" size={20} />
            <span>
              {avgRating.toFixed(1)} ({ratingsCount})
            </span>
          </div>

          <div className={styles['sd-price-row']}>
            <span className={styles['sd-price']}>
              {price}{' '}
              <img
                src="/riyal.png"
                alt="SAR"
                className={styles['sd-currency']}
              />
            </span>
            {isPriceNegotiable && (
              <span className={styles['sd-negotiable']}>{t('negotiable')}</span>
            )}
          </div>

          {isPriceNegotiable && (
            <p className={styles['sd-negotiate-hint']}>
              {t('contactToNegotiate')}
            </p>
          )}

          <div className={styles['sd-availability']}>
            <Clock size={18} />
            {t(`availability.${serviceAvailability}`)}
          </div>

          {isBuyer ? (
            <button onClick={openChat} className={styles['sd-request-btn']}>
              <MessageCircle size={20} />
              {t('requestService', { name: supplierName.split(' ')[0] })}
            </button>
          ) : (
            <button
              disabled
              className={styles['sd-request-btn']}
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              <MessageCircle size={20} />
              {t('loginToRequest')}
            </button>
          )}
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className={styles['sd-description']}>
        <h2>{t('descriptionTitle')}</h2>
        <p>{description}</p>
      </section>

      {/* REVIEWS */}
      <section className={styles['sd-reviews']}>
        <h2>{t('reviewsTitle')}</h2>
        {reviews.length === 0 ? (
          <p className={styles['sd-no-reviews']}>{t('noReviews')}</p>
        ) : (
          <div className={styles['carousel-wrapper']}>
            <div className={styles.carousel} ref={reviewsCarouselRef}>
              {reviews.map((r) => (
                <div
                  className={styles['review-card-wrapper']}
                  key={r.itemReviewId}
                >
                  <ReviewCard review={r} />
                </div>
              ))}
            </div>

            {canScrollBack && (
              <button
                className={`${styles['carousel-arrow']} ${styles.left}`}
                onClick={() => scrollCarousel(reviewsCarouselRef, 'left')}
              >
                {i18n.language === 'ar' ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </button>
            )}

            {canScrollForward && (
              <button
                className={`${styles['carousel-arrow']} ${styles.right}`}
                onClick={() => scrollCarousel(reviewsCarouselRef, 'right')}
              >
                {i18n.language === 'ar' ? (
                  <ChevronLeft size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
