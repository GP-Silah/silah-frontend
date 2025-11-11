import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Heart,
  Star,
  MapPin,
  MessageCircle,
  Info,
  ShoppingCart,
} from 'lucide-react';
import Swal from 'sweetalert2';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './ProductDetails.css';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export default function ProductDetails() {
  const { t, i18n } = useTranslation('productDetails');
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { refreshCart } = useCart();
  const isBuyer = role === 'buyer';
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [groupPurchases, setGroupPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [qtyError, setQtyError] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [groupQuantity, setGroupQuantity] = useState('');
  const [groupQtyError, setGroupQtyError] = useState('');

  // --------------------------------------------------------------
  // 1. FETCH PRODUCT
  // --------------------------------------------------------------
  const fetchProduct = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/products/${id}`, {
        params: { lang: i18n.language },
        withCredentials: true,
      });
      setProduct(res.data);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      setError(msg);
    }
  }, [id, i18n.language]);

  // --------------------------------------------------------------
  // 2. FETCH REVIEWS
  // --------------------------------------------------------------
  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/reviews/items/${id}`, {
        params: { lang: i18n.language },
        withCredentials: true,
      });
      setReviews(res.data);
    } catch (err) {
      console.error('Reviews error', err);
    }
  }, [id, i18n.language]);

  // --------------------------------------------------------------
  // 3. FETCH SUITABLE GROUP PURCHASES
  // --------------------------------------------------------------
  const fetchGroupPurchases = useCallback(async () => {
    if (!product?.allowGroupPurchase) return;
    try {
      const res = await axios.get(
        `${API}/api/group-purchases/products/${id}/suitable-groups`,
        {
          withCredentials: true,
        },
      );
      setGroupPurchases(res.data);
    } catch (err) {
      console.error('Group purchase fetch error', err);
      setGroupPurchases([]);
    }
  }, [id, product]);

  // --------------------------------------------------------------
  // 4. WISHLIST CHECK + TOGGLE
  // --------------------------------------------------------------
  const checkWishlist = async () => {
    if (!product?.productId) return;
    try {
      const res = await axios.get(`${API}/api/buyers/me/wishlist`, {
        withCredentials: true,
      });
      const inList = res.data.some(
        (e) =>
          e.itemType === 'PRODUCT' &&
          e.product?.productId === product.productId,
      );
      setFavorited(inList);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!product?.productId) return;
    setFavLoading(true);
    try {
      const res = await axios.patch(
        `${API}/api/buyers/me/wishlist/${product.productId}`,
        {},
        { withCredentials: true },
      );
      const { isAdded } = res.data;
      setFavorited(isAdded);
      Swal.fire({
        icon: 'success',
        title: t('wishlist.successTitle'),
        text: t(isAdded ? 'wishlist.added' : 'wishlist.removed'),
        confirmButtonColor: '#476DAE',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: t('wishlist.errorTitle'),
        text: t('wishlist.errorText'),
      });
    } finally {
      setFavLoading(false);
    }
  };

  // --------------------------------------------------------------
  // 5. VALIDATE QUANTITY
  // --------------------------------------------------------------
  const validateQuantity = (val) => {
    const n = Number(val);
    if (!val || isNaN(n) || n <= 0) return t('validation.positive');
    if (n % product.caseQuantity !== 0)
      return t('validation.multipleOfCase', { case: product.caseQuantity });
    if (n < product.minOrderQuantity)
      return t('validation.min', { min: product.minOrderQuantity });
    if (product.maxOrderQuantity && n > product.maxOrderQuantity)
      return t('validation.max', { max: product.maxOrderQuantity });
    return '';
  };

  useEffect(() => {
    if (product) setQtyError(validateQuantity(quantity));
  }, [quantity, product]);

  useEffect(() => {
    if (product) setGroupQtyError(validateQuantity(groupQuantity));
  }, [groupQuantity, product]);

  // --------------------------------------------------------------
  // 6. ADD TO CART
  // --------------------------------------------------------------
  const addToCart = async () => {
    if (!isBuyer) {
      Swal.fire({ icon: 'warning', title: t('loginToAdd') });
      return;
    }
    const err = validateQuantity(quantity);
    if (err) {
      setQtyError(err);
      return;
    }
    try {
      await axios.post(
        `${API}/api/carts/me/items`,
        {
          productId: product.productId,
          quantity: Number(quantity),
        },
        { withCredentials: true },
      );
      Swal.fire({ icon: 'success', title: t('addedToCart') });
      setQuantity('');
      refreshCart();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      Swal.fire({ icon: 'error', title: t('error'), text: msg });
    }
  };

  // --------------------------------------------------------------
  // 7. START / JOIN GROUP PURCHASE
  // --------------------------------------------------------------
  const startGroupPurchase = async () => {
    const err = validateQuantity(groupQuantity);
    if (err) {
      setGroupQtyError(err);
      return;
    }
    try {
      await axios.post(
        `${API}/api/group-purchases/products/${id}/start`,
        null,
        { params: { quantity: Number(groupQuantity) }, withCredentials: true },
      );
      Swal.fire({ icon: 'success', title: t('groupStarted') });
      setGroupQuantity('');
      fetchGroupPurchases();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      Swal.fire({ icon: 'error', title: t('error'), text: msg });
    }
  };

  const joinGroupPurchase = async (groupId) => {
    const err = validateQuantity(groupQuantity);
    if (err) {
      setGroupQtyError(err);
      return;
    }
    try {
      await axios.post(
        `${API}/api/group-purchases/groups/${groupId}/join`,
        null,
        { params: { quantity: Number(groupQuantity) }, withCredentials: true },
      );
      Swal.fire({ icon: 'success', title: t('groupJoined') });
      setGroupQuantity('');
      fetchGroupPurchases();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      Swal.fire({ icon: 'error', title: t('error'), text: msg });
    }
  };

  // --------------------------------------------------------------
  // 8. EFFECTS
  // --------------------------------------------------------------
  useEffect(() => {
    if (product?.name) {
      document.title = t('pageTitle', { name: product.name });
    } else {
      document.title = t('pageTitleFallback');
    }
  }, [product, t]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchProduct(), fetchReviews()]);
      setLoading(false);
    })();
  }, [fetchProduct, fetchReviews]);

  useEffect(() => {
    if (product) {
      checkWishlist();
      if (product.allowGroupPurchase) {
        fetchGroupPurchases(); // ← will now use fresh version
      }
    }
  }, [product, fetchGroupPurchases]); // ← Add this dependency

  // --------------------------------------------------------------
  // 9. RENDER
  // --------------------------------------------------------------
  if (loading) return <div className="pd-loading">{t('loading')}</div>;
  if (error) return <div className="pd-error">{error}</div>;
  if (!product) return null;

  const {
    name,
    description,
    price,
    imagesFilesUrls = [],
    avgRating = 0,
    ratingsCount = 0,
    supplier,
    caseQuantity,
    minOrderQuantity,
    maxOrderQuantity,
    allowGroupPurchase,
    groupPurchasePrice,
    minGroupOrderQuantity,
  } = product;

  const supplierName =
    supplier?.user?.businessName || supplier?.user?.name || '';
  const supplierCity = supplier?.user?.city || '';
  const supplierAvatar = supplier?.user?.pfpUrl || '';
  const supplierId = supplier?.supplierId;

  const heroImg = imagesFilesUrls[0] || '/placeholder-product.jpg';
  const thumb1 = imagesFilesUrls[1] || null;
  const thumb2 = imagesFilesUrls[2] || null;

  const activeGroup = Array.isArray(groupPurchases) ? groupPurchases[0] : null;

  return (
    <div className="product-details" data-dir={dir}>
      {/* SUPPLIER BAR */}
      <div
        className="pd-supplier-bar"
        onClick={() => supplierId && navigate(`/storefronts/${supplierId}`)}
      >
        <img
          src={supplierAvatar || '/avatar-placeholder.png'}
          alt={supplierName}
          className="pd-sup-avatar"
        />
        <div className="pd-sup-info">
          <h2 className="pd-sup-name">{supplierName}</h2>
          <div className="pd-sup-rating">
            <Star fill="#facc15" stroke="#facc15" size={18} />
            <span>
              {supplier?.avgRating?.toFixed(1) ?? '—'} (
              {supplier?.ratingsCount ?? 0})
            </span>
          </div>
          <div className="pd-sup-city">
            <MapPin size={16} />
            {supplierCity}
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="pd-hero" style={{ backgroundColor: '#FAF7FC' }}>
        {/* HERO IMAGE WITH BADGE */}
        <div
          className={`pd-hero-images ${
            product.stock <= 0 ? 'out-of-stock' : ''
          }`}
        >
          <div className="relative">
            <img src={heroImg} alt={name} className="pd-hero-main" />

            {/* OUT OF STOCK BADGE */}
            {product.stock <= 0 && (
              <div className="out-of-stock-badge">
                {i18n.language === 'ar' ? 'غير متوفر' : 'Out of Stock'}
              </div>
            )}
          </div>

          {(thumb1 || thumb2) && (
            <div className="pd-hero-thumbs">
              {thumb1 && <img src={thumb1} alt="" className="pd-thumb" />}
              {thumb2 && <img src={thumb2} alt="" className="pd-thumb" />}
            </div>
          )}
        </div>
        <div className="pd-hero-content">
          <div className="pd-title-row">
            <h1 className="pd-title">{name}</h1>
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className="pd-heart-btn"
            >
              <Heart
                fill={favorited ? '#ef4444' : 'none'}
                stroke="#ef4444"
                size={28}
              />
            </button>
          </div>
          <div className="pd-rating">
            <Star fill="#facc15" stroke="#facc15" size={20} />
            <span>
              {avgRating.toFixed(1)} ({ratingsCount})
            </span>
          </div>

          {/* PRICE */}
          <div className="pd-price-row">
            <span className="pd-price">
              {price} <img src="/riyal.png" alt="SAR" className="pd-currency" />
            </span>
          </div>

          {/* QUANTITY INPUT */}
          {product.stock > 0 && (
            <div className="pd-quantity-section">
              <label className="pd-quantity-label">
                {t('quantityLabel', {
                  min: minOrderQuantity,
                  max: maxOrderQuantity || '∞',
                })}{' '}
                ({t('caseOf', { n: caseQuantity })})
              </label>
              <input
                type="number"
                min={minOrderQuantity}
                step={caseQuantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t('enterQuantity')}
                className="pd-quantity-input"
              />
              {qtyError && <div className="pd-qty-error">{qtyError}</div>}
            </div>
          )}

          {/* ADD TO CART OR ALTERNATIVES */}
          {isBuyer ? (
            product.stock > 0 ? (
              <button
                onClick={addToCart}
                disabled={!quantity || qtyError}
                className="pd-add-btn"
              >
                <ShoppingCart size={20} />
                {t('addToCart')}
              </button>
            ) : (
              <button
                onClick={() => navigate(`/buyer/alternatives?itemId=${id}`)}
                className="pd-add-btn"
                style={{
                  background: '#ef4444',
                  margin: '10px',
                  marginInlineStart: '10px',
                  width: 'fit-content',
                }}
              >
                {t('findAlternatives') || 'Find Alternatives'}
              </button>
            )
          ) : (
            <button disabled className="pd-add-btn" style={{ opacity: 0.5 }}>
              {t('loginToAdd')}
            </button>
          )}

          {/* GROUP PURCHASE */}
          {allowGroupPurchase && product.stock > 0 && (
            <div className="pd-group-section">
              {/* Header */}
              <div className="pd-group-header">
                <span>{t('groupPurchase.title')}</span>
                <div
                  className="pd-info-icon"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <Info size={16} />
                  {showTooltip && (
                    <div className="pd-tooltip">
                      {t('groupPurchase.tooltip')}
                    </div>
                  )}
                </div>
              </div>

              {/* ALWAYS SHOW GROUP PRICE */}
              <div
                className="pd-group-price-row"
                style={{ margin: '0.75rem 0' }}
              >
                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                  {t('groupPurchase.price')}:{' '}
                  <span style={{ fontSize: '1.25rem', color: '#6d28d9' }}>
                    {groupPurchasePrice}{' '}
                    <img
                      src="/riyal.png"
                      alt="SAR"
                      style={{ width: 18, height: 18, verticalAlign: 'middle' }}
                    />
                  </span>{' '}
                  <span style={{ fontSize: '0.9rem', color: '#059669' }}>
                    (
                    {t('groupPurchase.save', {
                      percent: Math.round(
                        (1 - groupPurchasePrice / price) * 100,
                      ),
                    })}
                    )
                  </span>
                </span>
              </div>

              {/* ACTIVE GROUP INFO (only if exists) */}
              {activeGroup && (
                <div
                  className="pd-active-group"
                  style={{ marginBottom: '1rem' }}
                >
                  <p>
                    {t('groupPurchase.active', {
                      buyers: activeGroup.joinedBuyers.length,
                      needed: 5 - activeGroup.joinedBuyers.length,
                      hours: Math.ceil(
                        (new Date(activeGroup.deadline) - Date.now()) /
                          3_600_000,
                      ),
                    })}
                  </p>
                </div>
              )}

              {/* CUSTOM QUANTITY INPUT */}
              <div
                className="pd-quantity-section"
                style={{ marginTop: '0.5rem' }}
              >
                <label className="pd-quantity-label">
                  {t('groupPurchase.customQuantity')} (
                  {t('caseOf', { n: caseQuantity })})
                </label>
                <input
                  type="number"
                  min={minOrderQuantity}
                  step={caseQuantity}
                  value={groupQuantity}
                  onChange={(e) => setGroupQuantity(e.target.value)}
                  placeholder={t('enterQuantity')}
                  className="pd-quantity-input"
                />
                {groupQtyError && (
                  <div className="pd-qty-error">{groupQtyError}</div>
                )}
              </div>

              {/* ACTION BUTTON */}
              {activeGroup ? (
                <button
                  onClick={() => joinGroupPurchase(activeGroup.groupPurchaseId)}
                  disabled={!groupQuantity || groupQtyError}
                  className="pd-join-btn"
                >
                  {t('groupPurchase.join', {
                    others: activeGroup.joinedBuyers.length,
                    percent: Math.round((1 - groupPurchasePrice / price) * 100),
                  })}
                </button>
              ) : (
                <button
                  onClick={startGroupPurchase}
                  disabled={!groupQuantity || groupQtyError}
                  className="pd-start-btn"
                >
                  {t('groupPurchase.start')}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="pd-description">
        <h2>{t('descriptionTitle')}</h2>
        <p>{description}</p>
      </section>

      {/* REVIEWS */}
      <section className="pd-reviews">
        <h2>{t('reviewsTitle')}</h2>
        {reviews.length === 0 ? (
          <p className="pd-no-reviews">{t('noReviews')}</p>
        ) : (
          <div className="pd-reviews-grid">
            {reviews.map((r) => (
              <ReviewCard key={r.itemReviewId} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
