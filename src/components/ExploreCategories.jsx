import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';
import Button from './Button';
import './ExploreCategories.css';

function ExploreCategories() {
  const { t } = useTranslation('landing');
  const [activeTab, setActiveTab] = useState('products');

  const tabs = ['products', 'services'];

  const productFilters = [
    t('filter.agriculture'),
    t('filter.beauty'),
    t('filter.fashion'),
    t('filter.food'),
    t('filter.home'),
    t('filter.hardware'),
    t('filter.packaging'),
    t('filter.energy'),
  ];

  const serviceFilters = [
    t('filter.shipping'),
    t('filter.design'),
    t('filter.legal'),
    t('filter.technical'),
    t('filter.manufacturing'),
    t('filter.it'),
    t('filter.business'),
  ];

  const filtersToShow =
    activeTab === 'products' ? productFilters : serviceFilters;

  return (
    <section className="explore-section">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2>{t('exploreTitle')}</h2>
        <p className="subtitle">{t('exploreSubtitle')}</p>

        <div className="tabs">
          {tabs.map((tab) => (
            <Button
              key={tab}
              label={t(`tabs.${tab}`)}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'active-tab' : ''}
            />
          ))}
        </div>

        <div className="filters">
          {filtersToShow.map((filter, idx) => (
            <button key={idx} className="filter-btn">
              {filter}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default ExploreCategories;
