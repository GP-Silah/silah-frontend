import React, { useEffect, useState } from 'react';
import './OrderDetails.css';
import { useTranslation } from 'react-i18next';

export default function OrderDetailsBuyer() {
  const { t, i18n } = useTranslation('orderDetails');

  // حالة الطلب الافتراضية (نقدر نربطها بالـ API لاحقًا)
  const [orderStatus, setOrderStatus] = useState('shipped');

  const order = {
    id: '123456',
    date: '26/Mar/2025',
    time: '3:33 PM',
    supplier: 'Nivia',
    totalPrice: '10,000 SAR',
    items: [
      {
        id: 1,
        image: '/images/item1.png',
        name: 'Amber - 45ml Soy Candle',
        unitPrice: '10',
        quantity: '16',
        total: '160',
      },
      {
        id: 2,
        image: '/images/item2.png',
        name: 'Amber - 45ml Soy Candle',
        unitPrice: '10',
        quantity: '16',
        total: '160',
      },
    ],
  };

  useEffect(() => {
    document.title = t('pageTitle');
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n.language, t]);

  const handleConfirm = () => {
    setOrderStatus('completed');
  };

  return (
    <div className="order-details-container">
      <h2 className="order-title">
        {t('order.title')} #{order.id}
        <span className={`order-status ${orderStatus}`}>
          {t(`order.status.${orderStatus}`)}
        </span>
      </h2>

      <p className="order-info">
        {t('order.orderedOn')} <b>{order.date}</b> - {order.time}
      </p>
      <p className="order-info">
        {t('order.supplier')} <b>{order.supplier}</b>
      </p>
      <p className="order-info">
        {t('order.totalPrice')} <b>{order.totalPrice}</b> {t('order.paid')}
      </p>

      <h3 className="section-title">{t('items.title')}</h3>

      <table className="order-table">
        <thead>
          <tr>
            <th>{t('items.image')}</th>
            <th>{t('items.name')}</th>
            <th>{t('items.unitPrice')}</th>
            <th>{t('items.quantity')}</th>
            <th>{t('items.total')}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="item-image-placeholder">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="item-image"
                  />
                </div>
              </td>
              <td>{item.name}</td>
              <td>{item.unitPrice}</td>
              <td>{item.quantity}</td>
              <td>{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="order-action">
        {orderStatus === 'shipped' ? (
          <>
            <button className="action-btn confirm" onClick={handleConfirm}>
              {t('buttons.confirm')}
            </button>
            <p className="action-note">{t('notes.confirmNote')}</p>
          </>
        ) : (
          <>
            <button className="action-btn review">{t('buttons.review')}</button>
            <p className="action-note">{t('notes.reviewNote')}</p>
          </>
        )}
      </div>
    </div>
  );
}
