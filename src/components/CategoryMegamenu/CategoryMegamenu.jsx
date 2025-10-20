import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryMegamenu.css';

export default function CategoryMegamenu({ categories, lang }) {
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const closeTimer = useRef(null);

  const products = categories.filter((c) => c.usedFor === 'PRODUCT');
  const services = categories.filter((c) => c.usedFor === 'SERVICE');

  const handleCategoryClick = (id) => {
    navigate(`/items?categoryId=${id}`);
  };

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPanelOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setPanelOpen(false);
      setHoveredCategory(null);
    }, 500); // 0.5 second delay
  };

  const mainLabel = lang === 'en' ? 'Category' : 'التصنيفات';
  const productsLabel = lang === 'en' ? 'Products' : 'المنتجات';
  const servicesLabel = lang === 'en' ? 'Services' : 'الخدمات';

  return (
    <div
      className={`category-megamenu ${lang === 'ar' ? 'rtl' : 'ltr'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="category-btn">{mainLabel}</button>

      <div className={`megamenu-panel ${panelOpen ? 'open' : ''}`}>
        <div className="categories-container">
          {/* Products Column */}
          <div className="megamenu-column">
            <h4>{productsLabel}</h4>
            <div className="category-grid">
              {products.map((cat) => (
                <div
                  key={cat.id}
                  className="main-category"
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                >
                  <span onClick={() => handleCategoryClick(cat.id)}>
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Services Column */}
          <div className="megamenu-column">
            <h4>{servicesLabel}</h4>
            <div className="category-grid">
              {services.map((cat) => (
                <div
                  key={cat.id}
                  className="main-category"
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                >
                  <span onClick={() => handleCategoryClick(cat.id)}>
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* <div className="divider"></div> */}

          {/* Subcategories Column */}
          <div className="subcategories-column">
            {hoveredCategory &&
              categories
                .find((c) => c.id === hoveredCategory)
                ?.subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="subcategory"
                    onClick={() => handleCategoryClick(sub.id)}
                  >
                    {sub.name}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
