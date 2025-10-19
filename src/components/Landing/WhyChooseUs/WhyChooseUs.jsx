// components/WhyChooseUs.jsx
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './WhyChooseUs.css';

function WhyChooseUs() {
  const { t } = useTranslation('landing');

  return (
    <section className="why-choose-section">
      <h3 className="why-title">{t('whyChooseUs')}</h3>
      <motion.div
        className="why-choose-fullwidth"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="why-choose-image">
          <img src="/whychoosepic.jpg" alt="Why Choose Us" />
        </div>
        <div className="why-choose-content">
          <ul>
            <li>{t('whyPoint1')}</li>
            <li>{t('whyPoint2')}</li>
            <li>{t('whyPoint3')}</li>
            <li>{t('whyPoint4')}</li>
            <li>{t('whyPoint5')}</li>
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

export default WhyChooseUs;
