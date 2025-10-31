import React, { useEffect, useState } from 'react';
import './ServiceDetails.css';
import { useTranslation } from 'react-i18next';

export default function ServiceDetailsSupplier() {
  const { t, i18n } = useTranslation('serviceDetails');

  const [service, setService] = useState({
    name: 'Logo Design',
    createdOn: '24/Mar/2025',
    time: '9:40 AM',
    status: 'Published',
    category: 'Design Services > Logo & Branding Design',
    description:
      'Our logo design service offers a creative and personalized approach to brand identity...',
    price: '50',
    negotiable: true,
    availability: 'Available 24/7',
    images: ['/images/sample1.png', '/images/sample2.png'],
  });

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n.language, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService((prev) => ({ ...prev, [name]: value }));
  };

  const toggleNegotiable = () => {
    setService((prev) => ({ ...prev, negotiable: !prev.negotiable }));
  };

  return (
    <div className="service-details">
      {/* HEADER */}
      <div className="sticky-header">
        <div className="header-left">
          <h1 className="service-title">{service.name}</h1>
          <div className="sub-info">
            <p>
              {t('createdOn')} {service.createdOn} – {service.time}
            </p>
            <p>
              {t('status.label')}{' '}
              <span className="status-badge">{t('status.published')}</span>
            </p>
          </div>
        </div>

        <div className="header-buttons">
          <button className="unpublish-btn">{t('buttons.unpublish')}</button>
          <button className="delete-btn">{t('buttons.delete')}</button>
        </div>
      </div>

      {/* BASIC INFO */}
      <section className="section">
        <h2>{t('basicInfo.title')}</h2>
        <div className="columns">
          <div className="left">
            <h3>{t('basicInfo.detailsTitle')}</h3>
            <p className="tip">{t('basicInfo.tipText')}</p>

            <label>{t('basicInfo.name')}</label>
            <input
              name="name"
              type="text"
              value={service.name}
              onChange={handleChange}
            />

            <label>{t('basicInfo.description')}</label>
            <textarea
              name="description"
              value={service.description}
              onChange={handleChange}
            />
          </div>

          <div className="right">
            <h3>{t('basicInfo.categoryTitle')}</h3>
            <p className="tip">{t('basicInfo.categoryTip')}</p>

            <label>{t('basicInfo.categoryLabel')}</label>
            <select
              name="category"
              value={service.category}
              onChange={handleChange}
            >
              <option>Design Services &gt; Logo & Branding Design</option>
              <option>Web Design</option>
              <option>Social Media Design</option>
            </select>
          </div>
        </div>
      </section>

      {/* IMAGES */}
      <section className="section">
        <h2>{t('images.title')}</h2>
        <p className="tip">{t('images.subtitle')}</p>
        <ul className="image-tips">
          <li>{t('images.tip1')}</li>
          <li>{t('images.tip2')}</li>
          <li>{t('images.tip3')}</li>
          <li>{t('images.tip4')}</li>
        </ul>

        {/* Image Upload Section */}
        <div className="image-gallery">
          {service.images.map((src, i) => (
            <div
              key={i}
              className="image-box"
              onClick={() => document.getElementById(`fileInput-${i}`).click()}
            >
              <img src={src} alt={`img-${i}`} />
              <input
                id={`fileInput-${i}`}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const newImages = [...service.images];
                      newImages[i] = reader.result;
                      setService({ ...service, images: newImages });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          ))}

          {/* Upload new image box */}
          <div
            className="upload-box"
            onClick={() => document.getElementById('newImageInput').click()}
          >
            <span>📤</span>
            <p>{t('images.upload')}</p>
            <input
              id="newImageInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setService((prev) => ({
                      ...prev,
                      images: [...prev.images, reader.result],
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>
      </section>

      {/* PRICE */}
      <section className="section">
        <h2>{t('price.title')}</h2>

        <label>{t('price.label')}</label>
        <div className="price-box">
          <input
            type="text"
            name="price"
            value={service.price}
            onChange={handleChange}
          />
          <span className="currency">{t('price.currency')}</span>
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={service.negotiable}
            onChange={toggleNegotiable}
          />
          <span>{t('price.note')}</span>
        </label>
      </section>

      {/* AVAILABILITY */}
      <section className="section">
        <h2>{t('availability.title')}</h2>
        <div className="availability">
          <select
            name="availability"
            value={service.availability}
            onChange={handleChange}
          >
            <option>Available 24/7</option>
            <option>Weekdays only</option>
            <option>Weekends only</option>
          </select>
        </div>
        <p className="availability-tip">{t('availability.note')}</p>
      </section>

      {/* SAVE */}
      <div className="save-btn">
        <button>{t('buttons.save')}</button>
      </div>
    </div>
  );
}
