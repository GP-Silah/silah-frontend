import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ItemCard from '@/components/ItemCard/ItemCard';
import './SupplierSearchResult.css';

const SupplierSearchResult = ({ supplier }) => {
  const { t, i18n } = useTranslation('search');
  const navigate = useNavigate(); // <-- keep it here
  const lang = i18n.language;
  const isRTL = i18n.dir() === 'rtl';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------
  // FETCH supplier products + services (max 4 items)
  // -------------------------------------------------
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const [productsRes, servicesRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/supplier/${
              supplier.supplierId
            }?lang=${lang}`,
            { withCredentials: true },
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/services/supplier/${
              supplier.supplierId
            }?lang=${lang}`,
            { withCredentials: true },
          ),
        ]);

        const products = (productsRes.data || []).map((p) => ({
          ...p,
          type: 'product',
        }));
        const services = (servicesRes.data || []).map((s) => ({
          ...s,
          type: 'service',
        }));

        const all = [...products, ...services]
          .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
          .slice(0, 4);

        setItems(all);
      } catch (err) {
        console.error('Failed to load supplier items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [supplier.supplierId, lang]);

  // -------------------------------------------------
  // Helper – navigate to storefront (no setState!)
  // -------------------------------------------------
  const goToStorefront = () => navigate(`/storefronts/${supplier.supplierId}`);

  // -------------------------------------------------
  // Render data
  // -------------------------------------------------
  const profilePic = supplier.user?.pfpUrl || '/default-avatar.png';
  const businessName =
    supplier.businessName || supplier.user?.businessName || 'Unknown';
  const city = supplier.city || supplier.user?.city || 'Unknown';
  const bio = supplier.storeBio || t('noBio');

  return (
    <div className="supplier-result" dir={i18n.dir()}>
      {/* ---------- HEADER ---------- */}
      <div className="supplier-header">
        <img src={profilePic} alt={businessName} className="supplier-avatar" />

        <div className="supplier-info">
          {/* <-- onClick moved to a wrapper, NOT directly on the h3 --> */}
          <h3
            className="supplier-name"
            onClick={goToStorefront}
            style={{ cursor: 'pointer' }}
          >
            {businessName}
          </h3>
          <p className="supplier-city">{city}</p>
        </div>
        <div className="supplier-rating">
          <span>★ {supplier.avgRating?.toFixed(1) || '0.0'}</span>
          <span className="rating-count">({supplier.ratingsCount || 0})</span>
        </div>
      </div>

      {/* ---------- BIO ---------- */}
      <p className="supplier-bio">{bio}</p>

      {/* ---------- ITEMS GRID ---------- */}
      <div className="supplier-items">
        {loading ? (
          <p className="status">{t('loadingItems')}</p>
        ) : items.length === 0 ? (
          <p className="status no-items">{t('noItemsInStore')}</p>
        ) : (
          <div className="items-grid">
            {items.map((item) => {
              const mapped = {
                _id: item.productId || item.serviceId,
                name: item.name,
                supplier: { businessName, supplierId: supplier.supplierId },
                imagesFilesUrls: item.imagesFilesUrls || [],
                avgRating: item.avgRating || 0,
                ratingsCount: item.ratingsCount || 0,
                price: item.price || 0,
                type: item.type.slice(0, -1), // "product" or "service"
              };
              return (
                <ItemCard key={mapped._id} item={mapped} type={mapped.type} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierSearchResult;
