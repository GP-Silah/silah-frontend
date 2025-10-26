import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Button from '../../Button/Button';
import ItemCard from '../../ItemCard/ItemCard';
import './ExploreCategories.css';

function ExploreCategories() {
  const { t, i18n } = useTranslation('landing');
  const [activeTab, setActiveTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/categories/main?lang=${i18n.language.toLowerCase()}`,
        );
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories by tab type
  const productCategories = categories.filter(
    (cat) => cat.usedFor === 'PRODUCT',
  );
  const serviceCategories = categories.filter(
    (cat) => cat.usedFor === 'SERVICE',
  );
  const filtersToShow =
    activeTab === 'products' ? productCategories : serviceCategories;

  // Fetch items when a category is selected
  const handleCategoryClick = async (categoryId) => {
    setActiveCategory(categoryId);
    setLoading(true);

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
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Tabs */}
        <div className="tabs">
          {['products', 'services'].map((tab) => (
            <Button
              key={tab}
              label={t(`tabs.${tab}`)}
              onClick={() => {
                setActiveTab(tab);
                setItems([]); // clear previous items
                setActiveCategory(null);
              }}
              className={activeTab === tab ? 'active-tab' : ''}
            />
          ))}
        </div>

        {/* Category Filters */}
        <div className="filters">
          {filtersToShow.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`filter-btn ${
                activeCategory === cat.id ? 'active-filter' : ''
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="results mt-6">
          {loading && (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          )}
          {!loading && items.length === 0 && activeCategory && (
            <p>{t('noResult', { activeTab: activeTab })}</p>
          )}
          {!loading && items.length > 0 && (
            <div className="cards-grid">
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
