import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Heart, Star } from 'lucide-react';
import './ItemCard.css';

function ItemCard({ type, item }) {
  const [favorited, setFavorited] = useState(false);

  const supplier = item?.supplier;
  const supplierName =
    supplier?.businessName || supplier?.supplierName || 'Unknown Supplier';

  const image = item?.imagesFilesUrls?.[0];
  const rating = item?.avgRating || 0;
  const price = item?.price || 0;
  const isNegotiable = type === 'service' ? item?.isPriceNegotiable : null;

  const handleFavorite = () => setFavorited(!favorited);

  return (
    <div className="item-card">
      {/* Image */}
      <div className="image-container">
        <img
          src={image}
          alt={item?.name}
          className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
        />

        {/* Heart icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFavorite();
          }}
          className="heart-btn"
        >
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
        <h3>{item?.name}</h3>
        <p>{supplierName}</p>

        {/* Rating and price */}
        <div className="rating-price">
          <div className="rating">
            <Star fill="#facc15" stroke="#facc15" size={16} />
            <span className="text-sm text-gray-700">
              {rating.toFixed(1)} ({item?.ratingsCount || 0})
            </span>
          </div>

          <div className="prcie">
            {price} SAR{type === 'service' && !isNegotiable ? ' • Fixed' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

ItemCard.propTypes = {
  type: PropTypes.oneOf(['product', 'service']).isRequired,
  item: PropTypes.object.isRequired,
};

export default ItemCard;
