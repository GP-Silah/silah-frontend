import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './WriteReview.css';

export default function WriteReview() {
  const { t, i18n } = useTranslation('writeReview');

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }, [i18n.language]);

  // بيانات تجريبية
  const company = {
    name: 'Ama Amazing Co.',
    image:
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80',
  };

  const reviews = [
    {
      product: 'Amber - 45ml Soy Candle',
      review:
        'Fantastic experience! The product exceeded my expectations in quality and delivery time.',
      stars: 5,
    },
    {
      product: 'Amber - 45ml Soy Candle',
      review: '',
      stars: 0,
    },
  ];

  const renderStars = (count) =>
    '★★★★★☆☆☆☆☆'
      .slice(5 - count, 10 - count)
      .split('')
      .slice(0, 5);

  return (
    <div className="wrb-page" data-dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="wrb-header">
        <img src={company.image} alt={company.name} className="wrb-cover" />
        <h2 className="wrb-company">{company.name}</h2>
      </div>

      <div className="wrb-card">
        <h3 className="wrb-title">
          {t('mainTitle', { company: company.name })}
        </h3>

        <div className="wrb-review-box">
          <div className="wrb-stars">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <span
                  key={index}
                  className={`wrb-star ${
                    starValue <= (hover || rating) ? 'active' : ''
                  }`}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHover(starValue)}
                  onMouseLeave={() => setHover(rating)}
                >
                  ★
                </span>
              );
            })}
          </div>

          <p className="wrb-text">
            Fantastic experience! The product exceeded my expectations in
            quality and delivery time. Will definitely order again. Highly
            recommend this store to others!
          </p>
        </div>

        <h4 className="wrb-subtitle">{t('itemsTitle', { count: 2 })}</h4>

        <div className="wrb-items">
          {reviews.map((r, idx) => (
            <div key={idx} className="wrb-item">
              <img
                src="https://images.unsplash.com/photo-1606813902781-bb3e1f7e1b09?auto=format&fit=crop&w=200&q=60"
                alt={r.product}
                className="wrb-item-img"
              />
              <div className="wrb-item-info">
                <h5 className="wrb-item-name">{r.product}</h5>
                <textarea
                  placeholder={t('optional')}
                  className="wrb-textarea"
                ></textarea>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
