import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LegalPages.css';

const PrivacyPolicy = () => {

  const { t, i18n } = useTranslation('privacy');

  useEffect(() => {
    document.title = t('pageTitle.privacy', {ns: 'common'});
  }, [t, i18n.language]);

  return (
    <main className="legal-container">
      <h1>{t('title')}</h1>
      <p>{t('intro')}</p>

      <h2>{t('info.title')}</h2>
      <p>{t('info.text')}</p>
      <ul>
        <li>{t('info.email')}</li>
        <li>{t('info.name')}</li>
        <li>{t('info.nationalId')}</li>
        <li>{t('info.businessName')}</li>
        <li>{t('info.crn')}</li>
        <li>{t('info.address')}</li>
        <li>{t('info.note')}</li>
      </ul>

      <h2>{t('usage.title')}</h2>
      <p>{t('usage.text')}</p>
      <ul>
        <li>{t('usage.account')}</li>
        <li>{t('usage.transactions')}</li>
        <li>{t('usage.auth')}</li>
        <li>{t('usage.invoices')}</li>
        <li>{t('usage.compliance')}</li>
        <li>{t('usage.improve')}</li>
      </ul>

      <h2>{t('cookies.title')}</h2>
      <p>{t('cookies.text')}</p>

      <h2>{t('thirdParty.title')}</h2>
      <ul>
        <li>{t('thirdParty.payments')}</li>
        <li>{t('thirdParty.law')}</li>
      </ul>

      <h2>{t('storage.title')}</h2>
      <p>{t('storage.text')}</p>

      <h2>{t('retention.title')}</h2>
      <p>{t('retention.text')}</p>

      <h2>{t('ai.title')}</h2>
      <p>{t('ai.text')}</p>
      <ul>
        <li>{t('ai.listings')}</li>
        <li>{t('ai.orders')}</li>
      </ul>

      <h2>{t('law.title')}</h2>
      <p>{t('law.text')}</p>

      <h2>{t('changes.title')}</h2>
      <p>{t('changes.text')}</p>
    </main>
  );
};

export default PrivacyPolicy;
