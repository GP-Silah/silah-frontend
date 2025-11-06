import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ItemCard from '@/components/ItemCard/ItemCard';
import './Wishlist.css';

function WishlistPage() {
  const { t, i18n } = useTranslation('wishlist');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n, i18n.language, t]);

  const isRTL = i18n.language === 'ar';

  // Dummy data
  const items = [
    {
      _id: '1',
      name: 'Flat Beige Plate',
      price: 80,
      avgRating: 4.5,
      ratingsCount: 45,
      type: 'product',
    },
    {
      _id: '2',
      name: 'Luxury Perfume',
      price: 120,
      avgRating: 4.9,
      ratingsCount: 30,
      type: 'product',
    },
    {
      _id: '3',
      name: 'High Quality Beans',
      price: 40,
      avgRating: 4.6,
      ratingsCount: 89,
      type: 'product',
    },
    {
      _id: '4',
      name: 'Eyeliner Shadow',
      price: 60,
      avgRating: 4.8,
      ratingsCount: 70,
      type: 'product',
    },
    {
      _id: '5',
      name: 'UIUX Design',
      price: 150,
      avgRating: 4.8,
      ratingsCount: 30,
      type: 'service',
    },
    {
      _id: '6',
      name: 'Card Design',
      price: 50,
      avgRating: 4.4,
      ratingsCount: 150,
      type: 'service',
    },
    {
      _id: '7',
      name: 'Product Design',
      price: 200,
      avgRating: 4.9,
      ratingsCount: 46,
      type: 'service',
    },
    {
      _id: '8',
      name: 'Phone Repair',
      price: 100,
      avgRating: 4.5,
      ratingsCount: 66,
      type: 'service',
    },
  ];

  // Derived counts
  const counts = useMemo(() => {
    const products = items.filter((i) => i.type === 'product').length;
    const services = items.filter((i) => i.type === 'service').length;
    return { products, services, total: items.length };
  }, [items]);

  // Filtered items
  const filteredItems =
    filter === 'all' ? items : items.filter((i) => i.type === filter);

  // Handle filter
  const handleFilter = (type) => setFilter(type);

  return (
    <div className={`wishlist-page ${isRTL ? 'rtl' : 'ltr'}`}>
      <h1 className="wishlist-title">{t('title')}</h1>

      <div className="wishlist-layout">
        {/* Sidebar */}
        <aside className="wishlist-sidebar">
          <button
            onClick={() => handleFilter('all')}
            className={`wishlist-stat ${filter === 'all' ? 'active' : ''}`}
          >
            <span>
              {counts.total} {isRTL ? 'عناصر' : 'Listings'}
            </span>
          </button>

          <button
            onClick={() => handleFilter('product')}
            className={`wishlist-stat ${filter === 'product' ? 'active' : ''}`}
          >
            <span>
              {counts.products} {isRTL ? 'منتجات' : 'Products'}
            </span>
          </button>

          <button
            onClick={() => handleFilter('service')}
            className={`wishlist-stat ${filter === 'service' ? 'active' : ''}`}
          >
            <span>
              {counts.services} {isRTL ? 'خدمات' : 'Services'}
            </span>
          </button>
        </aside>

        {/* Grid of items */}
        <div className="wishlist-grid">
          {filteredItems.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                gridColumn: '1 / -1',
                color: 'var(--text-muted)',
              }}
            >
              {isRTL ? 'لم تحفظ أي عناصر بعد.' : 'Nothing is saved yet.'}
            </p>
          ) : (
            filteredItems.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                type={item.type}
                showAlternatives={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default WishlistPage;
