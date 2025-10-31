import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SupplierProductDetails.css';

/* ===== Mock API مؤقتًا — بدّليها لاحقًا بالـendpoints الحقيقية ===== */
async function mockFetchProductById(id) {
  return {
    id,
    name: 'Amber - 250ml Soy Candle',
    description:
      'Experience the warm and inviting aroma of the Amber 250ml Soy Candle. Crafted with premium soy wax and an amber blend, it creates a cozy atmosphere with a clean burn and minimal soot. Ideal for gifting or enhancing home ambiance.',
    category: 'Home & Living > Furniture',
    images: ['/assets/mock/candle1.jpg', '/assets/mock/candle2.jpg'],
    pricePerUnit: 10,
    currency: '﷼',
    caseQty: 4,
    minOrderQty: 8,
    maxOrderQty: 'Unlimited',
    groupEnabled: true,
    groupMinQty: 8,
    groupDeadline: 'After 3 days',
    groupPricePerUnit: 7.5,
    status: 'PUBLISHED',
    createdAt: '2025-03-24T02:41:00Z',
    stockQty: 24, // 👈 كمية المخزون الحالية
  };
}
async function mockSaveProduct(payload) {
  console.log('Saving product (mock):', payload);
  return { ok: true };
}
/* =================================================================== */

/* ✅ ربط الكاتالوج المركزي */
import { useCatalog } from '../../context/catalog/CatalogProvider';

export default function SupplierProductDetails() {
  const { t, i18n } = useTranslation('product');
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  // لو عندك id بالـ query ?id=... أو جاي من navigate(state.id)
  const urlId = search.get('id') || 'demo-1';
  const incomingId = location.state?.id || null;
  const effectiveId = incomingId || urlId;

  // كاتالوج (المصدر المشترك)
  const { upsertItem, items } = useCatalog();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
    images: [],
    pricePerUnit: '',
    currency: '﷼',
    caseQty: 1,
    minOrderQty: 1,
    maxOrderQty: 'Unlimited',
    groupEnabled: true,
    groupMinQty: 1,
    groupDeadline: 'After 3 days',
    groupPricePerUnit: '',
    status: 'PUBLISHED',
    createdAt: '',
    stockQty: 0,
    favorite: false,
  });

  // مودال تحديث المخزون
  const [showStockModal, setShowStockModal] = useState(false);
  const [newStockQty, setNewStockQty] = useState('');

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

  // جلب البيانات (أو التحميل من الكاتالوج إن كانت موجودة)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // لو موجودة بالكاتالوج جاهزة، استخدمها مباشرةً
        const fromCatalog = items.find(
          (x) => x.id === effectiveId && x.type === 'product',
        );
        if (fromCatalog) {
          setForm((prev) => ({
            ...prev,
            id: fromCatalog.id,
            name: fromCatalog.name,
            description: prev.description, // إن كان عندك وصف محفوظ في الباك، بدليه لاحقًا
            category: prev.category,
            images: prev.images || [],
            pricePerUnit: fromCatalog.price ?? '',
            currency: prev.currency,
            caseQty: prev.caseQty,
            minOrderQty: prev.minOrderQty,
            maxOrderQty: prev.maxOrderQty,
            groupEnabled: prev.groupEnabled,
            groupMinQty: prev.groupMinQty,
            groupDeadline: prev.groupDeadline,
            groupPricePerUnit: prev.groupPricePerUnit,
            status: (fromCatalog.status || 'unpublished').toUpperCase(),
            createdAt: prev.createdAt,
            stockQty: fromCatalog.stock ?? 0,
            favorite: !!fromCatalog.favorite,
          }));
        } else {
          const data = await mockFetchProductById(effectiveId);
          setForm({ ...data });
          // مزامنة أولية مع الكاتالوج
          syncToCatalog({ ...data });
        }
      } catch {
        setError(t('errors.fetch'));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveId, t]);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  /* ✅ دالة مساعدة لتحديث الكاتالوج وفق حقلّات التفاصيل */
  const syncToCatalog = (data) => {
    const payload = {
      id: data.id || effectiveId || crypto.randomUUID(),
      type: 'product',
      name: data.name?.trim() || '',
      price: Number(data.pricePerUnit ?? 0),
      stock: Number(
        data.stockQty === '' || data.stockQty == null ? 0 : data.stockQty,
      ),
      status:
        (data.status || 'UNPUBLISHED').toString().toLowerCase() === 'published'
          ? 'published'
          : 'unpublished',
      img:
        (Array.isArray(data.images) && data.images[0]) ||
        '/assets/images/placeholder.png',
      favorite: !!data.favorite,
      images: data.images || [],
    };
    upsertItem(payload);
  };

  // تبديل حالة النشر Publish/Unpublish + مزامنة الكاتالوج
  const handleTogglePublish = () => {
    setForm((prev) => {
      const nextStatus =
        prev.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
      const next = { ...prev, status: nextStatus };
      setMsg(
        t(
          `messages.${
            nextStatus === 'PUBLISHED' ? 'published' : 'unpublished'
          }`,
        ),
      );
      syncToCatalog(next);
      return next;
    });
  };

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');
    try {
      const res = await mockSaveProduct(form);
      if (res.ok) {
        // ✅ حدّث الكاتالوج بالمعلومات النهائية
        syncToCatalog(form);
        setMsg(t('messages.saved'));
        // رجوع للّستنج
        navigate('/supplier/products-and-services');
      } else {
        setError(t('errors.save'));
      }
    } catch {
      setError(t('errors.save'));
    } finally {
      setSaving(false);
    }
  }

  // فتح/حفظ مودال تحديث المخزون
  const openStockModal = () => {
    setNewStockQty(form.stockQty?.toString() || '');
    setShowStockModal(true);
  };
  const applyStockUpdate = () => {
    const qty = Number(newStockQty || 0);
    const next = { ...form, stockQty: qty };
    setForm(next);
    setShowStockModal(false);
    setMsg(t('stock.updated'));
    // ✅ مزامنة مع الكاتالوج
    syncToCatalog(next);
  };

  const handleTopAction = (type) => {
    if (type === 'update-stock') openStockModal();
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
              {t('productStatus')}:{' '}
              {t(`status.${form.status?.toLowerCase()}`, form.status)}
            </span>
          </div>
        </div>
        <div className="pd-actions">
          <button
            className="pd-btn ghost"
            onClick={() => handleTopAction('update-stock')}
          >
            {t('actions.updateStock')}
          </button>
          <button
            className="pd-btn ghost"
            onClick={() => handleTopAction('unpublish')}
          >
            {form.status === 'PUBLISHED'
              ? t('actions.unpublish')
              : t('actions.publish')}
          </button>
          <button
            className="pd-btn ghost"
            onClick={() => handleTopAction('predict-demand')}
          >
            {t('actions.predictDemand')}
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
            <label className="pd-label">{t('basic.productDetails')}</label>
            <div className="pd-help">{t('basic.productDetailsHelp')}</div>

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
            <label className="pd-label">{t('basic.productCategory')}</label>
            <div className="pd-help">{t('basic.productCategoryHelp')}</div>
            <div className="pd-field">
              <span className="pd-field-label">{t('basic.category')}</span>
              <select
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
              >
                <option value="">{t('basic.selectCategory')}</option>
                <option>Home & Living &gt; Furniture</option>
                <option>Home & Living &gt; Decor</option>
                <option>Beauty & Personal Care</option>
                <option>Gifts & Bundles</option>
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
                <img src={src} alt={`product-${i}`} />
                <button
                  className="pd-img-del"
                  onClick={() => {
                    const arr = [...form.images];
                    arr.splice(i, 1);
                    setField('images', arr);
                    // مزامنة فورية اختيارية
                    syncToCatalog({ ...form, images: arr });
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
                  const arr = [...(form.images || []), url];
                  setField('images', arr);
                  // مزامنة فورية اختيارية
                  syncToCatalog({ ...form, images: arr });
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
          <span className="pd-field-label">{t('price.pricePerUnit')}</span>
          <div className="pd-input-prefix">
            <input
              type="number"
              step="0.01"
              value={form.pricePerUnit}
              onChange={(e) => setField('pricePerUnit', e.target.value)}
              onBlur={() =>
                syncToCatalog({ ...form, pricePerUnit: e.target.value })
              }
            />
            <span className="pd-prefix">{form.currency}</span>
          </div>
        </div>
      </section>

      {/* Order Requirements */}
      <section className="pd-card">
        <h2 className="pd-section-title">{t('sections.orderReq')}</h2>
        <div className="pd-grid-3">
          <div className="pd-field">
            <span className="pd-field-label">{t('order.caseQty')}</span>
            <input
              type="number"
              min="1"
              value={form.caseQty}
              onChange={(e) => setField('caseQty', Number(e.target.value || 1))}
            />
            <div className="pd-help-sm">{t('order.caseHint')}</div>
          </div>

          <div className="pd-field">
            <span className="pd-field-label">{t('order.minOrderQty')}</span>
            <input
              type="number"
              min="1"
              value={form.minOrderQty}
              onChange={(e) =>
                setField('minOrderQty', Number(e.target.value || 1))
              }
            />
            <div className="pd-help-sm">{t('order.minHint')}</div>
          </div>

          <div className="pd-field">
            <span className="pd-field-label">{t('order.maxOrderQty')}</span>
            <select
              value={form.maxOrderQty}
              onChange={(e) => setField('maxOrderQty', e.target.value)}
            >
              <option>Unlimited</option>
              <option>50</option>
              <option>100</option>
              <option>250</option>
              <option>500</option>
            </select>
            <div className="pd-help-sm">{t('order.maxHint')}</div>
          </div>
        </div>
      </section>

      {/* Group Purchasing */}
      <section className="pd-card">
        <h2 className="pd-section-title">{t('sections.group')}</h2>

        <div className="pd-field">
          <span className="pd-field-label">{t('group.enable')}</span>
          <div className="pd-radio">
            <label>
              <input
                type="radio"
                checked={!!form.groupEnabled}
                onChange={() => setField('groupEnabled', true)}
              />{' '}
              {t('yes')}
            </label>
            <label>
              <input
                type="radio"
                checked={!form.groupEnabled}
                onChange={() => setField('groupEnabled', false)}
              />{' '}
              {t('no')}
            </label>
          </div>
          <div className="pd-help-sm">{t('group.help')}</div>
        </div>

        {form.groupEnabled && (
          <div className="pd-grid-3">
            <div className="pd-field">
              <span className="pd-field-label">{t('group.minQty')}</span>
              <input
                type="number"
                min="1"
                value={form.groupMinQty}
                onChange={(e) =>
                  setField('groupMinQty', Number(e.target.value || 1))
                }
              />
            </div>

            <div className="pd-field">
              <span className="pd-field-label">{t('group.deadline')}</span>
              <select
                value={form.groupDeadline}
                onChange={(e) => setField('groupDeadline', e.target.value)}
              >
                <option>{t('group.afterXDays', { n: 3 })}</option>
                <option>{t('group.afterXDays', { n: 5 })}</option>
                <option>{t('group.afterXDays', { n: 7 })}</option>
              </select>
            </div>

            <div className="pd-field">
              <span className="pd-field-label">{t('group.pricePerUnit')}</span>
              <div className="pd-input-prefix">
                <input
                  type="number"
                  step="0.01"
                  value={form.groupPricePerUnit}
                  onChange={(e) =>
                    setField('groupPricePerUnit', e.target.value)
                  }
                />
                <span className="pd-prefix">{form.currency}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {msg && <div className="pd-msg success">{msg}</div>}
      {error && <div className="pd-msg error">{error}</div>}

      <div className="pd-savebar">
        <button className="pd-btn primary" onClick={onSave} disabled={saving}>
          {saving ? t('saving') : t('save')}
        </button>
      </div>

      {/* ===== Modal: Update Stock ===== */}
      {showStockModal && (
        <div
          className="pd-modal-overlay"
          onClick={() => setShowStockModal(false)}
        >
          <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="pd-modal-title">{t('stock.title')}</h3>
            <div className="pd-modal-row">
              <span className="pd-modal-label">{t('stock.current')}</span>
              <span className="pd-modal-value">{form.stockQty}</span>
            </div>
            <div className="pd-modal-row">
              <label className="pd-modal-label" htmlFor="newStockQty">
                {t('stock.newQty')}
              </label>
              <input
                id="newStockQty"
                type="number"
                className="pd-modal-input"
                value={newStockQty}
                onChange={(e) => setNewStockQty(e.target.value)}
              />
            </div>
            <div className="pd-modal-actions">
              <button className="pd-btn primary" onClick={applyStockUpdate}>
                {t('stock.update')}
              </button>
              <button
                className="pd-btn ghost"
                onClick={() => setShowStockModal(false)}
              >
                {t('stock.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== End Modal ===== */}
    </div>
  );
}
