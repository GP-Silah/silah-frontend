import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import ReviewCard from '@/components/ReviewCard/ReviewCard';
import styles from './Analytics.module.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Arabic month names
const AR_MONTHS = {
  January: 'يناير',
  February: 'فبراير',
  March: 'مارس',
  April: 'أبريل',
  May: 'مايو',
  June: 'يونيو',
  July: 'يوليو',
  August: 'أغسطس',
  September: 'سبتمبر',
  October: 'أكتوبر',
  November: 'نوفمبر',
  December: 'ديسمبر',
};

const AnalyticsInsights = () => {
  const { t, i18n } = useTranslation('analytics');
  const isRtl = i18n.language === 'ar';

  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [topOrderedItem, setTopOrderedItem] = useState(null);
  const [topWishlistedItem, setTopWishlistedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [isRtl, t]);

  // Fetch item details (product or service)
  const fetchItemDetails = async (item) => {
    if (!item || !item.itemId) return null;
    try {
      const endpoint =
        item.type === 'PRODUCT'
          ? `/api/products/${item.itemId}`
          : `/api/services/${item.itemId}`;
      const res = await axios.get(`${API_BASE}${endpoint}`, {
        withCredentials: true,
        params: { lang: i18n.language },
      });
      return res.data;
    } catch (err) {
      console.warn('Failed to fetch item:', err);
      return { name: item.name, imagesFilesUrls: [] };
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const profileRes = await axios.get(`${API_BASE}/api/suppliers/me`, {
          withCredentials: true,
        });
        const supplierId = profileRes.data.supplierId;
        const plan = profileRes.data.plan;
        setProfile({ ...profileRes.data, plan });

        const [analyticsRes, reviewsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/analytics/me`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/reviews/suppliers/${supplierId}`, {
            withCredentials: true,
            params: { lang: i18n.language },
          }),
        ]);

        setAnalytics(analyticsRes.data);
        setReviews(reviewsRes.data.slice(0, 6));

        // Fetch top items with images
        const ordered = analyticsRes.data.topItems.mostOrdered[0];
        const wishlisted = analyticsRes.data.topItems.mostWishlisted?.[0];

        if (ordered) {
          const item = await fetchItemDetails(ordered);
          setTopOrderedItem({ ...ordered, details: item });
        }
        if (wishlisted) {
          const item = await fetchItemDetails(wishlisted);
          setTopWishlistedItem({ ...wishlisted, details: item });
        }
      } catch (err) {
        console.error(err);
        setError(t('errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [i18n.language]);

  if (loading) return <div className={styles.loading}>{t('loading')}</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const months = analytics.totalRevenue.map((m) =>
    isRtl ? AR_MONTHS[m.month] || m.month : m.month,
  );
  const orderRevenues = analytics.totalRevenue.map((m) => m.orderRevenue || 0);
  const totalRevenues = analytics.totalRevenue.map((m) => m.totalRevenue || 0);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: t('chart.ordersRevenue'),
        data: orderRevenues,
        backgroundColor: 'rgba(120, 90, 200, 0.7)',
        borderColor: '#785AC8',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: t('chart.totalRevenue'),
        data: totalRevenues,
        backgroundColor: 'rgba(74, 158, 255, 0.7)',
        borderColor: '#4A9EFF',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', rtl: isRtl } },
    scales: {
      x: { reverse: isRtl, ticks: { color: '#555' }, grid: { color: '#eee' } },
      y: {
        beginAtZero: true,
        ticks: { color: '#555' },
        grid: { color: '#eee' },
      },
    },
  };

  const totalRevenue = analytics.totalRevenue.reduce(
    (s, m) => s + m.totalRevenue,
    0,
  );
  const totalOrders = analytics.totalRevenue.reduce(
    (s, m) => s + m.totalOrders,
    0,
  );
  const isPremium = profile?.plan === 'PREMIUM';

  const StarRating = ({ rating }) => (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={i <= rating ? '#facc15' : 'none'}
          stroke="#facc15"
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );

  const ItemCard = ({ item, isWishlisted }) => {
    if (!item) return <p>{t('noData')}</p>;
    const img = item.details?.imagesFilesUrls?.[0] || '/placeholder.png';
    const name = item.details?.name || item.name;
    const route =
      item.type === 'PRODUCT'
        ? `/supplier/products/${item.itemId}`
        : `/supplier/services/${item.itemId}`;

    return (
      <Link to={route} className={styles.itemLink}>
        <div
          className={`${styles.itemCard} ${
            !isPremium && isWishlisted ? styles.premiumLocked : ''
          }`}
        >
          <img src={img} alt={name} className={styles.itemImage} />
          <p className={styles.itemName}>{name}</p>
          {isWishlisted && !isPremium && (
            <div className={styles.lockOverlay}>
              <span>{t('locked')}</span>
              <span className={styles.premiumBadge}>{t('premiumFeature')}</span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div
      className={`${styles.analyticsPage} ${isRtl ? styles.rtl : styles.ltr}`}
    >
      <main className={styles.analyticsContent}>
        <h1 className={styles.pageTitle}>{t('title')}</h1>
        <p className={styles.pageSubtitle}>{t('subtitle')}</p>

        <section className={styles.salesSection}>
          <div className={styles.totalSales}>
            <h2>{t('totalSales.title')}</h2>
            <div className={styles.bigNumber}>
              {totalRevenue.toLocaleString()}{' '}
              <img src="/riyal.png" alt="SAR" className={styles.sar} />
            </div>
            <p className={styles.ordersCount}>
              {totalOrders} {t('totalSales.orders')}
            </p>
          </div>
          <div className={styles.chartContainer}>
            <Bar data={chartData} options={chartOptions} height={320} />
          </div>
        </section>

        <section className={styles.insightsSection}>
          <div className={styles.topProducts}>
            <h3>{t('topProducts.title')}</h3>

            <div className={styles.listingItem}>
              <strong>{t('topProducts.ordered')}:</strong>
              {topOrderedItem ? (
                <Link
                  to={`/supplier/${
                    topOrderedItem.type === 'PRODUCT' ? 'products' : 'services'
                  }/${topOrderedItem.itemId}`}
                  className={styles.listingLink}
                >
                  <div className={styles.listingImageWrapper}>
                    <img
                      src={
                        topOrderedItem.details?.imagesFilesUrls?.[0] ||
                        '/placeholder.png'
                      }
                      alt={topOrderedItem.details?.name || topOrderedItem.name}
                      className={styles.listingImage}
                    />
                  </div>
                  <span className={styles.listingName}>
                    {topOrderedItem.details?.name || topOrderedItem.name}
                  </span>
                </Link>
              ) : (
                <span className={styles.noDataText}>{t('noData')}</span>
              )}
            </div>

            <div
              className={`${styles.listingItem} ${
                !isPremium ? styles.blurredListing : ''
              }`}
            >
              <strong>{t('topProducts.wishlisted')}:</strong>
              {isPremium && topWishlistedItem ? (
                <Link
                  to={`/supplier/${
                    topWishlistedItem.type === 'PRODUCT'
                      ? 'products'
                      : 'services'
                  }/${topWishlistedItem.itemId}`}
                  className={styles.listingLink}
                >
                  <div className={styles.listingImageWrapper}>
                    <img
                      src={
                        topWishlistedItem.details?.imagesFilesUrls?.[0] ||
                        '/placeholder.png'
                      }
                      alt={
                        topWishlistedItem.details?.name ||
                        topWishlistedItem.name
                      }
                      className={styles.listingImage}
                    />
                  </div>
                  <span className={styles.listingName}>
                    {topWishlistedItem.details?.name || topWishlistedItem.name}
                  </span>
                </Link>
              ) : isPremium ? (
                <span className={styles.noDataText}>{t('noData')}</span>
              ) : (
                <span className={styles.lockedText}>
                  {t('locked')} {t('premiumFeature')}
                </span>
              )}
            </div>

            {!isPremium && (
              <div className={styles.upgradePrompt}>
                <p>{t('upgradeToUnlock')}</p>
                <Link to="/supplier/choose-plan" className={styles.upgradeBtn}>
                  {t('goPremium')}
                </Link>
              </div>
            )}
          </div>

          <div className={styles.ratings}>
            <h3>{t('ratings.title')}</h3>
            <div className={styles.ratingBig}>
              <StarRating
                rating={Math.round(
                  analytics.reviews.overallRating.averageStars,
                )}
              />
              <span className={styles.ratingNumber}>
                {analytics.reviews.overallRating.averageStars.toFixed(1)}
              </span>
              <small>
                ({analytics.reviews.overallRating.totalReviews}{' '}
                {t('totalReviewsLabel')})
              </small>
            </div>
            <p className={styles.newReviewsCount}>
              +{reviews.length} {t('newThisPeriod')}
            </p>
          </div>
        </section>

        <section className={styles.reviewsSection}>
          <h3>{t('reviews.title')}</h3>
          {reviews.length > 0 ? (
            <div className={styles.reviewsGrid}>
              {reviews.map((review) => (
                <ReviewCard key={review.reviewId} review={review} />
              ))}
            </div>
          ) : (
            <p className={styles.noReviews}>{t('noReviewsYet')}</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default AnalyticsInsights;
