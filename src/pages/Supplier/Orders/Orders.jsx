import React, { useState } from 'react';
import './Orders.css';
import { useTranslation } from 'react-i18next';

export default function Orders() {
  const { t, i18n } = useTranslation('orders');
  const [filter, setFilter] = useState('all');

  const orders = [
    {
      id: '#556903778',
      date: '12 Mar',
      buyer: 'Skyline Logistics',
      status: 'pending',
      total: '10,000',
    },
    {
      id: '#556903779',
      date: '11 Mar',
      buyer: 'King Saud University',
      status: 'pending',
      total: '30,000',
    },
    {
      id: '#49093778',
      date: '8 Mar',
      buyer: 'Alan Almunef',
      status: 'processing',
      total: '59,580',
    },
    {
      id: '#44637278',
      date: '7 Mar',
      buyer: 'Skyline Logistics',
      status: 'pending',
      total: '10,000',
    },
    {
      id: '#44637279',
      date: '6 Mar',
      buyer: 'King Khalid University',
      status: 'completed',
      total: '30,000',
    },
    {
      id: '#49093779',
      date: '5 Mar',
      buyer: 'Alan Almunef',
      status: 'processing',
      total: '59,580',
    },
    {
      id: '#44637280',
      date: '4 Mar',
      buyer: 'Skyline Logistics',
      status: 'completed',
      total: '10,000',
    },
    {
      id: '#49093780',
      date: '3 Mar',
      buyer: 'King Khalid University',
      status: 'shipped',
      total: '30,000',
    },
  ];

  const filteredOrders =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="orders-page">
      <h2 className="page-title">{t('pageTitle')}</h2>
      <p className="page-subtitle">{t('subtitle')}</p>

      {/* ð¹ FILTER TABS */}
      <div className="tabs">
        {['all', 'pending', 'processing', 'shipped', 'completed'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* ð¹ TABLE */}
      <table className="orders-table">
        <thead>
          <tr>
            <th>{t('table.order')}</th>
            <th>{t('table.ordered')}</th>
            <th>{t('table.buyer')}</th>
            <th>{t('table.status')}</th>
            <th>{t('table.total')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, index) => (
            <tr key={index}>
              <td>{order.id}</td>
              <td>{order.date}</td>
              <td>{order.buyer}</td>
              <td>
                <span className={`status-badge ${order.status}`}>
                  {t(`status.${order.status}`)}
                </span>
              </td>
              <td>ï·¼{order.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
