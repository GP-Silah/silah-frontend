import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import './PredictDemand.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function DemandPrediction() {
  const { t, i18n } = useTranslation('predictDemand');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, supplierStatus } = useAuth();
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    document.title = t('pageTitle');
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }, [t, i18n.language]);

  // -----------------------------------------------------------------
  // 1. STATE
  // -----------------------------------------------------------------
  const [plan, setPlan] = useState(null); // 'PREMIUM' | null
  const [product, setProduct] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [recommendedStock, setRecommendedStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStock, setCurrentStock] = useState(0);

  // -----------------------------------------------------------------
  // 2. USER ACCESS (re-computed on every render)
  // -----------------------------------------------------------------
  const isSupplier = role === 'supplier';
  const isActive = supplierStatus === 'ACTIVE';
  const isPremium = plan === 'PREMIUM';
  const canAccess = isSupplier && isActive && isPremium;

  // -----------------------------------------------------------------
  // 3. FETCH PLAN → (if premium) FETCH FORECAST
  // -----------------------------------------------------------------
  useEffect(() => {
    // Reset everything
    setPlan(null);
    setProduct(null);
    setForecast([]);
    setRecommendedStock(0);
    setError(null);
    setLoading(true);

    // ---------------------------------------------------------------
    // 3.1 Not a supplier / inactive → show teaser
    // ---------------------------------------------------------------
    if (!isSupplier || !isActive) {
      console.log('[Demand] Not supplier or inactive → teaser');
      setLoading(false);
      return;
    }

    // ---------------------------------------------------------------
    // 3.2 Fetch supplier plan
    // ---------------------------------------------------------------
    const fetchPlan = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL;
        console.log(
          '[Demand] Fetching plan from',
          `${base}/api/suppliers/me/plan`,
        );
        const res = await axios.get(`${base}/api/suppliers/me/plan`, {
          withCredentials: true,
        });
        console.log('[Demand] Plan response', res.data);
        setPlan(res.data.plan);
      } catch (err) {
        console.error('[Demand] Plan fetch failed', err);
        setError(t('genericError'));
        setLoading(false);
      }
    };

    // ---------------------------------------------------------------
    // 3.3 Fetch forecast (only if we are premium **after** plan is set)
    // ---------------------------------------------------------------
    const fetchForecast = async () => {
      if (!id || id.trim() === '') {
        console.warn('[Demand] Empty product ID');
        setError(t('invalidId'));
        setLoading(false);
        return;
      }

      try {
        const base = import.meta.env.VITE_BACKEND_URL;
        console.log('[Demand] Fetching forecast for id', id);
        const res = await axios.get(`${base}/api/demand-predictions/${id}`, {
          withCredentials: true,
        });
        console.log('[Demand] Forecast response', res.data);

        const d = res.data;
        setProduct({
          name: d.productName,
        });
        setForecast(d.forecast);
        setRecommendedStock(d.recommendedStock);
      } catch (err) {
        const status = err.response?.status;
        const msg =
          err.response?.data?.error?.message || err.response?.data?.message;
        console.error('[Demand] Forecast error', status, msg, err);

        let uiMsg = t('genericError');
        if (status === 400) uiMsg = msg || t('notEnoughData');
        else if (status === 401) uiMsg = msg || t('upgradeRequired');
        else if (status === 403) uiMsg = msg || t('forbidden');
        else if (status === 404) uiMsg = t('productNotFoundOrNotYours');
        else if (status === 502) uiMsg = t('aiUnavailable');
        else if (msg) uiMsg = msg;

        setError(uiMsg);
      } finally {
        setLoading(false);
      }
    };

    // ---------------------------------------------------------------
    // 3.4 Execute plan → then conditionally forecast
    // ---------------------------------------------------------------
    fetchPlan().then(() => {
      // **NOW** `plan` state is updated → `isPremium` will be true on next render
      // We **don't** use `isPremium` here. Instead, we let the next render decide.
      // So we just stop loading.
      setLoading(false);
    });
  }, [id, isSupplier, isActive, t]);

  // -----------------------------------------------------------------
  // 4. SECOND EFFECT: Run forecast **after** plan is known
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!canAccess || !id) return;

    // At this point: plan is loaded → canAccess is correct
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const base = import.meta.env.VITE_BACKEND_URL;
        console.log('[Demand] (2nd effect) Fetching forecast for id', id);
        const res = await axios.get(`${base}/api/demand-predictions/${id}`, {
          withCredentials: true,
        });
        console.log('[Demand] Forecast response', res.data);

        const d = res.data;
        setProduct({
          name: d.productName,
        });
        setForecast(d.forecast);
        setRecommendedStock(d.recommendedStock);
        fetchCurrentStock();
      } catch (err) {
        const status = err.response?.status;
        const msg =
          err.response?.data?.error?.message || err.response?.data?.message;
        console.error('[Demand] Forecast error', status, msg, err);

        let uiMsg = t('genericError');
        if (status === 400) uiMsg = msg || t('notEnoughData');
        else if (status === 401) uiMsg = msg || t('upgradeRequired');
        else if (status === 403) uiMsg = msg || t('forbidden');
        else if (status === 404) uiMsg = t('productNotFoundOrNotYours');
        else if (status === 502) uiMsg = t('aiUnavailable');
        else if (msg) uiMsg = msg;

        setError(uiMsg);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentStock = async () => {
      if (!id) return;
      try {
        const base = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${base}/api/products/${id}`, {
          withCredentials: true,
          headers: { 'accept-language': i18n.language === 'ar' ? 'ar' : 'en' },
        });
        setCurrentStock(res.data.stock || 0);
        setProduct({
          name: res.data.name,
          image: res.data.imagesFilesUrls[0],
        });
      } catch (err) {
        console.error('Failed to fetch current stock', err);
        setCurrentStock(0);
      }
    };

    fetchForecast();
  }, [canAccess, id, t]);

  // -----------------------------------------------------------------
  // 5. CHART CONFIG
  // -----------------------------------------------------------------
  const chartData = {
    labels: forecast.map((f) => {
      const [year, month] = f.month.split('-');
      const date = new Date(year, month - 1); // month is 1-indexed in Date
      return date.toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        year: 'numeric',
      });
    }),
    datasets: [
      {
        label: t('demandLabel'),
        data: forecast.map((f) => f.demand),
        borderColor: '#517fbf',
        backgroundColor: 'rgba(81, 127, 191, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#517fbf',
        pointRadius: 5,
      },
      {
        label: t('currentStockLabel'),
        data: forecast.map(() => currentStock),
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        fill: false,
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', rtl: isRTL },
      tooltip: { rtl: isRTL },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 10 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: { reverse: isRTL, grid: { display: false } },
    },
  };

  // -----------------------------------------------------------------
  // 6. RENDER
  // -----------------------------------------------------------------
  const showPremium = canAccess && !loading && !error && product;
  const showTeaser = !canAccess && !loading;

  return (
    <div className="predict-demand-page" dir={i18n.dir()}>
      {/* Header */}
      <div className="page-header">
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>

      <main className="content-area">
        {loading ? (
          <p className="status">{t('loading')}</p>
        ) : error ? (
          <section className="not-enough-data-section">
            <div className="not-enough-card">
              {/* Dynamic message based on how many days they actually have */}
              {error.includes('found 0') || error.includes('found 0.') ? (
                <>
                  {/* Sad face icon */}
                  <div className="sad-icon">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
                      <path
                        d="M9 17 c .5 -1 1.5 -1.5 3 -1.5 s2.5 .5 3 1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="9" cy="10" r="1" fill="#94a3b8" />
                      <circle cx="15" cy="10" r="1" fill="#94a3b8" />
                    </svg>
                  </div>
                  <h2>{t('notEnough.zeroTitle')}</h2>
                  <p className="encouragement">{t('notEnough.zeroText')}</p>
                </>
              ) : error.includes('found') ? (
                <>
                  {/* Sad but hopeful icon */}
                  <div className="sad-icon">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
                      <path
                        d="M9 15c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="9" cy="10" r="1" fill="#94a3b8" />
                      <circle cx="15" cy="10" r="1" fill="#94a3b8" />
                    </svg>
                  </div>
                  <h2>{t('notEnough.almostTitle')}</h2>
                  <p className="encouragement">
                    {t('notEnough.almostText', {
                      count: error.match(/\d/)?.[0] || 'few',
                    })}
                  </p>
                  <div className="progress-hint">
                    {t('notEnough.progress', {
                      needed: 10,
                      current: error.match(/\d/)?.[0] || 0,
                    })}
                  </div>
                </>
              ) : (
                <>
                  <h2>{t('notEnough.genericTitle')}</h2>
                  <p className="encouragement">{error}</p>
                </>
              )}

              {/* Action buttons */}
              <div className="action-buttons">
                <button
                  onClick={() => navigate('/supplier/listings')}
                  className="primary-btn"
                >
                  {t('notEnough.goToProducts')}
                </button>
                <button onClick={() => navigate(-1)} className="secondary-btn">
                  {t('notEnough.goBack')}
                </button>
              </div>

              {/* Pro tip */}
              <div className="pro-tip">
                <strong>{t('notEnough.tipTitle')}</strong> {t('notEnough.tip')}
              </div>
            </div>
          </section>
        ) : showPremium ? (
          <section className="forecast-section">
            <div className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <h2 className="product-name">{product.name}</h2>
            </div>

            <p className="chart-label">{t('chartLabel')}</p>

            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>

            <p className="restock-advice">
              {recommendedStock > 0 ? (
                t('restockAdvice', { count: recommendedStock })
              ) : (
                <span style={{ color: '#16a34a' }}>
                  {t('restockAdviceOverstocked')}
                </span>
              )}
            </p>
          </section>
        ) : showTeaser ? (
          <section className="teaser-section">
            <div className="blur-overlay">
              <div className="teaser-content">
                <h2>{t('teaserTitle')}</h2>
                <p className="teaser-text">{t('teaserText')}</p>
                <button
                  onClick={() => navigate('/supplier/choose-plan')}
                  className="upgrade-btn"
                >
                  {t('upgradeNow')}
                </button>
              </div>
            </div>

            <div className="blurred-chart">
              <Line
                data={{
                  ...chartData,
                  datasets: chartData.datasets.map((d) => ({
                    ...d,
                    borderColor: 'rgba(81, 127, 191, 0.15)',
                    backgroundColor: 'rgba(81, 127, 191, 0.03)',
                  })),
                }}
                options={{ ...chartOptions, interaction: { mode: null } }}
              />
            </div>

            <p className="restock-advice blurred">
              {t('restockAdvice', { count: 87 })}
            </p>
          </section>
        ) : (
          <p className="status error">{t('genericError')}</p>
        )}
      </main>
    </div>
  );
}
