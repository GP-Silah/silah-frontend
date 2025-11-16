import React, { useEffect, useState } from 'react';
import { Star, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './ReviewCard.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export default function ReviewCard({ review }) {
  const { t, i18n } = useTranslation('serviceDetails');
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  const buyerName = review.buyerBusinessName || t('anonymous');
  const rating = review.itemRating ?? 5;
  const comment = review.writtenReviewOfItem ?? '';
  const date = new Date(review.createdAt).toLocaleDateString(
    i18n.language === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' },
  );

  // === FETCH BUYER PFP ===
  const [pfpUrl, setPfpUrl] = useState(null);
  const [loadingPfp, setLoadingPfp] = useState(true);

  useEffect(() => {
    const fetchBuyerPfp = async () => {
      if (!review.buyerId) {
        setLoadingPfp(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/api/buyers/${review.buyerId}`,
          {
            withCredentials: true,
          },
        );
        const url = res.data.user?.pfpUrl;
        setPfpUrl(url || null);
      } catch (err) {
        console.warn('Failed to fetch buyer PFP:', err);
        setPfpUrl(null);
      } finally {
        setLoadingPfp(false);
      }
    };

    fetchBuyerPfp();
  }, [review.buyerId]);

  // === DEFAULT AVATAR IF NO PFP ===
  const Avatar = () => {
    if (loadingPfp) {
      return (
        <div className="rc-avatar-loading">
          <User size={20} />
        </div>
      );
    }

    return pfpUrl ? (
      <img src={pfpUrl} alt={buyerName} className="rc-avatar-img" />
    ) : (
      <div className="rc-avatar-default">
        <User size={32} />
      </div>
    );
  };

  return (
    <div className="rc-card" data-dir={dir}>
      <div className="rc-header">
        <div className="rc-avatar">
          <Avatar />
        </div>
        <div className="rc-info">
          <div className="rc-name">{buyerName}</div>
          <div className="rc-date">{date}</div>
        </div>
      </div>
      <div className="rc-rating">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={18}
            fill={i < rating ? '#facc15' : 'none'}
            stroke="#facc15"
          />
        ))}
      </div>
      {comment && <p className="rc-comment">{comment}</p>}
    </div>
  );
}
