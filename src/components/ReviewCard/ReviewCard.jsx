import React from 'react';
import { Star, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  const { t, i18n } = useTranslation('serviceDetails');
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  const buyerName = review.buyer?.name || t('anonymous');
  const rating = review.itemRating ?? 0;
  const comment = review.writtenReviewOfItem ?? '';
  const date = new Date(review.createdAt).toLocaleDateString(
    i18n.language === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' },
  );

  return (
    <div className="rc-card" data-dir={dir}>
      <div className="rc-header">
        <div className="rc-avatar">
          <User size={32} />
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
