import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ReviewCard from '@/components/ReviewCard/ReviewCard';
import styles from './Analytics.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const AnalyticsInsights = () => {
  const { t, i18n } = useTranslation('analytics');
  const isRtl = i18n.language === 'ar';

  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [isRtl, t]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Get profile (includes supplierId + plan)
        const profileRes = await axios.get(`${API_BASE}/api/suppliers/me`, {
          withCredentials: true,
        });
        const supplierId = profileRes.data.supplierId;
        const plan = profileRes.data.plan;

        setProfile({ ...profileRes.data, plan });

        // 2. Get analytics + reviews in parallel
        const [analyticsRes, reviewsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/analytics/me`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/reviews/suppliers/${supplierId}`, {
            withCredentials: true,
            params: { lang: i18n.language },
          }),
        ]);

        setAnalytics(analyticsRes.data);
        setReviews(reviewsRes.data.slice(0, 6)); // Show latest 6 reviews
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(t('errorLoading') || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [i18n.language]);

  if (loading)
    return (
      <div className={styles.analyticsPage}>
        <div className={styles.loading}>
          {t('loading') || 'جاري التحميل...'}
        </div>
      </div>
    );

  if (error)
    return (
      <div className={styles.analyticsPage}>
        <div className={styles.error}>{error}</div>
      </div>
    );

  const months = analytics.totalRevenue.map((m) => m.month);
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
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        rtl: isRtl,
        labels: { color: '#333', font: { size: 13 } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#555' },
        grid: { color: '#eee' },
      },
      x: { ticks: { color: '#555' }, grid: { color: '#eee' } },
    },
  };

  const mostOrdered = analytics.topItems.mostOrdered[0];
  const mostWishlisted = analytics.topItems.mostWishlisted?.[0];
  const isPremium = profile?.plan === 'PREMIUM';

  const totalRevenue = analytics.totalRevenue.reduce(
    (sum, m) => sum + m.totalRevenue,
    0,
  );
  const totalOrders = analytics.totalRevenue.reduce(
    (sum, m) => sum + m.totalOrders,
    0,
  );

  return (
    <div
      className={`${styles.analyticsPage} ${isRtl ? styles.rtl : styles.ltr}`}
    >
      <main className={styles.analyticsContent}>
        <h1 className={styles.pageTitle}>{t('title')}</h1>
        <p className={styles.pageSubtitle}>{t('subtitle')}</p>

        {/* Revenue + Chart */}
        <section className={styles.salesSection}>
          <div className={styles.totalSales}>
            <h2>{t('totalSales.title')}</h2>
            <div className={styles.bigNumber}>
              {totalRevenue.toLocaleString()}{' '}
              <img src="/riyal.png" alt={t('currency')} className="sar" />
            </div>
            <p className={styles.ordersCount}>
              {totalOrders} {t('totalSales.orders')}
            </p>
          </div>

          <div className={styles.chartContainer}>
            <Bar data={chartData} options={chartOptions} height={300} />
          </div>
        </section>

        {/* Top Products + Ratings */}
        <section className={styles.insightsSection}>
          <div className={styles.topProducts}>
            <h3>{t('topProducts.title')}</h3>

            <div className={styles.itemCard}>
              <strong>{t('topProducts.ordered')}:</strong>
              <p>{mostOrdered?.name || t('noData')}</p>
            </div>

            <div
              className={`${styles.itemCard} ${
                !isPremium ? styles.premiumLocked : ''
              }`}
            >
              <strong>{t('topProducts.wishlisted')}:</strong>
              {isPremium ? (
                <p>{mostWishlisted?.name || t('noData')}</p>
              ) : (
                <div className={styles.lockedContent}>
                  <span>????</span>
                  <div className={styles.upgradeBadge}>
                    <span role="img" aria-label="lock">
                      Locked
                    </span>{' '}
                    {t('premiumFeature')}
                  </div>
                </div>
              )}
            </div>

            {!isPremium && (
              <div className={styles.upgradePrompt}>
                <p>{t('upgradeToUnlock')}</p>
                <a href="/pricing" className={styles.upgradeBtn}>
                  {t('goPremium')}
                </a>
              </div>
            )}
          </div>

          <div className={styles.ratings}>
            <h3>{t('ratings.title')}</h3>
            <div className={styles.ratingBig}>
              <span>
                ⭐ {analytics.reviews.overallRating.averageStars.toFixed(1)}
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

        {/* Recent Reviews */}
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
