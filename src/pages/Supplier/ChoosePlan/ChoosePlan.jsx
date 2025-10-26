import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ChoosePlan.css';

const ChoosePlan = () => {
const { t } = useTranslation('ChoosePlan');
const [showModal, setShowModal] = useState(false);
const [modalType, setModalType] = useState('');

const handleUpgrade = () => {
setModalType('upgrade');
setShowModal(true);
};

const handleTrial = () => {
setModalType('trial');
setShowModal(true);
};

const closeModal = () => {
setShowModal(false);
};

return (
<div className="choose-plan-container">
<h2 className="choose-plan-title">{t('ScaleSmartTitle')}</h2>
<p className="choose-plan-subtitle">{t('ScaleSmartSubtitle')}</p>

  <div className="plan-cards">
    {/* Basic Plan */}
    <div className="plan-card basic">
      <h3 className="plan-name">{t('BasicTitle')}</h3>
      <p className="plan-subtitle">{t('BasicSubtitle')}</p>
      <h2 className="plan-price">{t('BasicPrice')}</h2>
      <button className="plan-button current">{t('Currently')}</button>
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
      <button className="plan-button upgrade" onClick={handleUpgrade}>
        {t('Upgrade')}
      </button>
      <button className="trial-link" onClick={handleTrial}>
        {t('StartTrial')}
      </button>
      <ul className="plan-features">
        <li>{t('PremiumFeature1')}</li>
        <li>{t('PremiumFeature2')}</li>
        <li>{t('PremiumFeature3')}</li>
        <li>{t('PremiumFeature4')}</li>
      </ul>
    </div>
  </div>

  {/* Modal */}
  {showModal && (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">✔</div>
        <h3 className="modal-title">
          {modalType === 'upgrade'
            ? t('UpgradeSuccessTitle')
            : t('TrialSuccessTitle')}
        </h3>
        <p className="modal-text">
          {modalType === 'upgrade'
            ? t('UpgradeSuccessText')
            : t('TrialSuccessText')}
        </p>
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
