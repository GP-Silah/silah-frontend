import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ItemCard from '@/components/ItemCard/ItemCard';
import SupplierSearchResult from '@/components/SupplierSearchResult/SupplierSearchResult';
import './Search.css';

const TYPE_MAP = {
  en: {
    Products: 'products',
    Services: 'services',
    Suppliers: 'suppliers',
  },
  ar: {
    المنتجات: 'products',
    الخدمات: 'services',
    الموردين: 'suppliers',
  },
};

const DISPLAY_TYPE = {
  products: { en: 'Products', ar: 'المنتجات' },
  services: { en: 'Services', ar: 'الخدمات' },
  suppliers: { en: 'Suppliers', ar: 'الموردين' },
};

export default function SearchPage() {
  const { t, i18n } = useTranslation('search');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';
  const rawType = searchParams.get('type') || (isRTL ? 'المنتجات' : 'Products');
  const text = searchParams.get('text') || '';
  const lang = i18n.language;
  const typeKey =
    TYPE_MAP[lang][rawType] || TYPE_MAP.en[rawType.toLowerCase()] || 'products';
  const displayType = DISPLAY_TYPE[typeKey][lang];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false); // Start false
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t, i18n.language]);

  useEffect(() => {
    const search = async () => {
      if (!text.trim()) {
        setLoading(false);
        setItems([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let endpoint = '';
        if (typeKey === 'products') {
          endpoint = `/api/search/products?name=${text}`;
        } else if (typeKey === 'services') {
          endpoint = `/api/search/services?name=${text}`;
        } else if (typeKey === 'suppliers') {
          endpoint = `/api/search/suppliers?name=${text}&businessName=${text}`;
        }

        endpoint += `&lang=${lang}`;
        if (typeKey === 'products') {
          if (minPrice) endpoint += `&minPrice=${minPrice}`;
          if (maxPrice) endpoint += `&maxPrice=${maxPrice}`;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
          { withCredentials: true },
        );
        setItems(res.data || []);
      } catch (err) {
        setError(t('error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [text, typeKey, minPrice, maxPrice, lang, t]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formText = e.target.search.value.trim();
    if (!formText) return;
    const encoded = encodeURIComponent(formText);
    const typeParam = isRTL
      ? typeKey === 'products'
        ? 'المنتجات'
        : typeKey === 'services'
        ? 'الخدمات'
        : 'الموردين'
      : typeKey;
    navigate(`/search?type=${typeParam}&text=${encoded}`);
  };

  const getNoResultsMessage = () => {
    const otherTypes = Object.keys(DISPLAY_TYPE)
      .filter((k) => k !== typeKey)
      .map((k) => DISPLAY_TYPE[k][lang])
      .join(` ${t('or')} `);
    return (
      <p className="status">
        {t('noResults')} "<strong>{text}</strong>" {t('in')}{' '}
        <strong>{displayType}</strong>.
        <br />
        <span style={{ fontSize: '0.95rem', color: '#555' }}>
          {t('trySearching')} {otherTypes}?
        </span>
      </p>
    );
  };

  const showEmptySearch = !text.trim() && !loading;

  return (
    <div className="search-page" dir={i18n.dir()}>
      <div className="search-header">
        <h1>
          {t('title')} "<strong>{text}</strong>" {t('in')} {displayType}
        </h1>
      </div>
      <div className="search-content">
        {/* Filters - Only show for Products */}
        {typeKey === 'products' && (
          <aside className="filters">
            <div className="filter-box">
              <h3>{t('filter')}</h3>
              <div className="price-filter">
                <label>{t('minPrice')}</label>
                <input
                  type="number"
                  min="0"
                  placeholder={t('placeholderMin')}
                  value={minPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || parseFloat(val) >= 0) setMinPrice(val);
                  }}
                />
                <label>{t('maxPrice')}</label>
                <input
                  type="number"
                  min="0"
                  placeholder={t('placeholderMax')}
                  value={maxPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || parseFloat(val) >= 0) setMaxPrice(val);
                  }}
                />
              </div>
              <button
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="clear-btn"
              >
                {t('clearFilters')}
              </button>
            </div>
          </aside>
        )}

        {/* Results */}
        <main className="results">
          {showEmptySearch ? (
            <p className="status">{t('enterSearchText')}</p>
          ) : loading ? (
            <p className="status">{t('loading')}</p>
          ) : error ? (
            <p className="status error">{error}</p>
          ) : items.length === 0 ? (
            getNoResultsMessage()
          ) : (
            <div
              className={
                typeKey === 'suppliers' ? 'suppliers-grid' : 'results-grid'
              }
            >
              {items.map((item) => {
                if (typeKey === 'suppliers') {
                  return (
                    <SupplierSearchResult
                      key={item.supplierId}
                      supplier={item}
                    />
                  );
                }

                const mapped = {
                  _id: item.productId || item.serviceId || item.supplierId,
                  name: item.name || item.businessName,
                  supplier: {
                    businessName:
                      item.supplier?.businessName ||
                      item.businessName ||
                      'Unknown',
                    supplierId: item.supplierId || item.supplier?.supplierId,
                  },
                  imagesFilesUrls: item.imagesFilesUrls || [],
                  avgRating: item.avgRating || 0,
                  ratingsCount: item.ratingsCount || 0,
                  price: item.price || 0,
                  type: typeKey.slice(0, -1),
                };
                return (
                  <ItemCard key={mapped._id} item={mapped} type={mapped.type} />
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
