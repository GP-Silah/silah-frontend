// src/pages/Listings.jsx   (or wherever you keep it)
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './ProductsAndServices.css';

/* -------------------------------------------------
   Fake data – edit / add as many items as you want
   ------------------------------------------------- */
const FAKE_ITEMS = [
  {
    id: 'p1',
    type: 'product',
    name: 'Wireless Headphones',
    img: 'https://via.placeholder.com/80?text=Headphones',
    price: 79.99,
    stock: 42,
    status: 'published',
    favorite: true,
  },
  {
    id: 'p2',
    type: 'product',
    name: 'USB-C Cable 2m',
    img: 'https://via.placeholder.com/80?text=Cable',
    price: 12.5,
    stock: 150,
    status: 'unpublished',
    favorite: false,
  },
  {
    id: 's1',
    type: 'service',
    name: 'Website Redesign',
    img: 'https://via.placeholder.com/80?text=Web',
    price: 1200,
    stock: null,
    status: 'published',
    favorite: false,
  },
  {
    id: 's2',
    type: 'service',
    name: 'SEO Audit',
    img: 'https://via.placeholder.com/80?text=SEO',
    price: 350,
    stock: null,
    status: 'unpublished',
    favorite: true,
  },
  {
    id: 'p3',
    type: 'product',
    name: 'Bluetooth Speaker',
    img: 'https://via.placeholder.com/80?text=Speaker',
    price: 49.99,
    stock: 23,
    status: 'published',
    favorite: false,
  },
];

/* -------------------------------------------------
   Component
   ------------------------------------------------- */
export default function ProductsAndServices() {
  const { t, i18n } = useTranslation('supplierListings');
  const navigate = useNavigate();

  // State
  const [items] = useState(FAKE_ITEMS); // <-- fake data
  const [filter, setFilter] = useState('all'); // all | product | service
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState({}); // { id: true }
  const dir = i18n.dir();

  // -------------------------------------------------
  // Filtering
  // -------------------------------------------------
  const filtered = useMemo(() => {
    return items.filter((it) => {
      const byType = filter === 'all' || it.type === filter;
      const byQuery =
        !q || it.name.toLowerCase().includes(q.trim().toLowerCase());
      return byType && byQuery;
    });
  }, [items, filter, q]);

  const ids = filtered.map((x) => x.id);
  const allChecked = ids.length > 0 && ids.every((id) => selected[id]);
  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  // -------------------------------------------------
  // Selection helpers
  // -------------------------------------------------
  const toggleAll = () => {
    setSelected((prev) => {
      const next = { ...prev };
      if (allChecked) ids.forEach((id) => delete next[id]);
      else ids.forEach((id) => (next[id] = true));
      return next;
    });
  };

  const toggleOne = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  // -------------------------------------------------
  // Fake “API” actions – just mutate the local array
  // -------------------------------------------------
  const mutate = (mutator) => {
    // In a real app you would call the backend here.
    // For demo we just keep everything in-memory.
    // (No setItems because we want the component to stay pure)
    console.warn('FAKE API call – not persisted');
    // If you ever want the UI to reflect changes instantly, uncomment:
    // setItems(mutator);
  };

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
    publish: () =>
      mutate((list) =>
        list.map((x) =>
          selectedIds.includes(x.id) ? { ...x, status: 'published' } : x,
        ),
      ),
    unpublish: () =>
      mutate((list) =>
        list.map((x) =>
          selectedIds.includes(x.id) ? { ...x, status: 'unpublished' } : x,
        ),
      ),
    duplicate: () =>
      mutate((list) => {
        const toDup = list.filter((x) => selectedIds.includes(x.id));
        const copies = toDup.map((x) => ({
          ...x,
          id: `${x.id}-copy-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 6)}`,
          name: `${x.name} (Copy)`,
          status: 'unpublished',
        }));
        return [...copies, ...list];
      }),
    delete: () =>
      mutate((list) => list.filter((x) => !selectedIds.includes(x.id))),
  };

  const toggleFavorite = (id) =>
    mutate((list) =>
      list.map((x) => (x.id === id ? { ...x, favorite: !x.favorite } : x)),
    );

  const goToCreate = (kind) => {
    navigate(
      kind === 'product'
        ? '/supplier/product-details'
        : '/supplier/supplier-service-details',
      { state: { create: true } },
    );
  };

  const renderStatus = (status) => (
    <span className={`sl-status ${status === 'published' ? 'pub' : 'unpub'}`}>
      {status === 'published' ? t('published') : t('unpublished')}
    </span>
  );

  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  return (
    <div className="supplier-listings" dir={dir}>
      {/* Toolbar */}
      <div className="sl-toolbar">
        <div className="sl-search">
          <span className="sl-search-icon" aria-hidden>
            Search
          </span>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="sl-filters" role="radiogroup">
          {['all', 'product', 'service'].map((f) => (
            <label
              key={f}
              className={`sl-radio ${filter === f ? 'active' : ''}`}
            >
              <input
                type="radio"
                name="type"
                checked={filter === f}
                onChange={() => setFilter(f)}
              />
              {t(f === 'all' ? 'all' : f + 's')}
            </label>
          ))}
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

      {/* Bulk actions */}
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

      {/* Table */}
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
              <th className="w-fav">Heart</th>
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
                      className={`heart ${it.favorite ? 'on' : ''}`}
                      onClick={() => toggleFavorite(it.id)}
                    >
                      Heart
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
