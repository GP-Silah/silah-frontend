import React from 'react';
import { useTranslation } from 'react-i18next';
import './Cart.css';

export default function CartBuyer() {
  const { t, i18n } = useTranslation('cart'); // <-- استخدمنا namespace "cart"

  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;

  // بيانات السلة التجريبية
  const cartData = [
    {
      supplier: 'Ama Amazing Co.',
      logo: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
      products: [
        { name: 'Dropper Bottle', qty: 10, price: 25, stock: true },
        { name: 'Dropper Bottle', qty: 10, price: 25, stock: true },
      ],
    },
    {
      supplier: 'Nivia',
      logo: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
      products: [{ name: 'Dropper Bottle', qty: 10, price: 25, stock: false }],
    },
  ];

  // يتحقق إذا فيه منتجات غير متوفرة
  const hasOutOfStock = cartData.some((supplier) =>
    supplier.products.some((p) => !p.stock),
  );

  return (
    <div className="cart-page" data-dir={dir}>
      <div className="cart-container">
        {/* العنوان */}
        <h2 className="cart-title">{t('title', { count: 2 })}</h2>

        {/* زر حذف الكل */}
        <button className="delete-all">{t('deleteAll')}</button>

        {/* الموردين */}
        {cartData.map((supplier, index) => (
          <div key={index} className="cart-supplier">
            <div className="cart-supplier-header">
              <img
                src={supplier.logo}
                alt={supplier.supplier}
                className="cart-supplier-logo"
              />
              <h3>{supplier.supplier}</h3>
            </div>

            {/* المنتجات */}
            {supplier.products.map((p, idx) => (
              <div
                key={idx}
                className={`cart-item ${!p.stock ? 'out-stock' : ''}`}
              >
                <img
                  src="https://images.unsplash.com/photo-1590080875831-3e753aba8c9c?auto=format&fit=crop&w=100&q=60"
                  alt={p.name}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <p className="cart-item-name">{p.name}</p>
                  {!p.stock && (
                    <p className="out-stock-label">{t('outOfStock')}</p>
                  )}
                </div>

                <div className="cart-item-actions">
                  <select className="cart-qty">
                    <option>{p.qty}</option>
                    <option>5</option>
                    <option>15</option>
                    <option>20</option>
                  </select>
                  <p className="cart-price">{p.price} ﷼</p>
                  <button className="remove-btn">✕</button>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* الملخص */}
        <div className="cart-summary">
          <div className="summary-row">
            <span>{t('productsTotal')}</span>
            <span>75 ﷼</span>
          </div>
          <div className="summary-row">
            <span>{t('deliveryFees')}</span>
            <span>150 ﷼</span>
          </div>
          <div className="summary-row total">
            <span>{t('cartTotal')}</span>
            <span>225 ﷼</span>
          </div>

          {/* زر الدفع */}
          <button
            className="checkout-btn"
            disabled={hasOutOfStock}
            title={hasOutOfStock ? t('removeOutOfStock') : ''}
          >
            {t('checkout')}
          </button>

          {/* تحذير في حال وجود منتج غير متوفر */}
          {hasOutOfStock && (
            <p className="warning-text">{t('removeOutOfStock')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
