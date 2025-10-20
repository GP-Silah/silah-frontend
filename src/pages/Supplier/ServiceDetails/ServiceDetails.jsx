import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../ProductDetails/SupplierProductDetails.css';

/* ========= */
async function mockFetchServiceById(id) {
  return {
    id,
    name: 'Logo Design',
    description:
      'Clean, modern logo design tailored to your brand. Includes iterations and export-ready files for print and digital use.',
    category: 'Design > Logos & Branding Design',
    images: ['/assets/mock/service1.jpg', '/assets/mock/service2.jpg'],
    price: 50,
    negotiable: true, // قابل للتفاوض
    currency: '﷼',
    status: 'PUBLISHED',
    createdAt: '2025-03-24T09:40:00Z',
    availability: '24/7', // التوفّر
  };
}
async function mockSaveService(payload) {
  console.log('Saving service (mock):', payload);
  return { ok: true };
}
/* =================================================================== */

export default function SupplierServiceDetails() {
  const { t, i18n } = useTranslation('service');
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const serviceId = search.get('id') || 'demo-svc-1';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    images: [],
    price: '',
    negotiable: false,
    currency: '﷼',
    status: 'PUBLISHED',
    createdAt: '',
    availability: '24/7',
  });

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t, i18n.language]);

  const createdAtFmt = useMemo(() => {
    if (!form.createdAt) return '';
    const d = new Date(form.createdAt);
    return d
      .toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(',', '');
  }, [form.createdAt, i18n.language]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await mockFetchServiceById(serviceId);
        setForm({ ...data });
      } catch {
        setError(t('errors.fetch'));
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId, t]);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  // تبديل حالة النشر Publish/Unpublish
  const handleTogglePublish = () => {
    setForm((prev) => ({
      ...prev,
      status: prev.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED',
    }));
    setMsg(
      t(
        `messages.${form.status === 'PUBLISHED' ? 'unpublished' : 'published'}`,
      ),
    );
    // لاحقًا: استدعاء API فعلي
  };

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');
    try {
      const res = await mockSaveService(form);
      if (res.ok) setMsg(t('messages.saved'));
      else setError(t('errors.save'));
    } catch {
      setError(t('errors.save'));
    } finally {
      setSaving(false);
    }
  }

  const handleTopAction = (type) => {
    if (type === 'unpublish') handleTogglePublish();
    console.log('Top action:', type, form.id);
  };

  if (loading)
    return (
      <div className="pd-container" dir={i18n.dir()} lang={i18n.language}>
        <div className="pd-skeleton">{t('loading')}</div>
      </div>
    );
  if (error)
    return (
      <div className="pd-container" dir={i18n.dir()} lang={i18n.language}>
        <div className="pd-error">{error}</div>
      </div>
    );

  return (
    <div className="pd-container" dir={i18n.dir()} lang={i18n.language}>
      {/* Header */}
      <div className="pd-header">
        <div>
          <h1 className="pd-title">{form.name}</h1>
          <div className="pd-subtitle">
            <span>{t('createdOn', { date: createdAtFmt })}</span>
            <span className={`pd-badge ${form.status?.toLowerCase()}`}>
              {t('serviceStatus')}:{' '}
              {t(`status.${form.status?.toLowerCase()}`, form.status)}
            </span>
          </div>
        </div>
        <div className="pd-actions">
          {/* نفس أماكن الأزرار، لكن لا يوجد Update Stock للخدمة */}
          <button
            className="pd-btn ghost"
            onClick={() => handleTopAction('unpublish')}
          >
            {form.status === 'PUBLISHED'
              ? t('actions.unpublish')
              : t('actions.publish')}
          </button>
          <button
            className="pd-btn danger"
            onClick={() => handleTopAction('delete')}
          >
            {t('actions.delete')}
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <section className="pd-card">
        <h2 className="pd-section-title">{t('sections.basicInfo')}</h2>
        <div className="pd-grid-2">
          <div>
            <label className="pd-label">{t('basic.serviceDetails')}</label>
            <div className="pd-help">{t('basic.serviceDetailsHelp')}</div>

            <div className="pd-field">
              <span className="pd-field-label">{t('basic.name')}</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                maxLength={240}
                placeholder={t('placeholders.name')}
              />
              <div className="pd-counter">{(form.name || '').length}/240</div>
            </div>

            <div className="pd-field">
              <span className="pd-field-label">{t('basic.description')}</span>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                maxLength={1000}
                placeholder={t('placeholders.description')}
              />
              <div className="pd-counter">
                {(form.description || '').length}/1000
              </div>
            </div>
          </div>

          <div>
            <label className="pd-label">{t('basic.serviceCategory')}</label>
            <div className="pd-help">{t('basic.serviceCategoryHelp')}</div>
            <div className="pd-field">
              <span className="pd-field-label">{t('basic.category')}</span>
              <select
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
              >
                <option value="">{t('basic.selectCategory')}</option>
                <option>Design &gt; Logos & Branding Design</option>
                <option>Design &gt; Social Media Design</option>
                <option>Marketing &gt; Content Writing</option>
                <option>IT &gt; Website Setup</option>
              </select>
              <div className="pd-note">
                {t('basic.willAppearIn')} {form.category || '—'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="pd-card">
        <h2 className="pd-section-title">{t('sections.images')}</h2>
        <div className="pd-grid-2">
          <div className="pd-image-tips">
            <h4>{t('images.tipsTitle')}</h4>
            <ul>
              <li>{t('images.t1')}</li>
              <li>{t('images.t2')}</li>
              <li>{t('images.t3')}</li>
              <li>{t('images.t4')}</li>
            </ul>
          </div>
          <div className="pd-image-list">
            {form.images?.map((src, i) => (
              <div className="pd-image-item" key={i}>
                <img src={src} alt={`service-${i}`} />
                <button
                  className="pd-img-del"
                  onClick={() => {
                    const arr = [...form.images];
                    arr.splice(i, 1);
                    setField('images', arr);
                  }}
                  aria-label={t('images.remove')}
                >
                  ×
                </button>
              </div>
            ))}
            <label className="pd-image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  setField('images', [...(form.images || []), url]);
                }}
              />
              <span>
                {t('images.upload')}
                <br />
                <small>.png / .jpg</small>
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Price */}
      <section className="pd-card">
        <h2 className="pd-section-title">{t('sections.price')}</h2>
        <div className="pd-field w-240">
          <span className="pd-field-label">{t('price.price')}</span>
          <div className="pd-input-prefix">
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
            />
            <span className="pd-prefix">{form.currency}</span>
          </div>
          <label className="pd-check">
            <input
              type="checkbox"
              checked={!!form.negotiable}
              onChange={(e) => setField('negotiable', e.target.checked)}
            />{' '}
            {t('price.negotiable')}
          </label>
          <div className="pd-help-sm">{t('price.note')}</div>
        </div>
      </section>

      {/* Service Details */}
      <section className="pd-card">
        <h2 className="pd-section-title">{t('sections.serviceDetails')}</h2>
        <div className="pd-grid-2">
          <div className="pd-field w-240">
            <span className="pd-field-label">{t('service.availability')}</span>
            <select
              value={form.availability}
              onChange={(e) => setField('availability', e.target.value)}
            >
              <option>24/7</option>
              <option>Weekdays</option>
              <option>Weekends</option>
            </select>
            <div className="pd-help-sm">{t('service.availabilityHelp')}</div>
          </div>
        </div>
      </section>

      {msg && <div className="pd-msg success">{msg}</div>}
      {error && <div className="pd-msg error">{error}</div>}

      <div className="pd-savebar">
        <button className="pd-btn primary" onClick={onSave} disabled={saving}>
          {saving ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
}
