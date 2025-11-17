import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Button from '../../Button/Button';
import ItemCard from '../../ItemCard/ItemCard';
import styles from './ExploreCategories.module.css';

function ExploreCategories() {
  const { t, i18n } = useTranslation('landing');
  const [activeTab, setActiveTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // Fetch categories on mount + language change
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/categories/main?lang=${i18n.language.toLowerCase()}`,
        );
        const data = await response.json();
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, [i18n.language]);

  // Filter categories based on active tab
  const productCategories = categories.filter(
    (cat) => cat.usedFor === 'PRODUCT',
  );
  const serviceCategories = categories.filter(
    (cat) => cat.usedFor === 'SERVICE',
  );
  const filtersToShow =
    activeTab === 'products' ? productCategories : serviceCategories;

  // Handle category click → fetch items
  const handleCategoryClick = async (categoryId) => {
    setActiveCategory(categoryId);
    setLoading(true);
    setItems([]);

    try {
      const endpoint =
        activeTab === 'products'
          ? `${
              import.meta.env.VITE_BACKEND_URL
            }/api/search/products?category=${categoryId}`
          : `${
              import.meta.env.VITE_BACKEND_URL
            }/api/search/services?category=${categoryId}`;

      const response = await fetch(endpoint);
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles['explore-section']}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className={styles.title}>{t('exploreTitle')}</h2>
        <p className={styles.subtitle}>{t('exploreSubtitle')}</p>

        {/* Tabs */}
        <div className={styles.tabs}>
          {['products', 'services'].map((tab) => (
            <Button
              key={tab}
              label={t(`tabs.${tab}`)}
              onClick={() => {
                setActiveTab(tab);
                setItems([]);
                setActiveCategory(null);
              }}
              className={activeTab === tab ? styles['active-tab'] : ''}
            />
          ))}
        </div>

        {/* Category Filters */}
        <div className={styles.filters}>
          {filtersToShow.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`${styles['filter-btn']} ${
                activeCategory === cat.id ? styles['active-filter'] : ''
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        <div className={styles['results']}>
          {loading && (
            <div className={styles['spinner-container']}>
              <div className={styles.spinner}></div>
            </div>
          )}

          {!loading && items.length === 0 && activeCategory && (
            <p className={styles['no-results']}>
              {t('noResult', { activeTab: t(`tabs.${activeTab}`) })}
            </p>
          )}

          {!loading && items.length > 0 && (
            <div className={styles['cards-grid']}>
              {items.map((item) => (
                <ItemCard
                  key={item.productId || item.serviceId}
                  type={activeTab.slice(0, -1)} // "product" or "service"
                  item={item}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default ExploreCategories;
