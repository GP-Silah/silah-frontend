import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '@/context/catalog/CatalogProvider';
import './ProductsAndServices.css';

export default function ProductsAndServices() {
  const { t, i18n } = useTranslation('supplierListings');
  const navigate = useNavigate();
  const { items, toggleFavorite, setStatusBulk, duplicateBulk, removeItems } =
    useCatalog();

  const [filter, setFilter] = useState('all'); // all | product | service
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState({});
  const dir = i18n.dir();

  // فلترة حسب النوع والبحث
  const filtered = useMemo(() => {
    return items.filter((it) => {
      const byType = filter === 'all' ? true : it.type === filter;
      const byQuery =
        !q || it.name.toLowerCase().includes(q.trim().toLowerCase());
      return byType && byQuery;
    });
  }, [items, filter, q]);

  const ids = filtered.map((x) => x.id);
  const allChecked = ids.length > 0 && ids.every((id) => selected[id]);
  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  const toggleAll = () =>
    setSelected((prev) => {
      const next = { ...prev };
      if (allChecked) ids.forEach((id) => delete next[id]);
      else ids.forEach((id) => (next[id] = true));
      return next;
    });

  const toggleOne = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  // أكشنات جماعية
  const bulk = {
    edit: () => {
      const first = selectedIds[0];
      if (!first) return;
      const item = items.find((x) => x.id === first);
      if (!item) return;
      navigate(
        item.type === 'product'
          ? '/supplier/product-details'
          : '/supplier/supplier-service-details',
        { state: { id: item.id } },
      );
    },
    publish: () => setStatusBulk(selectedIds, 'published'),
    unpublish: () => setStatusBulk(selectedIds, 'unpublished'),
    duplicate: () => duplicateBulk(selectedIds),
    delete: () => removeItems(selectedIds),
  };

  const goToCreate = (kind) => {
    if (kind === 'product')
      navigate('/supplier/product-details', { state: { create: true } });
    else
      navigate('/supplier/supplier-service-details', {
        state: { create: true },
      });
  };

  const renderStatus = (status) => (
    <span className={`sl-status ${status === 'published' ? 'pub' : 'unpub'}`}>
      {status === 'published' ? t('published') : t('unpublished')}
    </span>
  );

  return (
    <div className="supplier-listings" dir={dir}>
      {/* الشريط العلوي: بحث + فلاتر + أزرار إضافة */}
      <div className="sl-toolbar">
        <div className="sl-search">
          <span className="sl-search-icon" aria-hidden>
            🔍
          </span>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div
          className="sl-filters"
          role="radiogroup"
          aria-label={t('filterLabel')}
        >
          <label className={`sl-radio ${filter === 'all' ? 'active' : ''}`}>
            <input
              type="radio"
              name="type"
              checked={filter === 'all'}
              onChange={() => setFilter('all')}
            />
            {t('all')}
          </label>
          <label className={`sl-radio ${filter === 'product' ? 'active' : ''}`}>
            <input
              type="radio"
              name="type"
              checked={filter === 'product'}
              onChange={() => setFilter('product')}
            />
            {t('products')}
          </label>
          <label className={`sl-radio ${filter === 'service' ? 'active' : ''}`}>
            <input
              type="radio"
              name="type"
              checked={filter === 'service'}
              onChange={() => setFilter('service')}
            />
            {t('services')}
          </label>
        </div>

        <div className="sl-add-actions">
          <button
            className="sl-btn sl-btn-outline"
            onClick={() => goToCreate('product')}
          >
            + {t('addProduct')}
          </button>
          <button
            className="sl-btn sl-btn-primary"
            onClick={() => goToCreate('service')}
          >
            + {t('addService')}
          </button>
        </div>
      </div>

      {/* شريط الأكشنات الجماعية */}
      <div className="sl-bulk">
        <span>{t('selectHint')}</span>
        <div className="sl-bulk-actions">
          <button onClick={bulk.edit}>{t('edit')}</button>
          <button onClick={bulk.publish}>{t('publish')}</button>
          <button onClick={bulk.unpublish}>{t('unpublish')}</button>
          <button onClick={bulk.duplicate}>{t('duplicate')}</button>
          <button className="danger" onClick={bulk.delete}>
            {t('delete')}
          </button>
        </div>
      </div>

      {/* الجدول */}
      <div className="sl-table-wrap">
        <table className="sl-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                />
              </th>
              <th>{t('image')}</th>
              <th className="w-name">{t('itemName')}</th>
              <th className="w-fav">❤</th>
              <th>{t('unitPrice')}</th>
              <th>{t('stock')}</th>
              <th>{t('status')}</th>
              <th className="w-action">{t('predict')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty">
                  {t('empty')}
                </td>
              </tr>
            ) : (
              filtered.map((it) => (
                <tr key={it.id} className={`row-${it.type}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selected[it.id]}
                      onChange={() => toggleOne(it.id)}
                    />
                  </td>
                  <td>
                    <div className="sl-thumb">
                      <img
                        src={it.img || '/assets/images/placeholder.png'}
                        alt={it.name}
                      />
                    </div>
                  </td>
                  <td className="sl-name">
                    <div className="sl-type-tag">
                      {it.type === 'product' ? t('product') : t('service')}
                    </div>
                    <button
                      className="sl-link"
                      onClick={() =>
                        navigate(
                          it.type === 'product'
                            ? '/supplier/product-details'
                            : '/supplier/supplier-service-details',
                          { state: { id: it.id } },
                        )
                      }
                    >
                      {it.name}
                    </button>
                  </td>
                  <td className="sl-fav">
                    <button
                      aria-label={t('toggleFavorite')}
                      className={`heart ${it.favorite ? 'on' : ''}`}
                      onClick={() => toggleFavorite(it.id)}
                    >
                      ♥
                    </button>
                  </td>
                  <td>{it.price != null ? it.price : '-'}</td>
                  <td>{it.stock != null ? it.stock : '-'}</td>
                  <td>{renderStatus(it.status)}</td>
                  <td>
                    <button
                      className="sl-btn sl-btn-ghost"
                      onClick={() => console.log('predict', it.id)}
                    >
                      {t('predict')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
