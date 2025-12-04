import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SupplierSelectSubCategory from '@/components/SupplierSelectSubCategory/SupplierSelectSubCategory';
import { FiPackage, FiClock } from 'react-icons/fi';
import { FaRegEye, FaRegEyeSlash, FaRegTrashAlt } from 'react-icons/fa';
import './SupplierProductDetails.css';

/* ======================================================== */

export default function SupplierProductDetails() {
  const { t, i18n } = useTranslation('product');
  const { id: productId } = useParams();
  const isCreateMode = productId === 'new';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [categoryDetails, setCategoryDetails] = useState(null);

  const groupDeadlineMap = {
    [t('groupPurchasing.afterXDays', { n: 3 })]: 'THREE_DAYS',
    [t('groupPurchasing.afterXDays', { n: 5 })]: 'FIVE_DAYS',
    [t('groupPurchasing.afterXDays', { n: 7 })]: 'SEVEN_DAYS',
  };

  const LOCAL_STORAGE_KEY = 'newProductForm';

  const [form, setForm] = useState(() => {
    const emptyForm = {
      id: null,
      name: '',
      description: '',
      category: '',
      images: [],
      _newFiles: [],
      pricePerUnit: '',
      currency: '﷼',
      caseQty: 1,
      minOrderQty: 1,
      maxOrderQty: 'Unlimited',
      groupEnabled: false,
      groupMinQty: 1,
      groupDeadline: 'After 3 days',
      groupPricePerUnit: '',
      status: 'UNPUBLISHED',
      createdAt: '',
      stockQty: 0,
    };

    if (isCreateMode) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...emptyForm,
            ...parsed,
            pricePerUnit: Number(parsed.pricePerUnit || 0),
            groupPricePerUnit: Number(parsed.groupPricePerUnit || 0),
            caseQty: Number(parsed.caseQty || 1),
            minOrderQty: Number(parsed.minOrderQty || 1),
            maxOrderQty:
              parsed.maxOrderQty === 'Unlimited'
                ? 'Unlimited'
                : Number(parsed.maxOrderQty || 1),
            groupMinQty: Number(parsed.groupMinQty || 1),
            stockQty: Number(parsed.stockQty || 0),
          };
        } catch (e) {
          console.error('Failed to parse localStorage data:', e);
          return emptyForm; // Fallback to emptyForm on error
        }
      }
      return emptyForm;
    } else {
      return emptyForm;
    }
  });

  useEffect(() => {
    if (isCreateMode) {
      const { images, _newFiles, ...rest } = form; // exclude images
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rest));
    }
  }, [form]);

  async function createProduct() {
    const formData = new FormData();
    const dto = {
      name: form.name,
      description: form.description,
      price: Number(form.pricePerUnit),
      stock: form.stockQty,
      categoryId: Number(form.category),
      caseQuantity: Number(form.caseQty),
      minOrderQuantity: Number(form.minOrderQty),
      maxOrderQuantity:
        form.maxOrderQty === 'Unlimited' ? null : Number(form.maxOrderQty),
      allowGroupPurchase: form.groupEnabled,
      minGroupOrderQuantity: Number(form.groupMinQty),
      groupPurchasePrice: form.groupPricePerUnit
        ? Number(form.groupPricePerUnit)
        : null,
      groupPurchaseDuration:
        groupDeadlineMap[form.groupDeadline] || 'THREE_DAYS',
      isPublished: form.status === 'PUBLISHED',
    };
    formData.append('dto', JSON.stringify(dto));

    // Add images (files only)
    (form._newFiles || []).forEach((file) => formData.append('files', file));

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/products`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include',
      },
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data?.error?.message || 'Failed to create product');
    return data;
  }

  async function updateProduct() {
    const formData = new FormData();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.pricePerUnit),
      stock: form.stockQty,
      categoryId: Number(form.category),
      caseQuantity: Number(form.caseQty),
      minOrderQuantity: Number(form.minOrderQty),
      maxOrderQuantity:
        form.maxOrderQty === 'Unlimited' ? null : Number(form.maxOrderQty),
      allowGroupPurchase: form.groupEnabled,
      minGroupOrderQuantity: Number(form.groupMinQty),
      groupPurchasePrice: form.groupPricePerUnit
        ? Number(form.groupPricePerUnit)
        : null,
      groupPurchaseDuration:
        groupDeadlineMap[form.groupDeadline] || 'THREE_DAYS',
      isPublished: form.status === 'PUBLISHED',
    };

    // Add images in create mode
    (form._newFiles || []).forEach((file) => formData.append('files', file));

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      },
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data?.error?.message || 'Failed to update product');
    return data;
  }

  const uploadProductImage = async (file) => {
    if (!productId || isCreateMode) return;
    if (!file) return;

    if (form.images.length >= 3) {
      setError('A maximum of 3 images is allowed');
      return;
    }

    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setSaving(true);
      setError('');
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}/images`,
        {
          method: 'PATCH',
          body: formData,
          credentials: 'include',
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error?.message || 'Failed to upload image');

      // Add new image URL to local state
      setForm((p) => ({
        ...p,
        images: [
          ...(p.images || []),
          {
            url: data.imagesFilesUrls.slice(-1)[0],
            fileName: data.imagesFilesNames.slice(-1)[0] || null,
          },
        ],
      }));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  async function deleteImage(fileName, idx) {
    if (!productId || isCreateMode) return;
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/products/${productId}/image/${fileName}`,
        { method: 'DELETE', credentials: 'include' },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error?.message || 'Failed to delete image');

      // Update local form.images (URLs)
      setForm((p) => ({
        ...p,
        images: p.images.filter((_, i) => i !== idx),
      }));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  async function deleteProduct() {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error?.message || 'Failed to delete product');
      navigate('/supplier/listings');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // input-level validation state
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    images: '',
    minOrderQty: '',
    maxOrderQty: '',
    groupPricePerUnit: '',
  });

  const [touched, setTouched] = useState({
    // name: false,
    // description: false,
    pricePerUnit: false,
  });

  // stock modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [newStockQty, setNewStockQty] = useState('');

  useEffect(() => {
    if (isCreateMode) {
      document.title = t('pageTitleCreate');
    } else {
      document.title = form.name || t('pageTitle');
    }
  }, [form.name, isCreateMode, t]);

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
    if (isCreateMode) {
      setLoading(false); // <--- this ensures form renders
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`,
          {
            credentials: 'include',
          },
        );

        const data = await res.json();
        if (!res.ok || data.isDeleted)
          throw new Error(data?.error?.message || 'Failed to load product');

        setForm({
          ...form,
          id: data.productId,
          name: data.name,
          description: data.description,
          category: data.category?.id || '',
          images:
            data.imagesFilesUrls.map((url, i) => ({
              url,
              fileName: data.imagesFilesNames[i],
            })) || [],
          pricePerUnit: data.price,
          currency: '﷼',
          caseQty: data.caseQuantity,
          minOrderQty: data.minOrderQuantity,
          maxOrderQty: data.maxOrderQuantity || 'Unlimited',
          groupEnabled: data.allowGroupPurchase,
          groupMinQty: data.minGroupOrderQuantity,
          groupDeadline: data.groupPurchaseDuration,
          groupPricePerUnit: data.groupPurchasePrice,
          status: data.isPublished ? 'PUBLISHED' : 'UNPUBLISHED',
          stockQty: data.stock,
          createdAt: data.createdAt,
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, i18n.language]);

  // fetch category details when category id exists
  useEffect(() => {
    if (!form.category) {
      setCategoryDetails(null);
      return;
    }
    const fetchCategory = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/categories/${
            form.category
          }?lang=${i18n.language}`,
        );
        if (!res.ok) throw new Error('category not found');
        const data = await res.json();
        setCategoryDetails(data);
      } catch (err) {
        console.error('fetch category error', err);
        setCategoryDetails(null);
      }
    };
    fetchCategory();
  }, [form.category, i18n.language]);

  const setField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* ------- Validation helpers ------- */
  useEffect(() => {
    // name validation
    if ((form.name || '').length > 60) {
      setErrors((e) => ({ ...e, name: t('validation.nameTooLong') }));
    } else setErrors((e) => ({ ...e, name: '' }));

    // description validation
    if ((form.description || '').length > 1000) {
      setErrors((e) => ({
        ...e,
        description: t('validation.descriptionTooLong'),
      }));
    } else setErrors((e) => ({ ...e, description: '' }));

    // Validate images
    const imageCount = isCreateMode
      ? (form._newFiles || []).length
      : (form.images || []).length;

    if (imageCount === 0) {
      setErrors((e) => ({ ...e, images: t('validation.imageRequired') }));
      return;
    } else {
      setErrors((e) => ({ ...e, images: '' }));
    }

    // pricePerUnit validation (now wrapped without return)
    if (touched.pricePerUnit) {
      if (
        form.pricePerUnit === '' ||
        form.pricePerUnit === null ||
        form.pricePerUnit === undefined
      ) {
        setErrors((e) => ({
          ...e,
          pricePerUnit: t('validation.priceRequired'),
        }));
      } else if (form.pricePerUnit < 0) {
        setErrors((e) => ({
          ...e,
          pricePerUnit: t('validation.pricePositive'),
        }));
      } else {
        setErrors((e) => ({ ...e, pricePerUnit: '' }));
      }
    } else {
      // Optionally clear error if not touched (avoids showing initial errors)
      setErrors((e) => ({ ...e, pricePerUnit: '' }));
    }

    // minOrder multiple-of-case validation
    if (Number(form.minOrderQty) <= 0) {
      setErrors((e) => ({ ...e, minOrderQty: t('validation.positiveNumber') }));
    } else if (Number(form.minOrderQty) % Number(form.caseQty) !== 0) {
      setErrors((e) => ({
        ...e,
        minOrderQty: t('orderRequirements.minQtyValidation'),
      }));
    } else {
      setErrors((e) => ({ ...e, minOrderQty: '' }));
    }

    // maxOrder validation (if numeric)
    if (form.maxOrderQty !== 'Unlimited') {
      const maxVal = Number(form.maxOrderQty || 0);
      if (maxVal <= 0) {
        setErrors((e) => ({
          ...e,
          maxOrderQty: t('validation.positiveNumber'),
        }));
      } else if (maxVal % Number(form.caseQty) !== 0) {
        setErrors((e) => ({
          ...e,
          maxOrderQty: t('orderRequirements.maxQtyValidation'),
        }));
      } else setErrors((e) => ({ ...e, maxOrderQty: '' }));
    } else {
      setErrors((e) => ({ ...e, maxOrderQty: '' }));
    }

    // group price: must be positive and less than standard price if set
    if (form.groupEnabled) {
      if (
        form.groupPricePerUnit === '' ||
        form.groupPricePerUnit === null ||
        form.groupPricePerUnit === undefined
      ) {
        setErrors((e) => ({
          ...e,
          groupPricePerUnit: t('validation.priceRequired'),
        }));
      }

      const gp = Number(form.groupPricePerUnit);
      const sp = Number(form.pricePerUnit);

      if (Number.isNaN(gp) || gp <= 0) {
        setErrors((e) => ({
          ...e,
          groupPricePerUnit: t('validation.positiveNumber'),
        }));
      } else if (sp && gp >= sp) {
        setErrors((e) => ({
          ...e,
          groupPricePerUnit: t('validation.groupPriceLessThanPrice'),
        }));
      } else {
        setErrors((e) => ({ ...e, groupPricePerUnit: '' }));
      }
    } else {
      setErrors((e) => ({ ...e, groupPricePerUnit: '' }));
    }
  }, [
    form.name,
    form.description,
    form.images,
    form.pricePerUnit,
    touched.pricePerUnit,
    form.caseQty,
    form.minOrderQty,
    form.maxOrderQty,
    form.groupEnabled,
    form.groupPricePerUnit,
    t,
  ]);

  const hasErrors = Object.values(errors).some(Boolean);

  /* ------- Actions ------- */
  const handleTogglePublish = () => {
    setForm((p) => {
      const newStatus = p.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
      setMsg(
        t(
          `messages.${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'}`,
        ),
      );
      return { ...p, status: newStatus };
    });
  };

  async function onSave(e) {
    e.preventDefault();

    const imageCount = isCreateMode
      ? (form._newFiles || []).length
      : (form.images || []).length;

    if (imageCount === 0) {
      setErrors((e) => ({ ...e, images: t('validation.imageRequired') }));
      return;
    } else {
      setErrors((e) => ({ ...e, images: '' }));
    }

    if (hasErrors) return;
    setSaving(true);
    setMsg('');
    setError('');

    try {
      let data;
      if (isCreateMode) {
        data = await createProduct();
        localStorage.removeItem(LOCAL_STORAGE_KEY); // clear auto-save after save
      } else {
        data = await updateProduct();
      }
      setMsg(t('messages.saved'));
      if (isCreateMode) navigate(`/supplier/products/${data.productId}`); // go to new product page
    } catch (err) {
      console.error(err);
      setError(err.message || t('errors.save'));
    } finally {
      setSaving(false);
    }
  }

  const openStockModal = () => {
    setNewStockQty(String(form.stockQty || ''));
    setShowStockModal(true);
  };

  const applyStockUpdate = async () => {
    const qty = Number(newStockQty || 0);
    setSaving(true);
    setError('');
    setMsg('');

    try {
      const payload = { stock: qty };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update stock');

      setForm((p) => ({ ...p, stockQty: qty }));
      setShowStockModal(false);
      setMsg(t('stock.updated'));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ------- Images handling ------- */
  // Add image (create mode vs update mode)
  const onAddImage = async (file) => {
    if (!file) return;

    if (isCreateMode) {
      // Preview locally before saving to backend
      const previewUrl = URL.createObjectURL(file);
      setForm((p) => ({
        ...p,
        images: [...(p.images || []), { url: previewUrl, fileName: null }],
        _newFiles: [...(p._newFiles || []), file],
      }));
      return;
    }

    // Update mode → upload immediately
    await uploadProductImage(file);
  };

  const onRemoveImage = (idx) => {
    const imageCount = isCreateMode
      ? form._newFiles.length
      : form.images.length;

    if (imageCount <= 1) {
      setErrors((e) => ({ ...e, images: t('validation.imageRequired') }));

      // Clear the error automatically after 2 seconds
      setTimeout(() => {
        setErrors((e) => ({ ...e, images: '' }));
      }, 2000);

      return; // Prevent removal
    }

    if (isCreateMode) {
      setForm((p) => {
        const newImages = p.images.filter((_, i) => i !== idx);
        return {
          ...p,
          images: newImages,
          _newFiles: (p._newFiles || []).filter((_, i) => i !== idx),
        };
      });
      return;
    }

    const fileName = form.images[idx].fileName;
    deleteImage(fileName, idx);
  };

  if (loading) {
    return (
      <div className="pd-container" dir={i18n.dir()} lang={i18n.language}>
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pd-container" dir={i18n.dir()} lang={i18n.language}>
        <div className="pd-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="pd-container" dir={i18n.dir()} lang={i18n.language}>
      {/* Header */}
      <div className="pd-header">
        <div>
          <h1 className="pd-title">{form.name || t('basic.productDetails')}</h1>
          <div className="pd-subtitle">
            <span>{t('createdOn', { date: createdAtFmt })}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <span className={`pd-badge ${form.status?.toLowerCase()}`}>
              {t('productStatus')}:{' '}
              {t(`status.${form.status?.toLowerCase()}`, form.status)}
            </span>
          </div>
        </div>

        <div className="pd-actions">
          <button
            className="pd-btn ghost"
            onClick={openStockModal}
            disabled={isCreateMode} // <-- disable in create mode
          >
            <FiPackage /> {t('actions.updateStock')}
          </button>

          <button className="pd-btn ghost" onClick={handleTogglePublish}>
            {form.status === 'PUBLISHED' ? (
              <FaRegEyeSlash style={{ marginInlineEnd: 8 }} />
            ) : (
              <FaRegEye style={{ marginInlineEnd: 8 }} />
            )}
            {form.status === 'PUBLISHED'
              ? t('actions.unpublish')
              : t('actions.publish')}
          </button>

          <button
            className="pd-btn ghost"
            onClick={() => navigate(`/supplier/demand/${productId}`)}
            disabled={isCreateMode} // <-- disable in create mode
          >
            <FiClock /> {t('actions.predictDemand')}
          </button>

          <button
            className="pd-btn danger"
            onClick={deleteProduct}
            disabled={isCreateMode} // <-- disable in create mode
          >
            <FaRegTrashAlt />
            {t('actions.delete')}
          </button>
        </div>
      </div>

      {/* Basic Info */}
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
                maxLength={60}
                placeholder={t('placeholders.name')}
              />
              <div
                className={`pd-counter ${
                  form.name.length > 60 ? 'invalid' : ''
                }`}
              >
                {form.name.length}/60
              </div>
              {errors.name && (
                <div className="pd-error-text">{errors.name}</div>
              )}
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
              <div
                className={`pd-counter ${
                  form.description.length > 1000 ? 'invalid' : ''
                }`}
              >
                {form.description.length}/1000
              </div>
              {errors.description && (
                <div className="pd-error-text">{errors.description}</div>
              )}
            </div>
          </div>

          <div>
            <label className="pd-label">{t('basic.productCategory')}</label>
            <div className="pd-help">{t('basic.productCategoryHelp')}</div>

            <div className="pd-field">
              <span className="pd-field-label">{t('basic.category')}</span>
              <SupplierSelectSubCategory
                value={form.category}
                onChange={(selectedId) => setField('category', selectedId)}
                usedFor="products"
              />
              <div className="pd-note">
                {t('basic.willAppearIn')}{' '}
                {categoryDetails
                  ? `${categoryDetails.parentCategory?.name || ''} > ${
                      categoryDetails.name
                    }`
                  : '—'}
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
            <div className="pd-help-sm">{t('images.uploadHint')}</div>
          </div>

          <div className="pd-image-list">
            {(form.images || []).map((img, i) => (
              <div key={i} className="pd-image-item">
                <img src={img.url} alt={`product-${i}`} />
                <div className="delete-image-icon-bg">
                  <button
                    type="button"
                    className="pd-btn-image-delete"
                    aria-label={t('images.remove')}
                    onClick={(e) => {
                      e.stopPropagation(); // <---- ensure click isn't blocked by parent
                      e.preventDefault();
                      onRemoveImage(i);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {form.images.length < 3 && (
              <label className="pd-image-upload" style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={(e) => onAddImage(e.target.files?.[0])}
                />
                <span>
                  {t('images.upload')}
                  <br />
                  <small>.png / .jpg / .jpeg / .webp</small>
                </span>
              </label>
            )}

            {errors.images && (
              <div className="pd-error-text">{errors.images}</div>
            )}
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
              min="0"
              value={form.pricePerUnit}
              onChange={(e) => {
                const val = e.target.value;
                // Only allow digits (and dot if you want decimals)
                if (val === '') {
                  setField('pricePerUnit', '');
                } else {
                  const num = Number(val);
                  setField('pricePerUnit', isNaN(num) ? '' : num);
                }
              }}
              onBlur={() => setTouched((t) => ({ ...t, pricePerUnit: true }))}
            />
            <img src="/riyal.png" alt="SAR" className="sar" />
          </div>
          {errors.pricePerUnit && (
            <div className="pd-error-text">{errors.pricePerUnit}</div>
          )}
        </div>
      </section>

      {/* Order Requirements: two-column grid (left inputs, right explanations) */}
      <section className="pd-card">
        <h2 className="pd-section-title">{t('orderRequirements.title')}</h2>

        <div className="or-grid">
          {/* left: inputs */}
          <div className="or-left">
            <div className="pd-field">
              <span className="pd-field-label">
                {t('orderRequirements.caseQty')}
              </span>
              <input
                type="number"
                min="1"
                value={form.caseQty}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value || 1));
                  setField('caseQty', val);

                  // Adjust min/max order if they fall below new caseQty
                  if (form.minOrderQty < val) setField('minOrderQty', val);
                  if (
                    form.maxOrderQty !== 'Unlimited' &&
                    form.maxOrderQty < val
                  )
                    setField('maxOrderQty', val);
                }}
              />
            </div>

            <div className="pd-field">
              <span className="pd-field-label">
                {t('orderRequirements.minQty')}
              </span>
              <input
                type="number"
                min={form.caseQty || 1}
                value={form.minOrderQty}
                onChange={(e) =>
                  setField(
                    'minOrderQty',
                    e.target.value ? Number(e.target.value) : '',
                  )
                }
                onBlur={() => {
                  // Round up to nearest multiple of caseQty when leaving input
                  let val = form.minOrderQty;
                  if (val % form.caseQty !== 0) {
                    val = Math.ceil(val / form.caseQty) * form.caseQty;
                    setField('minOrderQty', val);
                  }
                  // Adjust maxOrderQty if needed
                  if (
                    form.maxOrderQty !== 'Unlimited' &&
                    form.maxOrderQty < val
                  ) {
                    setField('maxOrderQty', val);
                  }
                }}
              />

              {errors.minOrderQty && (
                <div className="pd-error-text">{errors.minOrderQty}</div>
              )}
            </div>

            <div className="pd-field">
              <span className="pd-field-label">
                {t('orderRequirements.maxQty')}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min={form.minOrderQty || form.caseQty || 1}
                  value={
                    form.maxOrderQty !== 'Unlimited' ? form.maxOrderQty : ''
                  }
                  onChange={(e) =>
                    setField(
                      'maxOrderQty',
                      e.target.value ? Number(e.target.value) : '',
                    )
                  }
                  onBlur={() => {
                    if (
                      form.maxOrderQty !== 'Unlimited' &&
                      form.maxOrderQty % form.caseQty !== 0
                    ) {
                      const val =
                        Math.ceil(form.maxOrderQty / form.caseQty) *
                        form.caseQty;
                      setField('maxOrderQty', val);
                    }
                  }}
                  disabled={form.maxOrderQty === 'Unlimited'}
                />

                <label
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <input
                    type="checkbox"
                    checked={form.maxOrderQty === 'Unlimited'}
                    onChange={(e) =>
                      setField(
                        'maxOrderQty',
                        e.target.checked ? 'Unlimited' : form.minOrderQty,
                      )
                    }
                  />{' '}
                  {t('orderRequirements.unlimited')}
                </label>
              </div>
              {errors.maxOrderQty && (
                <div className="pd-error-text">{errors.maxOrderQty}</div>
              )}
            </div>
          </div>

          {/* right: explanation text */}
          <div className="or-right">
            <div className="or-explain">
              <h4>{t('orderRequirements.caseQty')}</h4>
              <p>{t('orderRequirements.caseQtyHelp')}</p>
            </div>

            <div className="or-explain">
              <h4>{t('orderRequirements.minQty')}</h4>
              <p>{t('orderRequirements.minQtyHelp')}</p>
            </div>

            <div className="or-explain">
              <h4>{t('orderRequirements.maxQty')}</h4>
              <p>{t('orderRequirements.maxQtyHelp')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Group Purchasing */}
      <section className="pd-card">
        <h2 className="pd-section-title">{t('groupPurchasing.title')}</h2>

        <div className="or-grid">
          <div className="or-left">
            <div className="pd-field">
              <label className="pd-field-label">
                <input
                  type="checkbox"
                  checked={!!form.groupEnabled}
                  onChange={(e) => setField('groupEnabled', e.target.checked)}
                />{' '}
                {t('groupPurchasing.enabled')}
              </label>
            </div>

            {form.groupEnabled && (
              <>
                <div className="pd-field">
                  <span className="pd-field-label">
                    {t('groupPurchasing.minQty')}
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={form.groupMinQty}
                    onChange={(e) =>
                      setField('groupMinQty', Number(e.target.value || 1))
                    }
                  />
                </div>

                <div className="pd-field">
                  <span className="pd-field-label">
                    {t('groupPurchasing.deadline')}
                  </span>
                  <select
                    value={form.groupDeadline}
                    onChange={(e) => setField('groupDeadline', e.target.value)}
                  >
                    <option value={t('groupPurchasing.afterXDays', { n: 3 })}>
                      {t('groupPurchasing.afterXDays', { n: 3 })}
                    </option>
                    <option value={t('groupPurchasing.afterXDays', { n: 5 })}>
                      {t('groupPurchasing.afterXDays', { n: 5 })}
                    </option>
                    <option value={t('groupPurchasing.afterXDays', { n: 7 })}>
                      {t('groupPurchasing.afterXDays', { n: 7 })}
                    </option>
                  </select>
                </div>

                <div className="pd-field">
                  <span className="pd-field-label">
                    {t('groupPurchasing.pricePerUnit')}
                  </span>
                  <div className="pd-input-prefix">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.groupPricePerUnit}
                      onChange={(e) =>
                        setField('groupPricePerUnit', e.target.value)
                      }
                    />
                    <img src="/riyal.png" alt="SAR" className="sar" />
                  </div>
                  {errors.groupPricePerUnit && (
                    <div className="pd-error-text">
                      {errors.groupPricePerUnit}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="or-right">
            <div className="or-explain">
              <h4>{t('groupPurchasing.enabledHelpTitle')}</h4>
              <p>{t('groupPurchasing.enabledHelp')}</p>
            </div>

            <div className="or-explain">
              <h4>{t('groupPurchasing.minQty')}</h4>
              <p>{t('groupPurchasing.minQtyHelp')}</p>
            </div>

            <div className="or-explain">
              <h4>{t('groupPurchasing.deadline')}</h4>
              <p>{t('groupPurchasing.deadlineHelp')}</p>
            </div>
          </div>
        </div>
      </section>

      {msg && <div className="pd-msg success">{msg}</div>}
      {error && <div className="pd-msg error">{error}</div>}

      <div className="pd-savebar center">
        <button
          className="pd-btn primary"
          onClick={onSave}
          disabled={saving || hasErrors}
        >
          {saving ? t('saving') : t('save')}
        </button>
      </div>

      {/* Stock modal */}
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
                className="pd-modal-input"
                type="number"
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
    </div>
  );
}
