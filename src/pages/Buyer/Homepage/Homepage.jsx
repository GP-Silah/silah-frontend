import React, { useEffect, useRef, useState } from 'react';
import ItemCard from '@/components/ItemCard/ItemCard';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './Homepage.css';

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
    return isRTL ? scrollWidth - clientWidth - scrollLeft : scrollLeft;
  };

  const canGoBack = (ref) => getScrollStart(ref) > 50;
  const canGoForward = (ref) => {
    if (!ref.current) return false;
    const max = ref.current.scrollWidth - ref.current.clientWidth;
    return max > 10 && getScrollStart(ref) < max - 10;
  };

  const scrollCarousel = (ref, direction) => {
    if (!ref.current) return;
    const scrollAmount = 320;
    const { scrollWidth, clientWidth, scrollLeft } = ref.current;
    const maxScroll = scrollWidth - clientWidth;

    let targetScroll;
    if (direction === 'right') {
      targetScroll = isRTL
        ? Math.max(scrollLeft - scrollAmount, 0)
        : Math.min(scrollLeft + scrollAmount, maxScroll);
    } else {
      targetScroll = isRTL
        ? Math.min(scrollLeft + scrollAmount, maxScroll)
        : Math.max(scrollLeft - scrollAmount, 0);
    }

    ref.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  // === SMART SEARCH ===
  const handleSmartSearch = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/alternatives?text=${encodeURIComponent(searchText.trim())}`);
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
  });

  return (
    <div className="homepage-container" dir={i18n.dir()}>
      {/* Welcome */}
      <h1 className="welcome-title">
        {t('welcome')} <span className="user-name">{userName}</span>
      </h1>

      {/* === PRODUCTS === */}
      <section className="section-outer">
        <h2 className="section-title">{t('productsTitle')}</h2>
        <div className="section full-width">
          {loading ? (
            <p className="text-center py-8">{t('loading', { ns: 'common' })}</p>
          ) : error ? (
            <p className="text-center py-8 text-red-600">{error}</p>
          ) : (
            <div className="carousel-wrapper">
              <div className="carousel" ref={productCarouselRef}>
                {products.length > 0 ? (
                  products.map((p) => (
                    <ItemCard
                      key={p.productId}
                      item={mapProduct(p)}
                      type="product"
                    />
                  ))
                ) : (
                  <p className="text-gray-500 pl-4">
                    {t('noItems', { ns: 'common' })}
                  </p>
                )}
              </div>

              {canGoBack(productCarouselRef) && (
                <button
                  className="carousel-arrow left"
                  onClick={() => scrollCarousel(productCarouselRef, 'left')}
                >
                  {isRTL ? (
                    <ChevronRight size={20} />
                  ) : (
                    <ChevronLeft size={20} />
                  )}
                </button>
              )}

              {canGoForward(productCarouselRef) && (
                <button
                  className="carousel-arrow right"
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
      <section className="section-outer">
        <h2 className="section-title">{t('servicesTitle')}</h2>
        <div className="section full-width">
          {loading ? (
            <p className="text-center py-8">{t('loading', { ns: 'common' })}</p>
          ) : error ? (
            <p className="text-center py-8 text-red-600">{error}</p>
          ) : (
            <div className="carousel-wrapper">
              <div className="carousel" ref={serviceCarouselRef}>
                {services.length > 0 ? (
                  services.map((s) => (
                    <ItemCard
                      key={s.serviceId}
                      item={mapService(s)}
                      type="service"
                    />
                  ))
                ) : (
                  <p className="text-gray-500 pl-4">
                    {t('noItems', { ns: 'common' })}
                  </p>
                )}
              </div>

              {canGoBack(serviceCarouselRef) && (
                <button
                  className="carousel-arrow left"
                  onClick={() => scrollCarousel(serviceCarouselRef, 'left')}
                >
                  {isRTL ? (
                    <ChevronRight size={20} />
                  ) : (
                    <ChevronLeft size={20} />
                  )}
                </button>
              )}

              {canGoForward(serviceCarouselRef) && (
                <button
                  className="carousel-arrow right"
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
      <section className="smart-search-section">
        <p className="smart-search-text">{t('smartSearch.text')}</p>
        <form
          onSubmit={handleSmartSearch}
          className="smart-search-input-wrapper"
        >
          <Search className="smart-search-icon" size={20} />
          <input
            type="text"
            placeholder={t('smartSearch.placeholder')}
            className="smart-search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </form>
      </section>
    </div>
  );
}
