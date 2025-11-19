import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';
import ReviewCard from '../../components/ReviewCard/ReviewCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './ProductDetails.module.css';

const API = import.meta.env.VITE_BACKEND_URL || 'https://api.silah.site';

export default function ProductDetails() {
  const { t, i18n } = useTranslation('productDetails');
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { refreshCart } = useCart();
  const isBuyer = role === 'buyer';
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = i18n.language === 'ar';

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
  const reviewsCarouselRef = useRef(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  // 1. Fetch Product
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

  // 2. Fetch Reviews
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

  // 3. Fetch Group Purchases
  const fetchGroupPurchases = useCallback(async () => {
    if (!product?.allowGroupPurchase) return;
    try {
      const res = await axios.get(
        `${API}/api/group-purchases/products/${id}/suitable-groups`,
        { withCredentials: true },
      );
      setGroupPurchases(res.data);
    } catch (err) {
      console.error('Group purchase fetch error', err);
      setGroupPurchases([]);
    }
  }, [id, product]);

  // 4. Wishlist
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

  // 5. Quantity Validation
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

  // 6. Add to Cart
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
        { productId: product.productId, quantity: Number(quantity) },
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

  // 7. Group Purchase Actions
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

  // 8. Effects
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
      if (product.allowGroupPurchase) fetchGroupPurchases();
    }
  }, [product, fetchGroupPurchases]);

  useEffect(() => {
    if (reviewsCarouselRef.current) reviewsCarouselRef.current.scrollLeft = 0;
  }, [reviews]);

  // Carousel Logic
  const scrollCarousel = (ref, direction) => {
    if (!ref.current) return;
    const firstCard =
      ref.current.querySelector(`.${styles['review-card-wrapper']}`) ||
      ref.current.children[0];
    const cardWidth = firstCard?.offsetWidth || 400;
    const gap = parseFloat(getComputedStyle(ref.current).gap) || 56;
    const scrollAmount = cardWidth + gap;
    const directionFactor = direction === 'right' ? 1 : -1;
    const rtlFactor = isRTL ? -1 : 1;
    ref.current.scrollBy({
      left: scrollAmount * directionFactor * rtlFactor,
      behavior: 'smooth',
    });
  };

  const canGoBack = (ref) =>
    !ref.current ||
    (isRTL ? ref.current.scrollLeft < -5 : ref.current.scrollLeft > 5);

  const canGoForward = (ref) => {
    if (!ref.current) return false;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    const maxScroll = scrollWidth - clientWidth;
    return isRTL ? scrollLeft > -(maxScroll - 5) : scrollLeft < maxScroll - 5;
  };

  useEffect(() => {
    const updateArrows = () => {
      setCanScrollBack(canGoBack(reviewsCarouselRef));
      setCanScrollForward(canGoForward(reviewsCarouselRef));
    };
    updateArrows();
    const carousel = reviewsCarouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateArrows);
      return () => carousel.removeEventListener('scroll', updateArrows);
    }
  }, [reviews, isRTL]);

  // Render
  if (loading)
    return <div className={styles['pd-loading']}>{t('loading')}</div>;
  if (error) return <div className={styles['pd-error']}>{error}</div>;
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
    stock,
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
    <div className={styles['product-details']} dir={dir}>
      {/* SUPPLIER BAR */}
      <div
        className={styles['pd-supplier-bar']}
        onClick={() => supplierId && navigate(`/storefronts/${supplierId}`)}
      >
        <img
          src={supplierAvatar || '/avatar-placeholder.png'}
          alt={supplierName}
          className={styles['pd-sup-avatar']}
        />
        <div className={styles['pd-sup-info']}>
          <h2 className={styles['pd-sup-name']}>{supplierName}</h2>
          <div className={styles['pd-sup-rating']}>
            <Star fill="#facc15" stroke="#facc15" size={18} />
            <span>
              {supplier?.avgRating?.toFixed(1) ?? '—'} (
              {supplier?.ratingsCount ?? 0})
            </span>
          </div>
          <div className={styles['pd-sup-city']}>
            <MapPin size={16} />
            {supplierCity}
          </div>
        </div>
      </div>

      {/* HERO */}
      <section
        className={styles['pd-hero']}
        style={{ backgroundColor: '#FAF7FC' }}
      >
        <div
          className={`${styles['pd-hero-images']} ${
            stock <= 0 ? styles['out-of-stock'] : ''
          }`}
        >
          <div className={styles.relative}>
            <img src={heroImg} alt={name} className={styles['pd-hero-main']} />
            {stock <= 0 && (
              <div className={styles['out-of-stock-badge']}>
                {i18n.language === 'ar' ? 'غير متوفر' : 'Out of Stock'}
              </div>
            )}
          </div>
          {(thumb1 || thumb2) && (
            <div className={styles['pd-hero-thumbs']}>
              {thumb1 && (
                <img src={thumb1} alt="" className={styles['pd-thumb']} />
              )}
              {thumb2 && (
                <img src={thumb2} alt="" className={styles['pd-thumb']} />
              )}
            </div>
          )}
        </div>

        <div className={styles['pd-hero-content']}>
          <div className={styles['pd-title-row']}>
            <h1 className={styles['pd-title']}>{name}</h1>
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={styles['pd-heart-btn']}
            >
              <Heart
                fill={favorited ? '#ef4444' : 'none'}
                stroke="#ef4444"
                size={28}
              />
            </button>
          </div>

          <div className={styles['pd-rating']}>
            <Star fill="#facc15" stroke="#facc15" size={20} />
            <span>
              {avgRating.toFixed(1)} ({ratingsCount})
            </span>
          </div>

          <div className={styles['pd-price-row']}>
            <span className={styles['pd-price']}>
              {price}{' '}
              <img
                src="/riyal.png"
                alt="SAR"
                className={styles['pd-currency']}
              />
            </span>
          </div>

          {stock > 0 && (
            <div className={styles['pd-quantity-section']}>
              <label className={styles['pd-quantity-label']}>
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
                className={styles['pd-quantity-input']}
              />
              {qtyError && (
                <div className={styles['pd-qty-error']}>{qtyError}</div>
              )}
            </div>
          )}

          {isBuyer ? (
            stock > 0 ? (
              <button
                onClick={addToCart}
                disabled={!quantity || qtyError}
                className={styles['pd-add-btn']}
              >
                <ShoppingCart size={20} />
                {t('addToCart')}
              </button>
            ) : (
              <button
                onClick={() => navigate(`/buyer/alternatives?itemId=${id}`)}
                className={styles['pd-add-btn']}
                style={{ background: '#ef4444' }}
              >
                {t('findAlternatives') || 'Find Alternatives'}
              </button>
            )
          ) : (
            <button
              disabled
              className={styles['pd-add-btn']}
              style={{ opacity: 0.5 }}
            >
              {t('loginToAdd')}
            </button>
          )}

          {allowGroupPurchase && stock > 0 && (
            <div className={styles['pd-group-section']}>
              <div className={styles['pd-group-header']}>
                <span>{t('groupPurchase.title')}</span>
                <div
                  className={styles['pd-info-icon']}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <Info size={16} />
                  {showTooltip && (
                    <div className={styles['pd-tooltip']}>
                      {t('groupPurchase.tooltip')}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles['pd-group-price-row']}>
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

              {activeGroup && (
                <div className={styles['pd-active-group']}>
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

              <div className={styles['pd-quantity-section']}>
                <label className={styles['pd-quantity-label']}>
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
                  className={styles['pd-quantity-input']}
                />
                {groupQtyError && (
                  <div className={styles['pd-qty-error']}>{groupQtyError}</div>
                )}
              </div>

              {activeGroup ? (
                <button
                  onClick={() => joinGroupPurchase(activeGroup.groupPurchaseId)}
                  disabled={!groupQuantity || groupQtyError}
                  className={styles['pd-join-btn']}
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
                  className={styles['pd-start-btn']}
                >
                  {t('groupPurchase.start')}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className={styles['pd-description']}>
        <h2>{t('descriptionTitle')}</h2>
        <p>{description}</p>
      </section>

      {/* REVIEWS */}
      <section className={styles['pd-reviews']}>
        <h2>{t('reviewsTitle')}</h2>
        {reviews.length === 0 ? (
          <p className={styles['pd-no-reviews']}>{t('noReviews')}</p>
        ) : (
          <div className={styles['carousel-wrapper']}>
            <div className={styles.carousel} ref={reviewsCarouselRef}>
              {reviews.map((r) => (
                <div
                  className={styles['review-card-wrapper']}
                  key={r.itemReviewId}
                >
                  <ReviewCard review={r} />
                </div>
              ))}
            </div>

            {canGoBack(reviewsCarouselRef) && (
              <button
                className={`${styles['carousel-arrow']} ${styles.left}`}
                onClick={() => scrollCarousel(reviewsCarouselRef, 'left')}
              >
                {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            )}

            {canGoForward(reviewsCarouselRef) && (
              <button
                className={`${styles['carousel-arrow']} ${styles.right}`}
                onClick={() => scrollCarousel(reviewsCarouselRef, 'right')}
              >
                {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
