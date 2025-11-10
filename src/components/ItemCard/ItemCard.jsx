import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Heart, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './ItemCard.css';

function ItemCard({ type = 'product', item = {}, showAlternatives = false }) {
  const { t } = useTranslation('wishlist');
  const navigate = useNavigate();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Safe fallbacks
  const {
    _id = item.productId || item.serviceId || null,
    name = 'No Name',
    supplier = {},
    supplierId = supplier.supplierId,
    imagesFilesUrls = [],
    avgRating = 0,
    ratingsCount = 0,
    price = 0,
    isPriceNegotiable = false,
  } = item;

  const supplierName =
    supplier.businessName || supplier.supplierName || 'Unknown Supplier';

  const image =
    imagesFilesUrls[0] || 'https://placehold.co/300x200?text=No+Image';

  // --- Check wishlist on mount ---
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/buyers/me/wishlist`,
          { withCredentials: true },
        );
        const wishlist = res.data || [];

        const isFavorited = wishlist.some((entry) => {
          if (type === 'product') {
            return (
              entry.itemType === 'PRODUCT' && entry.product?.productId === _id
            );
          } else {
            return (
              entry.itemType === 'SERVICE' && entry.service?.serviceId === _id
            );
          }
        });

        setFavorited(isFavorited);
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      }
    };

    if (_id) fetchWishlist();
  }, [_id, type]);

  // ---- Favorite Handler ----
  const handleFavorite = async (e) => {
    e.stopPropagation();

    if (!_id) {
      await Swal.fire({
        icon: 'info',
        title: t('demoTitle'),
        text: t('demoText'),
        confirmButtonColor: '#476DAE',
        confirmButtonText: t('ok'),
      });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/buyers/me/wishlist/${_id}`,
        {},
        { withCredentials: true },
      );

      const { isAdded } = res.data;
      setFavorited(isAdded);

      await Swal.fire({
        icon: 'success',
        title: t('successTitle'),
        text: t(isAdded ? 'added' : 'removed'),
        confirmButtonColor: '#476DAE',
        confirmButtonText: t('ok'),
      });
    } catch (err) {
      console.error('Wishlist toggle failed:', err);

      const errorMessage = err.response?.data?.error?.message;

      // CUSTOM LOGIN ALERT
      if (errorMessage === 'No token found in cookies') {
        await Swal.fire({
          icon: 'warning',
          title: t('loginRequired'),
          text: t('loginToContinue'),
          confirmButtonColor: '#476DAE',
          confirmButtonText: t('ok'),
          allowOutsideClick: false,
        });
        return;
      }

      // FALLBACK: Any other error
      Swal.fire({
        icon: 'error',
        title: t('error.genericTitle'),
        text: t('error.genericText'),
        confirmButtonText: t('ok'),
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- Card Click ----
  const handleCardClick = () => {
    if (!_id) return;
    const path = type === 'product' ? `/products/${_id}` : `/services/${_id}`;
    navigate(path);
  };

  // ---- Supplier Click ----
  const handleSupplierClick = (e) => {
    e.stopPropagation();
    if (!supplierId) return;
    navigate(`/storefronts/${supplierId}`);
  };

  return (
    <div
      className={`item-card ${loading ? 'opacity-70 pointer-events-none' : ''}`}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="image-container">
        <img
          src={image}
          alt={name}
          className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
        />

        {/* Heart icon */}
        <button
          onClick={handleFavorite}
          className="heart-btn"
          disabled={loading}
        >
          <Heart
            fill={favorited ? '#ef4444' : 'none'}
            stroke="#ef4444"
            strokeWidth={2}
            size={22}
            className="transition-transform duration-200 hover:scale-110"
          />
        </button>
      </div>

      {/* Card content */}
      <div className="card-content">
        <h3>{name}</h3>
        <p className="supplier-name clickable" onClick={handleSupplierClick}>
          {supplierName}
        </p>

        <div className="rating-price">
          <div className="rating">
            <Star fill="#facc15" stroke="#facc15" size={16} />
            <span className="text-sm text-gray-700">
              {avgRating.toFixed(1)} ({ratingsCount})
            </span>
          </div>

          <div className="price">
            {price} SAR
            {type === 'service' && !isPriceNegotiable ? ' • Fixed' : ''}
          </div>
        </div>

        {showAlternatives && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/buyer/alternatives?itemId=${_id}`);
            }}
            className="alternatives-btn"
          >
            {t('findAlternatives')}
          </button>
        )}
      </div>
    </div>
  );
}

ItemCard.propTypes = {
  type: PropTypes.oneOf(['product', 'service']),
  item: PropTypes.object,
  showAlternatives: PropTypes.bool,
};

export default ItemCard;
