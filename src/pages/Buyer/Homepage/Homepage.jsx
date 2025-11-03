import React, { useEffect, useRef, useState } from 'react';
import ItemCard from '@/components/ItemCard/ItemCard';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import './Homepage.css';

export default function Homepage() {
  const { t, i18n } = useTranslation('homepage');
  const isRTL = i18n.dir() === 'rtl';
  const userName = 'Saad';

  const productCarouselRef = useRef(null);
  const serviceCarouselRef = useRef(null);

  const [productScroll, setProductScroll] = useState(0);
  const [serviceScroll, setServiceScroll] = useState(0);

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t, i18n.language]);

  // Fake Data
  const fakeProducts = [
    {
      _id: 1,
      name: 'Flat Beige Plate',
      supplier: { businessName: 'Ama Amazing Co.', supplierId: 's1' },
      imagesFilesUrls: [''],
      avgRating: 4.8,
      ratingsCount: 45,
      price: 150,
      type: 'product',
    },
    {
      _id: 2,
      name: 'Luxury Perfume',
      supplier: { businessName: 'Ama Amazing Co.', supplierId: 's2' },
      imagesFilesUrls: [''],
      avgRating: 4.8,
      ratingsCount: 150,
      price: 320,
      type: 'product',
    },
    {
      _id: 3,
      name: 'High Quality Beans',
      supplier: { businessName: 'Ama Amazing Co.', supplierId: 's3' },
      imagesFilesUrls: [''],
      avgRating: 4.8,
      ratingsCount: 120,
      price: 80,
      type: 'product',
    },
    {
      _id: 4,
      name: 'Eyeliner Shadow',
      supplier: { businessName: 'Ama Amazing Co.', supplierId: 's4' },
      imagesFilesUrls: [''],
      avgRating: 4.8,
      ratingsCount: 70,
      price: 95,
      type: 'product',
    },
    {
      _id: 5,
      name: 'Dropper Bottle',
      supplier: { businessName: 'Ama Amazing Co.', supplierId: 's5' },
      imagesFilesUrls: [''],
      avgRating: 4.8,
      ratingsCount: 25,
      price: 60,
      type: 'product',
    },
  ];

  const fakeServices = [
    {
      _id: 6,
      name: 'UI/UX Design',
      supplier: { businessName: 'Ama Amazing Co.', supplierId: 's6' },
      imagesFilesUrls: [''],
      avgRating: 4.8,
      ratingsCount: 300,
      price: 750,
      isPriceNegotiable: true,
      type: 'service',
    },
    {
      _id: 7,
      name: 'Card Design',
      supplier: { businessName: 'Ama Amazing Co.', supplierId: 's7' },
      imagesFilesUrls: [''],
      avgRating: 4.8,
      ratingsCount: 150,
      price: 150,
      isPriceNegotiable: false,
      type: 'service',
    },
    {
      _id: 8,
      name: 'Product Design',
      supplier: { businessName: 'Ama Amazing Co.', supplierId: 's8' },
      imagesFilesUrls: [''],
      avgRating: 4.8,
      ratingsCount: 750,
      price: 1200,
      isPriceNegotiable: true,
      type: 'service',
    },
    {
      _id: 9,
      name: 'Phone Repair',
      supplier: { businessName: 'Ama Amazing Co.', supplierId: 's9' },
      imagesFilesUrls: [''],
      avgRating: 4.8,
      ratingsCount: 150,
      price: 200,
      isPriceNegotiable: true,
      type: 'service',
    },
    {
      _id: 10,
      name: 'House Repair',
      supplier: { businessName: 'Ama Amazing Co.', supplierId: 's10' },
      imagesFilesUrls: [''],
      avgRating: 4.8,
      ratingsCount: 50,
      price: 500,
      isPriceNegotiable: false,
      type: 'service',
    },
  ];

  // Scroll handler
  const scrollCarousel = (ref, direction, setScroll) => {
    if (!ref.current) return;
    const scrollAmount = 320;
    const maxScroll = ref.current.scrollWidth - ref.current.clientWidth;
    const current = ref.current.scrollLeft;

    let newScroll;
    if (direction === 'right') {
      newScroll = Math.min(current + scrollAmount, maxScroll);
    } else {
      newScroll = Math.max(current - scrollAmount, 0);
    }

    ref.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    setScroll(newScroll);
  };

  // Show arrows only if scrolled
  const canGoLeft = (scroll) => scroll > 50;
  const canGoRight = (ref, scroll) => {
    if (!ref.current) return false;
    const max = ref.current.scrollWidth - ref.current.clientWidth;
    return scroll < max - 50;
  };

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
          <div className="carousel-wrapper">
            <div
              className="carousel"
              ref={productCarouselRef}
              onScroll={(e) => setProductScroll(e.currentTarget.scrollLeft)}
            >
              {fakeProducts.map((item) => (
                <ItemCard key={item._id} item={item} type="product" />
              ))}
            </div>

            {/* Left Arrow */}
            {canGoLeft(productScroll) && (
              <button
                className="carousel-arrow left"
                onClick={() =>
                  scrollCarousel(productCarouselRef, 'left', setProductScroll)
                }
              >
                {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            )}

            {/* Right Arrow */}
            {canGoRight(productCarouselRef, productScroll) && (
              <button
                className="carousel-arrow right"
                onClick={() =>
                  scrollCarousel(productCarouselRef, 'right', setProductScroll)
                }
              >
                {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* === SERVICES === */}
      <section className="section-outer">
        <h2 className="section-title">{t('servicesTitle')}</h2>
        <div className="section full-width">
          <div className="carousel-wrapper">
            <div
              className="carousel"
              ref={serviceCarouselRef}
              onScroll={(e) => setServiceScroll(e.currentTarget.scrollLeft)}
            >
              {fakeServices.map((item) => (
                <ItemCard key={item._id} item={item} type="service" />
              ))}
            </div>

            {canGoLeft(serviceScroll) && (
              <button
                className="carousel-arrow left"
                onClick={() =>
                  scrollCarousel(serviceCarouselRef, 'left', setServiceScroll)
                }
              >
                {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            )}

            {canGoRight(serviceCarouselRef, serviceScroll) && (
              <button
                className="carousel-arrow right"
                onClick={() =>
                  scrollCarousel(serviceCarouselRef, 'right', setServiceScroll)
                }
              >
                {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Smart Search */}
      <section className="smart-search-section">
        <p className="smart-search-text">{t('smartSearch.text')}</p>
        <div className="smart-search-input-wrapper">
          <Search className="smart-search-icon" size={20} />
          <input
            type="text"
            placeholder={t('smartSearch.placeholder')}
            className="smart-search-input"
          />
        </div>
      </section>
    </div>
  );
}
