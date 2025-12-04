import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SupplierSelectSubCategory from '@/components/SupplierSelectSubCategory/SupplierSelectSubCategory';
import { FaRegEye, FaRegEyeSlash, FaRegTrashAlt } from 'react-icons/fa';
import '../Products/SupplierProductDetails.css'; // Reuse the same CSS

// ======================================
// Main Component
// ======================================
export default function SupplierServiceDetails() {
  const { t, i18n } = useTranslation('service');
  const { id: serviceId } = useParams();
  const isCreateMode = serviceId === 'new';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [categoryDetails, setCategoryDetails] = useState(null);

  const LOCAL_STORAGE_KEY = 'newServiceForm'; // for new services

  const [form, setForm] = useState(() => {
    const emptyForm = {
      id: null,
      name: '',
      description: '',
      category: '',
      images: [],
      _newFiles: [],
      price: '',
      currency: '﷼',
      isPriceNegotiable: false,
      status: 'UNPUBLISHED',
      serviceAvailability: 'TWENTY_FOUR_SEVEN',
      createdAt: '',
    };

    if (isCreateMode) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...emptyForm,
            ...parsed,
            price: Number(parsed.price || 0),
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
      const { images, _newFiles, ...rest } = form; // exclude imagess
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rest));
    }
  }, [form]);

  // ======================================
  // API Integration Functions
  // ======================================
  async function createService() {
    const formData = new FormData();
    const dto = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      isPriceNegotiable: form.isPriceNegotiable,
      categoryId: Number(form.category),
      serviceAvailability: form.serviceAvailability,
      isPublished: form.status === 'PUBLISHED',
    };
    formData.append('dto', JSON.stringify(dto));

    // Add images in create mode
    (form._newFiles || []).forEach((file) => formData.append('files', file));

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/services`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include',
      },
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data?.error?.message || 'Failed to create service');
    return data;
  }

  async function updateService() {
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      isPriceNegotiable: form.isPriceNegotiable,
      categoryId: Number(form.category),
      serviceAvailability: form.serviceAvailability,
      isPublished: form.status === 'PUBLISHED',
    };

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/services/${serviceId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      },
    );
    const data = await res.json();
    if (!res.ok)
      throw new Error(data?.error?.message || 'Failed to update service');
    return data;
  }

  const uploadServiceImage = async (file) => {
    if (!serviceId || isCreateMode) return;
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
        `${import.meta.env.VITE_BACKEND_URL}/api/services/${serviceId}/images`,
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
    if (!serviceId || isCreateMode) return;
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/services/${serviceId}/image/${fileName}`,
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

  async function deleteService() {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/services/${serviceId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error?.message || 'Failed to delete service');
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
    price: '',
    images: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    description: false,
    price: false,
  });

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

  // Fetch service if update mode
  useEffect(() => {
    if (isCreateMode) {
      setLoading(false); // <--- this ensures form renders
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/services/${serviceId}`,
          {
            credentials: 'include',
          },
        );

        const data = await res.json();
        if (!res.ok || data.isDeleted)
          throw new Error(data?.error?.message || 'Failed to load service');

        setForm({
          ...form,
          id: data.serviceId,
          name: data.name,
          description: data.description,
          category: data.category?.id || '',
          images:
            data.imagesFilesUrls.map((url, i) => ({
              url,
              fileName: data.imagesFilesNames[i],
            })) || [],
          price: data.price,
          currency: '﷼',
          isPriceNegotiable: data.isPriceNegotiable,
          status: data.isPublished ? 'PUBLISHED' : 'UNPUBLISHED',
          createdAt: data.createdAt,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId, i18n.language]);

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

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

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

    // price validation
    if (!touched.price) return;
    if (form.price === '' || form.price === null || form.price === undefined) {
      setErrors((e) => ({ ...e, price: t('validation.priceRequired') }));
    } else if (form.price < 0) {
      setErrors((e) => ({ ...e, price: t('validation.pricePositive') }));
    } else {
      setErrors((e) => ({ ...e, price: '' }));
    }
  }, [form.name, form.description, form.price, touched.price, form.images, t]);

  const hasErrors = Object.values(errors).some(Boolean);

  /* ------- Actions ------- */
  const handleTogglePublish = () => {
    setForm((p) => ({
      ...p,
      status: p.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED',
    }));
    setMsg(
      t(
        `messages.${form.status === 'PUBLISHED' ? 'unpublished' : 'published'}`,
      ),
    );
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
        data = await createService();
        localStorage.removeItem(LOCAL_STORAGE_KEY); // clear auto-save after save
      } else {
        data = await updateService();
      }
      setMsg(t('messages.saved'));
      if (isCreateMode) navigate(`/supplier/services/${data.serviceId}`); // go to new product page
    } catch (err) {
      console.error(err);
      setError(err.message || t('errors.save'));
    } finally {
      setSaving(false);
    }
  }

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
    await uploadServiceImage(file);
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
          <h1 className="pd-title">{form.name || t('basic.serviceDetails')}</h1>
          <div className="pd-subtitle">
            <span>{t('createdOn', { date: createdAtFmt })}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <span className={`pd-badge ${form.status?.toLowerCase()}`}>
              {t('serviceStatus')}:{' '}
              {t(`status.${form.status?.toLowerCase()}`, form.status)}
            </span>
          </div>
        </div>

        <div className="pd-actions">
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
            className="pd-btn danger"
            onClick={deleteService}
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
            <label className="pd-label">{t('basic.serviceDetails')}</label>
            <div className="pd-help">{t('basic.serviceDetailsHelp')}</div>

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
            <label className="pd-label">{t('basic.serviceCategory')}</label>
            <div className="pd-help">{t('basic.serviceCategoryHelp')}</div>

            <div className="pd-field">
              <span className="pd-field-label">{t('basic.category')}</span>
              <SupplierSelectSubCategory
                value={form.category}
                onChange={(selectedId) => setField('category', selectedId)}
                usedFor="services"
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
                <img src={img.url} alt={`service-${i}`} />{' '}
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

        <div className="or-grid">
          {/* left: inputs */}
          <div className="or-left">
            <div className="pd-field w-240">
              <span className="pd-field-label">{t('price.price')}</span>
              <div className="pd-input-prefix">
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Only allow digits (and dot if you want decimals)
                    if (val === '') {
                      setField('price', '');
                    } else {
                      const num = Number(val);
                      setField('price', isNaN(num) ? '' : num);
                    }
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, price: true }))}
                />
                <img src="/riyal.png" alt="SAR" className="sar" />
              </div>
              {errors.price && (
                <div className="pd-error-text">{errors.price}</div>
              )}
            </div>
          </div>

          {/* right: negotiation checkbox */}
          <div className="or-right">
            <label className="pd-check">
              <input
                type="checkbox"
                checked={!!form.isPriceNegotiable}
                onChange={(e) =>
                  setField('isPriceNegotiable', e.target.checked)
                }
              />{' '}
              {t('price.negotiable')}
            </label>
            <div className="pd-help-sm">{t('price.note')}</div>
          </div>
        </div>
      </section>

      {/* Service Availability */}
      <section className="pd-card">
        <h2 className="pd-section-title">{t('sections.serviceDetails')}</h2>

        <div className="or-grid">
          <div className="or-left">
            <div className="pd-field w-240">
              <span className="pd-field-label">
                {t('service.availability')}
              </span>
              <select
                value={form.serviceAvailability}
                onChange={(e) =>
                  setField('serviceAvailability', e.target.value)
                }
              >
                {Object.entries(
                  t('availabilityOptions', { returnObjects: true }),
                ).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="or-right">
            <div className="or-explain">
              <div className="pd-help-sm">{t('service.availabilityHelp')}</div>
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
    </div>
  );
}
