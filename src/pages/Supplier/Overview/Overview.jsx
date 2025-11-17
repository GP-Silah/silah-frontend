import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { faShoppingBasket, faCubes } from '@fortawesome/free-solid-svg-icons';
import './Overview.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

function SupplierOverview() {
  const { t, i18n } = useTranslation('supplierOverview');
  const navigate = useNavigate();
  const isRtl = i18n.dir() === 'rtl';

  // ────── STATE ──────
  const [supplier, setSupplier] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [stockLevel, setStockLevel] = useState({ text: '', level: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ────── PAGE TITLE ──────
  useEffect(() => {
    document.title = t('pageTitle');
  }, [t]);

  // ────── FETCH ──────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [profileRes, pendingRes, stockRes] = await Promise.all([
          axios.get(`${API_BASE}/api/suppliers/me`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/suppliers/me/pending-orders-count`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE}/api/suppliers/me/stock-levels`, {
            withCredentials: true,
          }),
        ]);

        const profile = profileRes.data;
        const pending = pendingRes.data;
        const stock = stockRes.data;

        setSupplier(profile);
        setPendingCount(pending.count ?? 0);

        // ── stock level logic ──
        const veryLow = stock.overview.VERY_LOW?.count ?? 0;
        const low = stock.overview.LOW?.count ?? 0;
        let txt = t('cards.stock.levels.good');
        let key = 'GOOD';
        if (veryLow > 0) {
          txt = t('cards.stock.levels.veryLow');
          key = 'VERY_LOW';
        } else if (low > 0) {
          txt = t('cards.stock.levels.low');
          key = 'LOW';
        } else if (stock.overview.AVERAGE?.count > 0) {
          txt = t('cards.stock.levels.average');
          key = 'AVERAGE';
        }
        setStockLevel({ text: txt, level: key });
      } catch (err) {
        const msg = err.response?.data?.error?.message ?? err.message;
        setError(msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  // ────── NAVIGATION ──────
  const goToStoreSettings = () => navigate('/supplier/settings?tab=store');
  const goToOrders = () => navigate('/supplier/orders');
  const goToListings = () => navigate('/supplier/listings');
  const goToChoosePlan = () => navigate('/supplier/choose-plan');

  // ────── LOADING / ERROR ──────
  if (loading) {
    return (
      <div className="supplier-overview" dir={isRtl ? 'rtl' : 'ltr'}>
        <p>{t('common.loading')}…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="supplier-overview" dir={isRtl ? 'rtl' : 'ltr'}>
        <p style={{ color: 'red' }}>
          {t('common.error')}: {error}
        </p>
      </div>
    );
  }

  const supplierName =
    supplier?.supplierName ?? supplier?.user?.name ?? 'Supplier';
  const isStoreOpen = supplier?.storeStatus === 'OPEN';
  const isPremium = supplier?.plan === 'PREMIUM';

  // ────── RENDER ──────
  return (
    <div className="supplier-overview" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Header ── */}
      <div className="overview-header">
        <h1 className="overview-title">
          {t('header.title', { name: supplierName })}
        </h1>
        <p className="overview-subtitle">{t('header.subtitle')}</p>
      </div>

      {/* ── Cards ── */}
      <section className="overview-cards">
        {/* Store Status */}
        <article className="overview-card">
          <div className="card-header-row">
            <FontAwesomeIcon icon={faShoppingBasket} className="card-icon" />
            <h2 className="card-title">{t('cards.status.title')}</h2>
          </div>

          <div className="card-body-center">
            <p className="card-main-text">
              {isStoreOpen ? t('cards.status.open') : t('cards.status.closed')}
            </p>
            <button className="card-button" onClick={goToStoreSettings}>
              {t('cards.status.button')}
            </button>
          </div>
        </article>

        {/* Pending Orders */}
        <article className="overview-card">
          <div className="card-header-row">
            <FontAwesomeIcon icon={faClock} className="card-icon" />
            <h2 className="card-title">{t('cards.pending.title')}</h2>
          </div>

          <div className="card-body-center">
            <p className="card-main-text card-number">{pendingCount}</p>
            <button className="card-button" onClick={goToOrders}>
              {t('cards.pending.button')}
            </button>
          </div>
        </article>

        {/* Stock Levels */}
        <article className="overview-card">
          <div className="card-header-row">
            <FontAwesomeIcon icon={faCubes} className="card-icon" />
            <h2 className="card-title">{t('cards.stock.title')}</h2>
          </div>

          <div className="card-body-center">
            <p className="card-main-text">{stockLevel.text}</p>
            <button className="card-button" onClick={goToListings}>
              {t('cards.stock.button')}
            </button>
          </div>
        </article>
      </section>

      {/* ── Plan ── */}
      <section className="overview-plan">
        <p className="plan-text">
          {t('plan.label')}{' '}
          <span className="plan-name">
            {t(`plan.names.${supplier?.plan ?? 'BASIC'}`)}
          </span>
        </p>
        {!isPremium && <p className="plan-subtext">{t('plan.subtitle')}</p>}
        <button className="plan-button" onClick={goToChoosePlan}>
          {isPremium ? t('plan.manage') : t('plan.upgrade')}
        </button>
      </section>
    </div>
  );
}

export default SupplierOverview;
