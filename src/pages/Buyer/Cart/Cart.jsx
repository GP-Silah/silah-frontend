// src/pages/CartBuyer/CartBuyer.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import './Cart.css';

const API = import.meta.env.VITE_BACKEND_URL;

export default function CartBuyer() {
  const { t, i18n } = useTranslation('cart');
  const navigate = useNavigate();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;

  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({}); // { productId: fullProduct }
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  // Fetch cart + all product details
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const cartRes = await axios.get(`${API}/api/carts/me`, {
          withCredentials: true,
        });
        const cartData = cartRes.data;

        // Extract all unique product IDs
        const productIds = [
          ...new Set(
            cartData.suppliers.flatMap((s) =>
              s.cartItems.map((item) => item.productId),
            ),
          ),
        ];

        // Fetch all products in parallel
        const productPromises = productIds.map((id) =>
          axios
            .get(`${API}/api/products/${id}`, {
              params: { lang: i18n.language },
              withCredentials: true,
            })
            .catch(() => null),
        );

        const productResponses = await Promise.all(productPromises);
        const productMap = {};
        productResponses.forEach((res, i) => {
          if (res?.data) {
            productMap[productIds[i]] = res.data;
          }
        });

        setCart(cartData);
        setProducts(productMap);
      } catch (err) {
        if (err.response?.status === 404) {
          setCart(null);
        } else {
          Swal.fire({ icon: 'error', text: t('errorLoadingCart') });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [i18n.language]);

  const adjustQuantity = async (item, delta) => {
    const product = products[item.productId];
    if (!product) return;

    const newQty = item.quantity + delta;
    const min = product.minOrderQuantity || 1;
    const max = product.maxOrderQuantity || Infinity;
    const caseQty = product.caseQuantity || 1;

    if (newQty < min) return;
    if (newQty > max) return;
    if (newQty % caseQty !== 0) return;

    const originalQty = item.quantity;
    setUpdating({ ...updating, [item.cartItemId]: true });

    try {
      const res = await axios.patch(
        `${API}/api/carts/me/items/${item.cartItemId}`,
        { newQuantity: newQty },
        { withCredentials: true },
      );
      setCart(res.data);
    } catch (err) {
      // REVERT ON ERROR
      setCart((prev) => {
        const newCart = { ...prev };
        newCart.suppliers = newCart.suppliers.map((s) => ({
          ...s,
          cartItems: s.cartItems.map((i) =>
            i.cartItemId === item.cartItemId
              ? { ...i, quantity: originalQty }
              : i,
          ),
        }));
        return newCart;
      });

      const msg = err.response?.data?.error?.message || t('validation.error');
      Swal.fire({ icon: 'error', text: msg });
    } finally {
      setUpdating({ ...updating, [item.cartItemId]: false });
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm(t('confirmRemoveItem'))) return;
    try {
      const res = await axios.delete(`${API}/api/carts/me/items/${itemId}`, {
        withCredentials: true,
      });

      if (!res.data.suppliers || res.data.suppliers.length === 0) {
        setCart(null);
      } else {
        setCart(res.data);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', text: 'Failed to remove item' });
    }
  };

  const removeSupplier = async (supplierId) => {
    if (!window.confirm(t('confirmRemoveSupplier'))) return;

    try {
      const res = await axios.delete(
        `${API}/api/carts/me/suppliers/${supplierId}`,
        { withCredentials: true },
      );

      // Normal success: cart still exists
      if (res.data.suppliers && res.data.suppliers.length > 0) {
        setCart(res.data);
      } else {
        setCart(null); // Cart deleted
      }
    } catch (err) {
      // SPECIAL CASE: 404 + "Cart is now empty" → SUCCESS
      if (
        err.response?.status === 404 &&
        err.response?.data?.error?.message ===
          'Cart is now empty and has been deleted'
      ) {
        setCart(null); // Go to empty state
        return; // Don't show error
      }

      // All other errors
      const msg =
        err.response?.data?.error?.message || 'Failed to remove supplier';
      Swal.fire({ icon: 'error', text: msg });
    }
  };

  const deleteAll = async () => {
    if (!window.confirm(t('confirmDeleteAll'))) return;
    try {
      await axios.delete(`${API}/api/carts/me`, { withCredentials: true });
      setCart(null);
    } catch (err) {
      Swal.fire({ icon: 'error', text: 'Failed to delete cart' });
    }
  };

  const hasOutOfStock =
    cart?.suppliers?.some((s) =>
      s.cartItems.some((item) => !item.isAvailable),
    ) || false;

  if (loading)
    return (
      <div className="cart-page" data-dir={dir}>
        <div>{t('loading')}</div>
      </div>
    );
  if (!cart) return <EmptyCart t={t} navigate={navigate} />;

  return (
    <div className="cart-page" data-dir={dir}>
      <div className="cart-main">
        <div className="cart-container" style={{ position: 'relative' }}>
          <h2 className="cart-title">
            {t('title', { count: cart.suppliers.length })}
          </h2>
          <button className="delete-all" onClick={deleteAll}>
            <Trash2 size={18} /> {t('deleteAll')}
          </button>

          {cart.suppliers.map((supplier) => {
            const supplierItems = supplier.cartItems;
            const firstProduct = products[supplierItems[0]?.productId];
            const supplierLogo =
              firstProduct?.supplier?.user?.pfpUrl || '/logo-placeholder.png';
            const supplierName =
              firstProduct?.supplier?.businessName || 'Unknown Supplier';

            return (
              <div key={supplier.cartBySupplierId} className="cart-supplier">
                <div className="cart-supplier-header">
                  <div
                    className="supplier-info"
                    onClick={() =>
                      navigate(`/storefronts/${supplier.supplierId}`)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={supplierLogo}
                      alt={supplierName}
                      className="cart-supplier-logo"
                    />
                    <div className="supplier-name">{supplierName}</div>
                  </div>
                  <button
                    className="remove-supplier"
                    onClick={() => removeSupplier(supplier.supplierId)}
                  >
                    ×
                  </button>
                </div>

                {supplierItems.map((item) => {
                  const product = products[item.productId];
                  if (!product) return null;

                  const imageUrl =
                    product.imagesFilesUrls?.[0] || '/placeholder.jpg';

                  return (
                    <div
                      key={item.cartItemId}
                      className={`cart-item ${
                        !item.isAvailable ? 'out-stock' : ''
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={item.productName}
                        className="cart-item-img"
                      />
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.productName}</div>
                        <div className="qty-info">
                          {t('quantityLabel', {
                            min: product.minOrderQuantity,
                            max: product.maxOrderQuantity || '∞',
                          })}{' '}
                          ({t('caseOf', { n: product.caseQuantity })})
                        </div>

                        {!item.isAvailable ? (
                          <>
                            <div className="out-stock-msg">
                              {t('outOfStock')}
                            </div>
                            <div
                              className="search-similar"
                              onClick={() =>
                                navigate(
                                  `/buyer/alternatives?itemId=${item.productId}`,
                                )
                              }
                            >
                              {t('searchSimilar')}
                            </div>
                          </>
                        ) : (
                          <div className="qty-controls">
                            <button
                              className="qty-btn"
                              onClick={() =>
                                adjustQuantity(item, -product.caseQuantity)
                              }
                              disabled={
                                updating[item.cartItemId] ||
                                item.quantity <= product.minOrderQuantity
                              }
                            >
                              −
                            </button>
                            <div className="qty-value">{item.quantity}</div>
                            <button
                              className="qty-btn"
                              onClick={() =>
                                adjustQuantity(item, product.caseQuantity)
                              }
                              disabled={
                                updating[item.cartItemId] ||
                                (product.maxOrderQuantity &&
                                  item.quantity >= product.maxOrderQuantity)
                              }
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-item-price">
                          {item.itemTotalPrice}{' '}
                          <img
                            src="/riyal.png"
                            alt="SAR"
                            style={{
                              width: 16,
                              height: 16,
                              verticalAlign: 'middle',
                            }}
                          />
                        </div>
                        <button
                          className="remove-item"
                          onClick={() => removeItem(item.cartItemId)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="cart-summary">
        <div className="summary-title">{t('summary')}</div>
        <div className="summary-row">
          <span>{t('productsTotal')}</span>
          <span>
            {cart.productsTotal}{' '}
            <img
              src="/riyal.png"
              alt="SAR"
              style={{ width: 16, height: 16, verticalAlign: 'middle' }}
            />
          </span>
        </div>
        <div className="summary-row">
          <span>{t('deliveryFees')}</span>
          <span>
            {cart.deliveryFees}{' '}
            <img
              src="/riyal.png"
              alt="SAR"
              style={{ width: 16, height: 16, verticalAlign: 'middle' }}
            />
          </span>
        </div>
        <div className="summary-row total">
          <span>{t('cartTotal')}</span>
          <span>
            {cart.cartTotal}{' '}
            <img
              src="/riyal.png"
              alt="SAR"
              style={{ width: 16, height: 16, verticalAlign: 'middle' }}
            />
          </span>
        </div>
        <button
          className="checkout-btn"
          disabled={hasOutOfStock}
          onClick={() => navigate('/checkout')}
        >
          {t('checkout')}
        </button>
        {hasOutOfStock && (
          <p className="warning-text">{t('removeOutOfStock')}</p>
        )}
      </div>
    </div>
  );
}

function EmptyCart({ t, navigate }) {
  return (
    <div className="cart-page" data-dir={document.documentElement.dir}>
      <div className="empty-cart">
        <h3>{t('emptyCart')}</h3>
        <button
          onClick={() => navigate('/buyer/homepage')}
          className="checkout-btn"
        >
          {t('continueShopping')}
        </button>
      </div>
    </div>
  );
}
