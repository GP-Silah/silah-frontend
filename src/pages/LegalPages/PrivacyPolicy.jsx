import React from 'react';
import { useTranslation } from 'react-i18next';
import './LegalPages.css';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <main className="legal-container">
      <h1>{t('privacy.title')}</h1>
      <p>{t('privacy.intro')}</p>

      <h2>{t('privacy.info.title')}</h2>
      <p>{t('privacy.info.text')}</p>
      <ul>
        <li>{t('privacy.info.email')}</li>
        <li>{t('privacy.info.name')}</li>
        <li>{t('privacy.info.nationalId')}</li>
        <li>{t('privacy.info.businessName')}</li>
        <li>{t('privacy.info.crn')}</li>
        <li>{t('privacy.info.address')}</li>
        <li>{t('privacy.info.note')}</li>
      </ul>

      <h2>{t('privacy.usage.title')}</h2>
      <p>{t('privacy.usage.text')}</p>
      <ul>
        <li>{t('privacy.usage.account')}</li>
        <li>{t('privacy.usage.transactions')}</li>
        <li>{t('privacy.usage.auth')}</li>
        <li>{t('privacy.usage.invoices')}</li>
        <li>{t('privacy.usage.compliance')}</li>
        <li>{t('privacy.usage.improve')}</li>
      </ul>

      <h2>{t('privacy.cookies.title')}</h2>
      <p>{t('privacy.cookies.text')}</p>

      <h2>{t('privacy.thirdParty.title')}</h2>
      <ul>
        <li>{t('privacy.thirdParty.payments')}</li>
        <li>{t('privacy.thirdParty.law')}</li>
      </ul>

      <h2>{t('privacy.storage.title')}</h2>
      <p>{t('privacy.storage.text')}</p>

      <h2>{t('privacy.retention.title')}</h2>
      <p>{t('privacy.retention.text')}</p>

      <h2>{t('privacy.ai.title')}</h2>
      <p>{t('privacy.ai.text')}</p>
      <ul>
        <li>{t('privacy.ai.listings')}</li>
        <li>{t('privacy.ai.orders')}</li>
      </ul>

      <h2>{t('privacy.law.title')}</h2>
      <p>{t('privacy.law.text')}</p>

      <h2>{t('privacy.changes.title')}</h2>
      <p>{t('privacy.changes.text')}</p>
    </main>
  );
};

export default PrivacyPolicy;
