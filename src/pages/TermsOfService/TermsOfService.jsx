import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../PrivacyPolicy/LegalPages.module.css'; // ← only this line changed (same path, now .module.css)

const TermsOfService = () => {
  const { t, i18n } = useTranslation('terms');

  useEffect(() => {
    document.title = t('pageTitle.terms', { ns: 'common' });
  }, [t, i18n.language]);

  return (
    <div className={styles['legal-container']}>
      <h1>{t('title')}</h1>
      <p>{t('intro')}</p>
      <h2>1. {t('eligibility.title')}</h2>
      <p>{t('eligibility.text')}</p>
      <ul>
        <li>{t('eligibility.point1')}</li>
        <li>{t('eligibility.point2')}</li>
        <li>{t('eligibility.point3')}</li>
        <li>{t('eligibility.note')}</li>
      </ul>
      <h2>2. {t('services.title')}</h2>
      <p>{t('services.text')}</p>
      <h2>3. {t('payments.title')}</h2>
      <p>{t('payments.text')}</p>
      <h2>4. {t('content.title')}</h2>
      <p>{t('content.text')}</p>
      <h2>5. {t('retention.title')}</h2>
      <p>{t('retention.text')}</p>
      <h2>6. {t('liability.title')}</h2>
      <p>{t('liability.text')}</p>
      <h2>7. {t('law.title')}</h2>
      <p>{t('law.text')}</p>
      <h2>8. {t('modifications.title')}</h2>
      <p>{t('modifications.text')}</p>
      <h2>9. {t('contact.title')}</h2>
      <p>{t('contact.text')}</p>
    </div>
  );
};

export default TermsOfService;
