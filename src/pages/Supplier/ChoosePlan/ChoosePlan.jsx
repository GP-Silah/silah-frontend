import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './ChoosePlan.css';

const ChoosePlan = () => {
  const { t } = useTranslation('ChoosePlan');

  // Fixed: No TypeScript syntax in JS
  const [currentPlan, setCurrentPlan] = useState('BASIC'); // default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'upgrade' | 'trial' | ''
  const [modalMessage, setModalMessage] = useState('');

  // -------------------------------------------------
  // 1. Fetch current plan on mount
  // -------------------------------------------------
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/suppliers/me/plan`,
          { withCredentials: true },
        );
        setCurrentPlan(data.plan); // "BASIC" or "PREMIUM"
      } catch (err) {
        console.error('Failed to fetch plan:', err);
        setError(t('errors.fetchPlan') || 'Failed to load your plan.');
      }
    };

    fetchCurrentPlan();
  }, [t]);

  // -------------------------------------------------
  // 2. Handle Upgrade
  // -------------------------------------------------
  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/suppliers/me/subscripe-premium`,
        {},
        { withCredentials: true },
      );

      setCurrentPlan('PREMIUM');
      setModalType('upgrade');
      setModalMessage(data.message);
      setShowModal(true);
    } catch (err) {
      const msg = err.response?.data?.error?.message || t('errors.upgrade');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // 3. Handle Start Trial
  // -------------------------------------------------
  const handleTrial = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/suppliers/me/start-free-trail`,
        {},
        { withCredentials: true },
      );

      setCurrentPlan('PREMIUM');
      setModalType('trial');
      setModalMessage(data.message);
      setShowModal(true);
    } catch (err) {
      const msg = err.response?.data?.error?.message || t('errors.trial');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // 4. Close Modal
  // -------------------------------------------------
  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setModalMessage('');
  };

  // -------------------------------------------------
  // 5. Render
  // -------------------------------------------------
  return (
    <div className="choose-plan-container">
      <h2 className="choose-plan-title">{t('ScaleSmartTitle')}</h2>
      <p className="choose-plan-subtitle">{t('ScaleSmartSubtitle')}</p>

      {error && <p className="error-message">{error}</p>}

      <div className="plan-cards">
        {/* Basic Plan */}
        <div className="plan-card basic">
          <h3 className="plan-name">{t('BasicTitle')}</h3>
          <p className="plan-subtitle">{t('BasicSubtitle')}</p>
          <h2 className="plan-price">{t('BasicPrice')}</h2>

          {currentPlan === 'BASIC' ? (
            <button className="plan-button current" disabled>
              {t('Currently')}
            </button>
          ) : (
            <div style={{ height: '36px' }}></div>
          )}

          <ul className="plan-features">
            <li>{t('BasicFeature1')}</li>
            <li>{t('BasicFeature2')}</li>
            <li>{t('BasicFeature3')}</li>
            <li>{t('BasicFeature4')}</li>
            <li>{t('BasicFeature5')}</li>
          </ul>
        </div>

        {/* Premium Plan */}
        <div className="plan-card premium">
          <div className="popular-badge">{t('Popular')}</div>
          <h3 className="plan-name">{t('PremiumTitle')}</h3>
          <p className="plan-subtitle">{t('PremiumSubtitle')}</p>
          <h2 className="plan-price">{t('PremiumPrice')}</h2>

          {currentPlan === 'PREMIUM' ? (
            <button
              className="plan-button current"
              disabled
              style={{ background: '#4a257a' }}
            >
              {t('Currently')}
            </button>
          ) : (
            <>
              <button
                className="plan-button upgrade"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading && modalType === 'upgrade' ? '...' : t('Upgrade')}
              </button>
              <button
                className="trial-link"
                onClick={handleTrial}
                disabled={loading}
              >
                {loading && modalType === 'trial' ? '...' : t('StartTrial')}
              </button>
            </>
          )}

          <ul className="plan-features">
            <li>{t('PremiumFeature1')}</li>
            <li>{t('PremiumFeature2')}</li>
            <li>{t('PremiumFeature3')}</li>
            <li>{t('PremiumFeature4')}</li>
          </ul>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">Check</div>
            <h3 className="modal-title">
              {modalType === 'upgrade'
                ? t('UpgradeSuccessTitle')
                : t('TrialSuccessTitle')}
            </h3>
            <p className="modal-text">{modalMessage}</p>
            <button className="modal-close" onClick={closeModal}>
              {t('Close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChoosePlan;
