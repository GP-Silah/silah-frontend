import React, { useEffect } from 'react';
import './SupplierStorefront.css';
import { useTranslation } from 'react-i18next';

export default function SupplierStorefront() {
  const { t, i18n } = useTranslation('supplierstorefront');

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute(
      'dir',
      i18n.language === 'ar' ? 'rtl' : 'ltr',
    );
  }, [i18n.language, t]);

  const listings = [
    {
      name: 'Flat Beige Plate',
      type: 'Product',
      rating: 4.8,
      price: '45 ر.س / min',
    },
    {
      name: 'Luxury Perfume',
      type: 'Product',
      rating: 4.8,
      price: '150 ر.س / min',
    },
    {
      name: 'High Quality Beans',
      type: 'Product',
      rating: 4.8,
      price: '30 ر.س / min',
    },
    {
      name: 'Eyeliner Shadow',
      type: 'Product',
      rating: 4.8,
      price: '70 ر.س / min',
    },
    {
      name: 'Dropper Bottle',
      type: 'Product',
      rating: 4.8,
      price: '25 ر.س / min',
    },
    {
      name: 'UI/UX Design',
      type: 'Service',
      rating: 4.8,
      price: t('negotiable'),
    },
    { name: 'Card Design', type: 'Service', rating: 4.8, price: t('fixed') },
    {
      name: 'Product Design',
      type: 'Service',
      rating: 4.8,
      price: t('negotiable'),
    },
    {
      name: 'Phone Repair',
      type: 'Service',
      rating: 4.8,
      price: t('negotiable'),
    },
    { name: 'House Repair', type: 'Service', rating: 5.0, price: t('fixed') },
  ];

  const reviews = [
    {
      name: 'Amax',
      text: 'Fantastic experience! The product exceeded my expectations in quality and delivery time.',
      rating: 5,
    },
    {
      name: 'Amax',
      text: 'Great service and top-notch products! Shipping was quick, and everything arrived as described.',
      rating: 5,
    },
    {
      name: 'Amax',
      text: 'A great supplier! My customers LOVED the products! Truly reliable.',
      rating: 5,
    },
  ];

  return (
    <div className="supplier-storefront">
      {/* Header Banner */}
      <div className="banner">
        <img
          src="/images/sample-banner.jpg"
          alt="Supplier banner"
          className="banner-image"
        />
      </div>

      {/* Supplier Info */}
      <div className="supplier-info">
        <div className="logo-wrapper">
          <img src="/images/logo-placeholder.png" alt="Logo" className="logo" />
        </div>
        <div className="details">
          <h2 className="supplier-name">Ama Amazing Co.</h2>
          <p className="rating">⭐ 5.0 (3)</p>
          <p className="location">Riyadh, Saudi Arabia</p>
          <p className="description">{t('description')}</p>
        </div>
      </div>

      {/* Listings */}
      <section className="listings-section">
        <div className="listings-header">
          <h3>10 {t('listingsTitle')}</h3>
          <p>
            5 {t('products')} · 5 {t('services')}
          </p>
        </div>

        <div className="listings-grid">
          {listings.map((item, index) => (
            <div key={index} className="listing-card">
              <div className="image-box">
                <img src="/images/placeholder.png" alt={item.name} />
              </div>
              <h4>{item.name}</h4>
              <p className="meta">
                <span>⭐ {item.rating}</span> · <span>{item.price}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="reviews-section">
        <h3>{t('reviewsTitle')}</h3>
        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <div key={index} className="review-card">
              <h4>{review.name}</h4>
              <p className="stars">⭐ {review.rating}</p>
              <p className="text">{review.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
