import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import toast from 'react-hot-toast';
import axios from 'axios';
import styles from './Listings.module.css';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}`;

export default function Listings() {
  const { t, i18n } = useTranslation('listings');
  const navigate = useNavigate();
  const { user, role, supplierStatus, supplierId } = useAuth();
  const isRTL = i18n.dir() === 'rtl';
  const isSupplier = role === 'supplier';
  const isActive = supplierStatus === 'ACTIVE';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState({});
  const [showTooltip, setShowTooltip] = useState(false);
  const [supplierPlan, setSupplierPlan] = useState('BASIC'); // default to BASIC
  const [planLoading, setPlanLoading] = useState(true);
  const isPremium = supplierPlan === 'PREMIUM';

  useEffect(() => {
    document.title = t('pageTitle');
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }, [t, i18n.language]);

  // Show tooltip for non-premium users
  useEffect(() => {
    if (!planLoading && !isPremium) {
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPremium]);

  // Fetch all items
  const fetchItems = useCallback(async () => {
    if (!supplierId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [prodRes, servRes] = await Promise.all([
        axios.get(`${API_BASE}/api/products/supplier/${supplierId}`, {
          withCredentials: true,
          headers: { 'accept-language': i18n.language },
        }),
        axios.get(`${API_BASE}/api/services/supplier/${supplierId}`, {
          withCredentials: true,
          headers: { 'accept-language': i18n.language },
        }),
      ]);

      const products = prodRes.data || [];
      const services = servRes.data || [];

      const mapProduct = (p) => ({
        id: p.productId,
        type: 'product',
        name: p.name,
        img: p.imagesFilesUrls?.[0] || '/images/placeholder.png',
        price: p.price,
        stock: p.stock,
        status: p.isPublished ? 'published' : 'unpublished',
        wishlist: p.wishlistCount || 0,
      });

      const mapService = (s) => ({
        id: s.serviceId,
        type: 'service',
        name: s.name,
        img: s.imagesFilesUrls?.[0] || '/images/placeholder.png',
        price: s.price,
        stock: null,
        status: s.isPublished ? 'published' : 'unpublished',
        wishlist: s.wishlistCount || 0,
      });

      const mapped = [
        ...(products || []).map(mapProduct),
        ...(services || []).map(mapService),
      ];

      setItems(mapped);
    } catch (err) {
      const message =
        err.response?.data?.error?.message || t('errors.fetchFailed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [supplierId, i18n.language, t]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Search with debounce
  useEffect(() => {
    if (!search.trim()) {
      fetchItems();
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/search/supplier/catalog?name=${encodeURIComponent(
            search,
          )}`,
          {
            withCredentials: true,
            headers: { 'accept-language': i18n.language },
          },
        );

        const results = res.data || [];
        const mapped = results.map((r) =>
          r.productId
            ? {
                id: r.productId,
                type: 'product',
                name: r.name,
                img: r.imagesFilesUrls?.[0] || '/images/placeholder.png',
                price: r.price,
                stock: r.stock,
                status: r.isPublished ? 'published' : 'unpublished',
                wishlist: r.wishlistCount || 0,
              }
            : {
                id: r.serviceId,
                type: 'service',
                name: r.name,
                img: r.imagesFilesUrls?.[0] || '/images/placeholder.png',
                price: r.price,
                stock: null,
                status: r.isPublished ? 'published' : 'unpublished',
                wishlist: r.wishlistCount || 0,
              },
        );
        setItems(mapped);
      } catch {
        toast.error(t('errors.searchFailed'));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, t, i18n.language]);

  // Fetch supplier plan
  useEffect(() => {
    if (!isSupplier || !supplierId) {
      setPlanLoading(false);
      return;
    }

    const fetchSupplierPlan = async () => {
      try {
        setPlanLoading(true);
        const res = await axios.get(`${API_BASE}/api/suppliers/me/plan`, {
          withCredentials: true,
          headers: { 'accept-language': i18n.language },
        });
        setSupplierPlan(res.data.plan || 'BASIC');
      } catch (err) {
        console.warn('Failed to fetch supplier plan, defaulting to BASIC');
        setSupplierPlan('BASIC');
      } finally {
        setPlanLoading(false);
      }
    };

    fetchSupplierPlan();
  }, [isSupplier, supplierId, i18n.language]);

  // Bulk actions
  const performBulkAction = async (action) => {
    if (!selectedIds.length) return;

    const promises = selectedIds.map(async (id) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const endpoint = item.type === 'product' ? 'products' : 'services';
      const url = `${API_BASE}/api/${endpoint}/${id}${
        action === 'duplicate' ? '/clone' : ''
      }`;

      try {
        if (action === 'delete') {
          await axios.delete(url, { withCredentials: true });
        } else if (action === 'duplicate') {
          await axios.post(url, {}, { withCredentials: true });
        } else {
          await axios.patch(
            url,
            { isPublished: action === 'publish' },
            {
              withCredentials: true,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
      } catch (err) {
        const message =
          err.response?.data?.error?.message || t('errors.actionFailed');
        throw new Error(message);
      }
    });

    toast.promise(Promise.all(promises), {
      loading: t(`actions.${action}ing`),
      success: () => {
        setSelected({});
        fetchItems();
        return t(`actions.${action}Success`);
      },
      error: (err) => err.message,
    });
  };

  // Filtering & selection
  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    const typeMap = { products: 'product', services: 'service' };
    const target = typeMap[filter];
    return target ? items.filter((i) => i.type === target) : items;
  }, [items, filter]);

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);
  const allChecked =
    filtered.length > 0 && filtered.every((it) => selected[it.id]);
  const canEdit = selectedIds.length === 1;

  const toggleAll = () => {
    const newSel = {};
    if (!allChecked) {
      filtered.forEach((it) => {
        newSel[it.id] = true;
      });
    }
    setSelected(newSel);
  };

  const toggleOne = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const goToDetails = (item) => {
    navigate(
      item.type === 'product'
        ? `/supplier/products/${item.id}`
        : `/supplier/services/${item.id}`,
    );
  };

  const goToCreate = (type) => {
    navigate(
      type === 'product' ? '/supplier/products/new' : '/supplier/services/new',
    );
  };

  const handlePredict = (id) => {
    navigate(`/supplier/demand/${id}`);
  };

  return (
    <div className={styles['listings-page']} dir={i18n.dir()}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles['search-box']}>
          <FaSearch className={styles['search-icon']} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles['ls-filters']}>
          {['all', 'products', 'services'].map((f) => (
            <label
              key={f}
              className={`${styles['filter-radio']} ${
                filter === f ? styles.active : ''
              }`}
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

        <div className={styles['add-buttons']}>
          <button
            className={styles['btn-outline']}
            onClick={() => goToCreate('product')}
          >
            {t('buttons.addProduct')}
          </button>
          <button
            className={styles['btn-primary']}
            onClick={() => goToCreate('service')}
          >
            {t('buttons.addService')}
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className={styles['action-bar']}>
        <span>{t('selectHint')}</span>
        <div className={styles['action-buttons']}>
          <button
            className={styles['action-btn']}
            disabled={!canEdit}
            onClick={() =>
              goToDetails(items.find((i) => i.id === selectedIds[0]))
            }
          >
            <FaEdit /> {t('actions.edit')}
          </button>
          <button
            className={styles['action-btn']}
            onClick={() => performBulkAction('publish')}
          >
            <FaRegEye /> {t('actions.publish')}
          </button>
          <button
            className={styles['action-btn']}
            onClick={() => performBulkAction('unpublish')}
          >
            <FaRegEyeSlash /> {t('actions.unpublish')}
          </button>
          <button
            className={styles['action-btn']}
            onClick={() => performBulkAction('duplicate')}
          >
            <FaCopy /> {t('actions.duplicate')}
          </button>
          <button
            className={`${styles['action-btn']} ${styles.danger}`}
            onClick={() => performBulkAction('delete')}
          >
            <FaTrashAlt /> {t('actions.delete')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles['table-container']}>
        <table className={styles['listings-table']}>
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
              <th className={styles['wishlist-header']}>
                <FaHeart className={styles['wishlist-header-icon']} />
                {!isPremium && showTooltip && (
                  <div className={styles['wishlist-tooltip']}>
                    {t('wishlistBlur')}
                  </div>
                )}
              </th>
              <th>{t('columns.price')}</th>
              <th>{t('columns.stock')}</th>
              <th>{t('columns.status')}</th>
              <th>{t('columns.predict')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  {t('loading')}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  {t('empty')}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => goToDetails(item)}
                  className={styles['clickable-row']}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={!!selected[item.id]}
                      onChange={() => toggleOne(item.id)}
                    />
                  </td>
                  <td>
                    <div className={styles.thumb}>
                      <img
                        src={item.img}
                        alt={item.name}
                        onError={(e) =>
                          (e.currentTarget.src = '/images/placeholder.png')
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div className={styles['name-cell']}>
                      <span className={styles['type-tag']}>
                        {t(`type.${item.type}`)}
                      </span>
                      <span className={styles['item-name']}>{item.name}</span>
                    </div>
                  </td>
                  <td>
                    {planLoading ? (
                      <span className={styles['wishlist-count']}>—</span>
                    ) : isPremium ? (
                      <span className={styles['wishlist-count']}>
                        {item.wishlist}
                      </span>
                    ) : (
                      <span className={styles['wishlist-blurred']}>—</span>
                    )}
                  </td>
                  <td>{item.price != null ? item.price : '—'}</td>
                  <td>{item.stock != null ? item.stock : '—'}</td>
                  <td>
                    <span
                      className={`${styles['status-badge']} ${
                        item.status === 'published' ? styles.pub : styles.unpub
                      }`}
                    >
                      {t(`status.${item.status}`)}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {item.type === 'product' && (
                      <button
                        className={styles['predict-btn']}
                        onClick={() => handlePredict(item.id)}
                      >
                        {t('columns.predict')}
                      </button>
                    )}
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
