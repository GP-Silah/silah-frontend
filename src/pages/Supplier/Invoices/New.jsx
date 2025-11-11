import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit } from 'react-icons/fi';
import './CreateInvoice.css';

const CreateInvoice = () => {
  const { t, i18n } = useTranslation('CreateInvoice');

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientName: '',
    deliveryDate: '',
    termsOfPayment: 'partially',
  });

  const [items, setItems] = useState([
    { item: '', qty: 0, unitPrice: 0, totalPrice: 0, editing: true },
  ]);

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }, [i18n.language]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === 'qty' || field === 'unitPrice') {
      updatedItems[index].totalPrice =
        updatedItems[index].qty * updatedItems[index].unitPrice;
    }

    setItems(updatedItems);

    if (field === 'item' && value && index === items.length - 1) {
      setItems([
        ...items,
        { item: '', qty: 0, unitPrice: 0, totalPrice: 0, editing: true },
      ]);
    }
  };

  const toggleEdit = (index) => {
    const updatedItems = [...items];
    updatedItems[index].editing = !updatedItems[index].editing;
    setItems(updatedItems);
  };

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    console.log('Items:', items);
    alert('Invoice Created Successfully!');
  };

  return (
    <div className="invoice-page">
      <h1>{t('title')}</h1>
      <div className="invoice-form">
        <div className="invoice-field">
          <label>{t('invoiceNumber')}</label>
          <input
            type="text"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleInputChange}
            className="invoice-input"
            placeholder={t('invoiceNumberPlaceholder')}
          />
        </div>

        <div className="invoice-field">
          <label>{t('clientName')}</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            className="invoice-input"
            placeholder={t('clientNamePlaceholder')}
          />
        </div>

        <div className="invoice-field">
          <label>{t('deliveryDate')}</label>
          <input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleInputChange}
            className="invoice-input"
          />
        </div>

        <div className="invoice-field">
          <label>{t('termsOfPayment')}</label>
          <select
            name="termsOfPayment"
            value={formData.termsOfPayment}
            onChange={handleInputChange}
            className="invoice-input"
          >
            <option value="partially">{t('partiallyPaid')}</option>
            <option value="fully">{t('fullyPaid')}</option>
          </select>
        </div>

        <div className="invoice-table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>{t('item')}</th>
                <th>{t('qty')}</th>
                <th>{t('unitPrice')}</th>
                <th>{t('totalPrice')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry, index) => (
                <tr key={index}>
                  <td>
                    {entry.editing ? (
                      <input
                        type="text"
                        value={entry.item}
                        onChange={(e) =>
                          handleItemChange(index, 'item', e.target.value)
                        }
                        className="invoice-input"
                      />
                    ) : (
                      <span>{entry.item || '-'}</span>
                    )}
                  </td>
                  <td>
                    {entry.editing ? (
                      <input
                        type="number"
                        value={entry.qty}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'qty',
                            parseFloat(e.target.value),
                          )
                        }
                        className="invoice-input"
                      />
                    ) : (
                      <span>{entry.qty}</span>
                    )}
                  </td>
                  <td>
                    {entry.editing ? (
                      <input
                        type="number"
                        value={entry.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'unitPrice',
                            parseFloat(e.target.value),
                          )
                        }
                        className="invoice-input"
                      />
                    ) : (
                      <span>{entry.unitPrice}</span>
                    )}
                  </td>
                  <td>
                    <span>{entry.totalPrice}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => toggleEdit(index)}
                    >
                      <FiEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="create-invoice-btn" onClick={handleSubmit}>
          {t('createInvoice')}
        </button>
      </div>
    </div>
  );
};

export default CreateInvoice;
