import React, { useEffect, useRef, useState } from 'react';
import ItemCard from '@/components/ItemCard/ItemCard';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import styles from './Homepage.module.css'; // ← فقط غيرت هذا السطر

export default function Homepage() {
  const { t, i18n } = useTranslation('homepage');
  const isRTL = i18n.dir() === 'rtl';
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user.name;
  const productCarouselRef = useRef(null);
  const serviceCarouselRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const [canScrollBackService, setCanScrollBackService] = useState(false);
  const [canScrollForwardService, setCanScrollForwardService] = useState(false);

  // === FETCH PRODUCTS & SERVICES ===
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const lang = i18n.language === 'ar' ? 'ar' : 'en';
        const [prodRes, servRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`, {
            headers: { 'accept-language': lang },
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/services`, {
            headers: { 'accept-language': lang },
            withCredentials: true,
          }),
        ]);
        setProducts(prodRes.data || []);
        setServices(servRes.data || []);
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        setError(msg);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [i18n.language]);

  // === PAGE TITLE ===
  useEffect(() => {
    document.title = t('pageTitle');
  }, [t, i18n.language]);

  // === RESET SCROLL ON LOAD ===
  useEffect(() => {
    if (productCarouselRef.current) productCarouselRef.current.scrollLeft = 0;
    if (serviceCarouselRef.current) serviceCarouselRef.current.scrollLeft = 0;
  }, []);

  // === RTL-AWARE SCROLL LOGIC ===
  const getScrollStart = (ref) => {
    if (!ref.current) return 0;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    return isRTL ? Math.abs(scrollLeft) : scrollLeft;
  };
  const canGoBack = (ref) => {
    if (!ref.current) return false;
    const start = getScrollStart(ref);
    return start > 50;
  };
  const canGoForward = (ref) => {
    if (!ref.current) return false;
    const { scrollWidth, clientWidth } = ref.current;
    const max = scrollWidth - clientWidth;
    const start = getScrollStart(ref);
    return max > 10 && start < max - 10;
  };
  const scrollCarousel = (ref, direction) => {
    if (!ref.current) return;
    const firstCard = ref.current.querySelector('.item-card-wrapper');
    const cardWidth = firstCard?.offsetWidth || 280;
    const gap = parseFloat(getComputedStyle(ref.current).gap) || 24;
    const scrollAmount = cardWidth + gap;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    let targetScroll;
    if (direction === 'right') {
      targetScroll = isRTL
        ? scrollLeft + scrollAmount * -1
        : scrollLeft + scrollAmount;
    } else {
      targetScroll = isRTL
        ? scrollLeft - scrollAmount * -1
        : scrollLeft - scrollAmount;
    }
    ref.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  // === UPDATE ARROWS FOR PRODUCTS ===
  useEffect(() => {
    const updateArrows = () => {
      setCanScrollBack(canGoBack(productCarouselRef));
      setCanScrollForward(canGoForward(productCarouselRef));
    };
    updateArrows();
    const carousel = productCarouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateArrows);
      return () => carousel.removeEventListener('scroll', updateArrows);
    }
  }, [products]);

  useEffect(() => {
    setTimeout(() => {
      setCanScrollBack(canGoBack(productCarouselRef));
      setCanScrollForward(canGoForward(productCarouselRef));
    }, 50);
  }, [isRTL]);

  // === SAME FOR SERVICES ===
  useEffect(() => {
    const updateArrows = () => {
      setCanScrollBackService(canGoBack(serviceCarouselRef));
      setCanScrollForwardService(canGoForward(serviceCarouselRef));
    };
    updateArrows();
    const carousel = serviceCarouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateArrows);
      return () => carousel.removeEventListener('scroll', updateArrows);
    }
  }, [services]);

  useEffect(() => {
    setTimeout(() => {
      setCanScrollBackService(canGoBack(serviceCarouselRef));
      setCanScrollForwardService(canGoForward(serviceCarouselRef));
    }, 50);
  }, [isRTL]);

  // === SMART SEARCH ===
  const handleSmartSearch = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(
        `/buyer/alternatives?text=${encodeURIComponent(searchText.trim())}`,
      );
    }
  };

  // === MAP API → ITEMCARD PROPS ===
  const mapProduct = (p) => ({
    _id: p.productId,
    name: p.name,
    supplier: {
      businessName: p.supplier?.businessName || 'Unknown',
      supplierId: p.supplierId,
    },
    imagesFilesUrls: p.imagesFilesUrls || [],
    avgRating: p.avgRating || 0,
    ratingsCount: p.ratingsCount || 0,
    price: p.price || 0,
    type: 'product',
    isAvailable: p.stock > 0,
  });
  const mapService = (s) => ({
    _id: s.serviceId,
    name: s.name,
    supplier: {
      businessName: s.supplier?.businessName || 'Unknown',
      supplierId: s.supplierId,
    },
    imagesFilesUrls: s.imagesFilesUrls || [],
    avgRating: s.avgRating || 0,
    ratingsCount: s.ratingsCount || 0,
    price: s.price || 0,
    isPriceNegotiable: s.isPriceNegotiable || false,
    type: 'service',
    isAvailable: true,
  });

  return (
    <div className={styles['homepage-container']} dir={i18n.dir()}>
      {/* Welcome */}
      <h1 className={styles['welcome-title']}>
        {t('welcome')} <span className={styles['user-name']}>{userName}</span>
      </h1>

      {/* === PRODUCTS === */}
      <section className={styles['section-outer']}>
        <h2 className={styles['section-title']}>{t('productsTitle')}</h2>
        <div className={`${styles.section} ${styles['full-width']}`}>
          {loading ? (
            <p className="text-center py-8">{t('loading', { ns: 'common' })}</p>
          ) : error ? (
            <p className="text-center py-8 text-red-600">{error}</p>
          ) : (
            <div className={styles['carousel-wrapper']}>
              <div className={styles.carousel} ref={productCarouselRef}>
                {products.length > 0 ? (
                  products.map((p) => (
                    <div
                      className={styles['item-card-wrapper']}
                      key={p.productId}
                    >
                      <ItemCard
                        item={mapProduct(p)}
                        type="product"
                        isAvailable={mapProduct(p).isAvailable}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 pl-4">
                    {t('noItems', { ns: 'common' })}
                  </p>
                )}
              </div>

              {canScrollBack && (
                <button
                  className={`${styles['carousel-arrow']} ${styles.left}`}
                  onClick={() => scrollCarousel(productCarouselRef, 'left')}
                >
                  {isRTL ? (
                    <ChevronRight size={20} />
                  ) : (
                    <ChevronLeft size={20} />
                  )}
                </button>
              )}
              {canScrollForward && (
                <button
                  className={`${styles['carousel-arrow']} ${styles.right}`}
                  onClick={() => scrollCarousel(productCarouselRef, 'right')}
                >
                  {isRTL ? (
                    <ChevronLeft size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* === SERVICES === */}
      <section className={styles['section-outer']}>
        <h2 className={styles['section-title']}>{t('servicesTitle')}</h2>
        <div className={`${styles.section} ${styles['full-width']}`}>
          {loading ? (
            <p className="text-center py-8">{t('loading', { ns: 'common' })}</p>
          ) : error ? (
            <p className="text-center py-8 text-red-600">{error}</p>
          ) : (
            <div className={styles['carousel-wrapper']}>
              <div className={styles.carousel} ref={serviceCarouselRef}>
                {services.length > 0 ? (
                  services.map((s) => (
                    <div
                      className={styles['item-card-wrapper']}
                      key={s.serviceId}
                    >
                      <ItemCard item={mapService(s)} type="service" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 pl-4">
                    {t('noItems', { ns: 'common' })}
                  </p>
                )}
              </div>

              {canScrollBackService && (
                <button
                  className={`${styles['carousel-arrow']} ${styles.left}`}
                  onClick={() => scrollCarousel(serviceCarouselRef, 'left')}
                >
                  {isRTL ? (
                    <ChevronRight size={20} />
                  ) : (
                    <ChevronLeft size={20} />
                  )}
                </button>
              )}
              {canScrollForwardService && (
                <button
                  className={`${styles['carousel-arrow']} ${styles.right}`}
                  onClick={() => scrollCarousel(serviceCarouselRef, 'right')}
                >
                  {isRTL ? (
                    <ChevronLeft size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* === SMART SEARCH === */}
      <section className={styles['smart-search-section']}>
        <p className={styles['smart-search-text']}>{t('smartSearch.text')}</p>
        <form
          onSubmit={handleSmartSearch}
          className={styles['smart-search-input-wrapper']}
        >
          <Search className={styles['smart-search-icon']} size={20} />
          <input
            type="text"
            placeholder={t('smartSearch.placeholder')}
            className={styles['smart-search-input']}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </form>
      </section>
    </div>
  );
}
