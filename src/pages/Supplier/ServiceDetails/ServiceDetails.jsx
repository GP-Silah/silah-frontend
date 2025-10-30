import React, { useEffect, useState } from 'react';
import './ServiceDetails.css';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function ServiceDetailsSupplier() {
  const { t, i18n } = useTranslation('serviceDetails');
  const [service, setService] = useState(null);

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n.language, t]);

  useEffect(() => {
    // استبدلي هذا الرابط بالـ API الفعلي الخاص بعرض تفاصيل الخدمة
    axios
      .get('https://api.silah.site/api/supplier/services/123')
      .then((res) => setService(res.data))
      .catch((err) => console.error('Error fetching service:', err));
  }, []);

  if (!service) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="service-details-supplier">
      {/* ===== Header ===== */}
      <div className="header-section">
        <div className="header-left">
          <h2 className="service-title">{service.name}</h2>
          <p className="created-on">
            {t('createdOn')} {service.created_at} - {service.created_time}
          </p>
          <p className="status-line">
            {t('status.label')}{' '}
            <span className="status-badge published">
              {t('status.published')}
            </span>
          </p>
        </div>

        <div className="header-right">
          <button className="btn-unpublish">{t('buttons.unpublish')}</button>
          <button className="btn-delete">{t('buttons.delete')}</button>
        </div>
      </div>

      {/* ===== Basic Information ===== */}
      <section className="section basic-info">
        <h3 className="section-title">{t('basicInfo.title')}</h3>
        <div className="two-columns">
          <div className="left-column">
            <label>{t('basicInfo.name')}</label>
            <input type="text" value={service.name} readOnly />

            <label>{t('basicInfo.description')}</label>
            <textarea value={service.description} readOnly></textarea>
          </div>

          <div className="right-column">
            <label>{t('basicInfo.categoryTitle')}</label>
            <select disabled>
              <option>{service.category}</option>
            </select>
            <p className="category-tip">{t('basicInfo.tip')}</p>
          </div>
        </div>
      </section>

      {/* ===== Images ===== */}
      <section className="section images-section">
        <h3 className="section-title">{t('images.title')}</h3>
        <div className="image-tips">
          <ul>
            <li>{t('images.tip1')}</li>
            <li>{t('images.tip2')}</li>
            <li>{t('images.tip3')}</li>
          </ul>
        </div>
        <div className="image-gallery">
          {service.images && service.images.length > 0 ? (
            service.images.map((img, index) => (
              <div key={index} className="image-box">
                <img src={img} alt={`service-${index}`} />
              </div>
            ))
          ) : (
            <p>{t('images.noImages')}</p>
          )}
          <div className="image-upload">
            <span>📤</span>
            <p>{t('images.upload')}</p>
          </div>
        </div>
      </section>

      {/* ===== Price ===== */}
      <section className="section price-section">
        <h3 className="section-title">{t('price.title')}</h3>
        <div className="price-input">
          <label>{t('price.label')}</label>
          <input type="text" value={service.price} readOnly />
          <span className="currency">{t('price.currency')}</span>
        </div>
        {service.negotiable && (
          <label className="negotiable">
            <input type="checkbox" checked readOnly />
            {t('price.note')}
          </label>
        )}
      </section>

      {/* ===== Availability ===== */}
      <section className="section availability-section">
        <h3 className="section-title">{t('availability.title')}</h3>
        <div className="availability-box">{service.availability}</div>
        <p className="availability-note">{t('availability.note')}</p>
      </section>

      {/* ===== Save Button ===== */}
      <div className="footer-btn">
        <button className="btn-save">{t('buttons.save')}</button>
      </div>
    </div>
  );
}
