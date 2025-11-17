import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ItemCard from '@/components/ItemCard/ItemCard';
import './Wishlist.css';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site/';

function WishlistPage() {
  const { t, i18n } = useTranslation('wishlist');
  const [filter, setFilter] = useState('all');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n, i18n.language, t]);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`${API}/api/buyers/me/wishlist`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch wishlist');

        const data = await response.json();

        // 🆕 تم الإضافة: تنسيق البيانات القادمة من الباك-إند لتتناسب مع ItemCard
        const formatted = data.map((item) => {
          const isProduct = item.itemType === 'PRODUCT';
          const base = isProduct ? item.product : item.service;

          return {
            _id: item.itemId,
            name: base?.name,
            price: base?.price,
            avgRating: base?.avgRating,
            ratingsCount: base?.ratingsCount,
            type: isProduct ? 'product' : 'service',
            imagesFilesUrls: base?.imagesFilesUrls,
            supplier: base?.supplier,
            isAvailable: isProduct ? base?.stock > 0 : true,
          };
        });

        setItems(formatted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [t]);

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
      {/* 🆕 تم الإضافة: عرض حالة التحميل أو الخطأ */}
      {loading && (
        <p style={{ textAlign: 'center', color: 'gray' }}>
          {isRTL ? 'جاري التحميل...' : 'Loading...'}
        </p>
      )}
      {error && (
        <p style={{ textAlign: 'center', color: 'red' }}>
          {isRTL ? 'حدث خطأ أثناء تحميل البيانات.' : 'Failed to load data.'}
        </p>
      )}

      {!loading && !error && (
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
              className={`wishlist-stat ${
                filter === 'product' ? 'active' : ''
              }`}
            >
              <span>
                {counts.products} {isRTL ? 'منتجات' : 'Products'}
              </span>
            </button>

            <button
              onClick={() => handleFilter('service')}
              className={`wishlist-stat ${
                filter === 'service' ? 'active' : ''
              }`}
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
                  isAvailable={item.isAvailable}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
