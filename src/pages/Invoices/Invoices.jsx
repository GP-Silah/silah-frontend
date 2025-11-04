import React, { useState } from 'react';
import './Invoices.css';
import { useTranslation } from 'react-i18next';

export default function Invoices() {
  const { t, i18n } = useTranslation('invoices');
  const [filter, setFilter] = useState('all');

  const invoices = [
    {
      id: '#556903778',
      date: '22 Mar',
      buyer: 'SkyLine Logistics',
      status: 'accepted',
      total: '10,000',
    },
    {
      id: '#556903779',
      date: '19 Mar',
      buyer: 'King Saud University',
      status: 'accepted',
      total: '30,000',
    },
    {
      id: '#490903778',
      date: '18 Mar',
      buyer: 'Almuneef',
      status: 'rejected',
      total: '59,580',
    },
    {
      id: '#446372778',
      date: '17 Mar',
      buyer: 'King Khalid University',
      status: 'accepted',
      total: '30,000',
    },
    {
      id: '#556903780',
      date: '22 Mar',
      buyer: 'SkyLine Logistics',
      status: 'fullyPaid',
      total: '10,000',
    },
    {
      id: '#556903781',
      date: '19 Mar',
      buyer: 'King Saud University',
      status: 'accepted',
      total: '30,000',
    },
    {
      id: '#490903779',
      date: '18 Mar',
      buyer: 'Almuneef',
      status: 'fullyPaid',
      total: '59,580',
    },
    {
      id: '#446372779',
      date: '17 Mar',
      buyer: 'King Khalid University',
      status: 'partiallyPaid',
      total: '30,000',
    },
    {
      id: '#446372780',
      date: '16 Mar',
      buyer: 'Almuneef',
      status: 'rejected',
      total: '30,000',
    },
  ];

  const filteredInvoices =
    filter === 'all' ? invoices : invoices.filter((i) => i.status === filter);

  return (
    <div className="invoices-page">
      {/* Filter by type */}
      <div className="filter-bar">
        <span>{t('showInvoicesFor')}:</span>
        {['all', 'products', 'services', 'bids', 'groupPurchases'].map(
          (type) => (
            <label key={type}>
              <input
                type="radio"
                name="invoiceType"
                defaultChecked={type === 'all'}
              />
              {t(`filter.${type}`)}
            </label>
          ),
        )}
      </div>

      <h2 className="page-title">{t('pageTitle')}</h2>

      {/* Tabs */}
      <div className="tabs">
        {['all', 'accepted', 'rejected', 'partiallyPaid', 'fullyPaid'].map(
          (tab) => (
            <button
              key={tab}
              className={`tab-btn ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {t(`tabs.${tab}`)}
            </button>
          ),
        )}
      </div>

      {/* Table */}
      <table className="invoices-table">
        <thead>
          <tr>
            <th>{t('table.invoice')}</th>
            <th>{t('table.created')}</th>
            <th>{t('table.buyer')}</th>
            <th>{t('table.status')}</th>
            <th>{t('table.total')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((inv, i) => (
            <tr key={i}>
              <td>{inv.id}</td>
              <td>{inv.date}</td>
              <td>{inv.buyer}</td>
              <td>
                <span className={`status-badge ${inv.status}`}>
                  {t(`status.${inv.status}`)}
                </span>
              </td>
              <td>﷼{inv.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
