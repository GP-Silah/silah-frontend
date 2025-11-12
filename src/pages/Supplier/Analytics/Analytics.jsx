import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AnalyticsInsights.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

const AnalyticsInsights = () => {
  const { t, i18n } = useTranslation('analytics');

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language, t]);

  const chartData = {
    labels: ['January', 'February', 'March'],
    datasets: [
      {
        label: t('chart.sales'),
        data: [200, 480, 150],
        borderColor: 'rgba(120, 90, 200, 0.6)',
        backgroundColor: 'rgba(120, 90, 200, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#785AC8',
        pointBorderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#333' } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#444' }, grid: { color: '#eee' } },
      y: { ticks: { color: '#444' }, grid: { color: '#eee' } },
    },
  };

  return (
    <div className={`analytics-page ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <main className="analytics-content">
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-subtitle">{t('subtitle')}</p>{' '}
        {/* مبيعات ورسم ضبابي */}
        <section className="analytics-section blurred-container">
          <div className="total-sales">
            <h2>{t('totalSales.title')}</h2>
            <p>
              <strong>{t('totalSales.value')}</strong> <br />
              {t('totalSales.orders')}
            </p>
          </div>

          <div className="blurred-chart">
            <Line data={chartData} options={chartOptions} />
          </div>
        </section>
        {/* البقية */}
        <section className="insights-section">
          <div className="top-products">
            <h3>{t('topProducts.title')}</h3>
            <p>
              {t('topProducts.ordered')}:{' '}
              <strong>Amber - 25ml Soy Candle</strong>
            </p>
            <p>
              {t('topProducts.wishlisted')}:{' '}
              <strong>Amber - 25ml Soy Candle</strong>
            </p>
          </div>

          <div className="ratings">
            <h3>{t('ratings.title')}</h3>
            <p>{t('ratings.overall')}: ⭐ 4.8</p>
            <p>{t('ratings.reviews')}: 4</p>
          </div>
        </section>
        <section className="reviews-section">
          <h3>{t('reviews.title')}</h3>

          <div className="review-card">
            <p className="review-name">Nivia ⭐⭐⭐⭐⭐</p>
            <p className="review-text">{t('reviews.text1')}</p>
          </div>

          <div className="review-card">
            <p className="review-name">Amax ⭐⭐⭐⭐⭐</p>
            <p className="review-text">{t('reviews.text2')}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AnalyticsInsights;
