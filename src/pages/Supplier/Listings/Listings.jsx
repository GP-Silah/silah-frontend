import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  FaEdit,
  FaCopy,
  FaTrashAlt,
  FaSearch,
  FaHeart,
  FaRegEye,
  FaRegEyeSlash,
} from 'react-icons/fa';
import './Listings.css';

const FAKE_ITEMS = [
  {
    id: 'p1',
    type: 'product',
    name: 'Amber - 45ml Soy Candle',
    img: '/images/candle1.png',
    price: 42,
    stock: 26,
    status: 'published',
    wishlist: 12,
  },
  {
    id: 'p2',
    type: 'product',
    name: 'Amber - 250ml Soy Candle',
    img: '/images/candle2.png',
    price: 42,
    stock: 26,
    status: 'published',
    wishlist: 8,
  },
  {
    id: 'p3',
    type: 'product',
    name: 'Amber - 45ml Soy Candle',
    img: '/images/candle3.png',
    price: 42,
    stock: 0,
    status: 'unpublished',
    wishlist: 3,
  },
  {
    id: 's1',
    type: 'service',
    name: 'Logo Design',
    img: '/images/logo.png',
    price: 23,
    stock: null,
    status: 'published',
    wishlist: 5,
  },
  {
    id: 's2',
    type: 'service',
    name: 'Website Redesign',
    img: '/images/web.png',
    price: null,
    stock: null,
    status: 'published',
    wishlist: 15,
  },
];

export default function Listings() {
  const { t, i18n } = useTranslation('listings');
  const navigate = useNavigate();
  const { user, role, supplierStatus } = useAuth();
  const isRTL = i18n.dir() === 'rtl';

  const isSupplier = role === 'supplier';
  const isActive = supplierStatus === 'ACTIVE';
  const isPremium = user?.plan === 'PREMIUM';

  const [items] = useState(FAKE_ITEMS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState({});

  // ──────────────────────────────────────────────────────────────────────
  // 1. Add a new state for the tooltip
  // ──────────────────────────────────────────────────────────────────────
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!isPremium) {
      setShowTooltip(true); // show on mount / refresh
      const timer = setTimeout(() => {
        setShowTooltip(false); // hide after 3 seconds
      }, 3000);
      return () => clearTimeout(timer); // cleanup if component unmounts early
    }
  }, [isPremium]); // re-run only when premium status changes

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t, i18n.language]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesType = filter === 'all' || item.type === filter;
      const matchesSearch =
        !search || item.name.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [items, filter, search]);

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);
  const allChecked =
    filtered.length > 0 && filtered.every((it) => selected[it.id]);

  const toggleAll = () => {
    const newSel = {};
    if (!allChecked) filtered.forEach((it) => (newSel[it.id] = true));
    setSelected(newSel);
  };

  const toggleOne = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const goToDetails = (item) => {
    navigate(
      item.type === 'product'
        ? '/supplier/product-details'
        : '/supplier/supplier-service-details',
      { state: { id: item.id } },
    );
  };

  const goToCreate = (type) => {
    navigate(
      type === 'product'
        ? '/supplier/product-details'
        : '/supplier/supplier-service-details',
      { state: { create: true } },
    );
  };

  const handlePredict = (id) => {
    navigate(`/supplier/demand/${id}`);
  };

  return (
    <div className="listings-page" dir={i18n.dir()}>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ls-filters">
          {['all', 'products', 'services'].map((f) => (
            <label
              key={f}
              className={`filter-radio ${filter === f ? 'active' : ''}`}
            >
              <input
                type="radio"
                name="filter"
                checked={filter === f}
                onChange={() => setFilter(f)}
              />
              {t(`filters.${f}`)}
            </label>
          ))}
        </div>

        <div className="add-buttons">
          <button className="btn-outline" onClick={() => goToCreate('product')}>
            {t('buttons.addProduct')}
          </button>
          <button className="btn-primary" onClick={() => goToCreate('service')}>
            {t('buttons.addService')}
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <span>{t('selectHint')}</span>
        <div className="action-buttons">
          <button className="action-btn">
            <FaEdit /> {t('actions.edit')}
          </button>
          <button className="action-btn">
            <FaRegEye /> {t('actions.publish')}
          </button>
          <button className="action-btn">
            <FaRegEyeSlash /> {t('actions.unpublish')}
          </button>
          <button className="action-btn">
            <FaCopy /> {t('actions.duplicate')}
          </button>
          <button className="action-btn danger">
            <FaTrashAlt /> {t('actions.delete')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="listings-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                />
              </th>
              <th>{t('columns.image')}</th>
              <th>{t('columns.name')}</th>
              <th className="wishlist-header">
                <FaHeart className="wishlist-header-icon" />
                {!isPremium && showTooltip && (
                  <div className="wishlist-tooltip">{t('wishlistBlur')}</div>
                )}
              </th>
              <th>{t('columns.price')}</th>
              <th>{t('columns.stock')}</th>
              <th>{t('columns.status')}</th>
              <th>{t('columns.predict')}</th>
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
              filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => goToDetails(item)}
                  className="clickable-row"
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={!!selected[item.id]}
                      onChange={() => toggleOne(item.id)}
                    />
                  </td>
                  <td>
                    <div className="thumb">
                      <img src={item.img} alt={item.name} />
                    </div>
                  </td>
                  <td>
                    <div className="name-cell">
                      <span className="type-tag">{t(`type.${item.type}`)}</span>
                      <span className="item-name">{item.name}</span>
                    </div>
                  </td>
                  <td>
                    {isPremium ? (
                      <span className="wishlist-count">{item.wishlist}</span>
                    ) : (
                      <span className="wishlist-blurred">—</span>
                    )}
                  </td>
                  <td>{item.price != null ? item.price : '—'}</td>
                  <td>{item.stock != null ? item.stock : '—'}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        item.status === 'published' ? 'pub' : 'unpub'
                      }`}
                    >
                      {t(`status.${item.status}`)}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="predict-btn"
                      onClick={() => handlePredict(item.id)}
                    >
                      {t('columns.predict')}
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
