import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Heart, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './ItemCard.css';

function ItemCard({ type = 'product', item = {}, showAlternatives = false }) {
  const { t } = useTranslation('wishlist');
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Safe fallbacks
  const {
    _id = item.productId || item.serviceId || null, // real items should have this
    name = 'No Name',
    supplier = {},
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

  // ---- Favorite Handler ----
  const handleFavorite = async (e) => {
    e.stopPropagation();

    // For demo/static usage
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

    // Real API call
    try {
      setLoading(true);
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/buyers/me/wishlist/${_id}`,
        {},
        { withCredentials: true },
      );

      const { message, isAdded } = res.data;
      setFavorited(isAdded);

      await Swal.fire({
        icon: 'success',
        title: t('successTitle'),
        text: t(`${isAdded ? 'added' : 'removed'}`),
        confirmButtonColor: '#476DAE',
        confirmButtonText: t('ok'),
      });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message;

      // Detailed error handling
      if (status === 400) {
        Swal.fire({
          icon: 'error',
          title: t('error.badRequestTitle'),
          text: t('error.badRequestText'),
          confirmButtonText: t('ok'),
        });
      } else if (status === 401) {
        Swal.fire({
          icon: 'warning',
          title: t('error.unauthorizedTitle'),
          text: t('error.unauthorizedText'),
          confirmButtonText: t('ok'),
        });
      } else if (status === 403) {
        Swal.fire({
          icon: 'error',
          title: t('error.forbiddenTitle'),
          text: t('error.forbiddenText'),
          confirmButtonText: t('ok'),
        });
      } else if (status === 404) {
        Swal.fire({
          icon: 'error',
          title: t('error.notFoundTitle'),
          text: t('error.notFoundText'),
          confirmButtonText: t('ok'),
        });
      } else {
        console.error('Wishlist toggle failed:', err);
        Swal.fire({
          icon: 'error',
          title: t('error.genericTitle'),
          text: t('error.genericText'),
          confirmButtonText: t('ok'),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`item-card ${loading ? 'opacity-70 pointer-events-none' : ''}`}
    >
      {/* Image */}
      <div className="image-container">
        <img
          src={image}
          alt={name}
          className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
        />

        {/* Heart icon */}
        <button onClick={handleFavorite} className="heart-btn">
          <Heart
            fill={favorited ? '#ef4444' : 'none'}
            stroke="#ef4444"
            strokeWidth={2}
            size={20}
          />
        </button>
      </div>

      {/* Card content */}
      <div className="card-content">
        <h3>{name}</h3>
        <p>{supplierName}</p>

        {/* Rating and price */}
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

        {/* Alternatives Button */}
        {showAlternatives && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/alternatives/${_id}`);
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
