import React, { useState } from 'react';
import './BuyerSettingsPayment.css';

export default function BuyerSettingsPayment() {
  const [hasSavedCard, setHasSavedCard] = useState(false);
  const [card, setCard] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  // عند الضغط على Save
  const handleSave = () => {
    if (card.number && card.number.length >= 4) {
      setHasSavedCard(true);
    }
  };

  // عند الضغط على حذف البطاقة
  const handleDelete = () => {
    setHasSavedCard(false);
    setCard({ name: '', number: '', expiry: '', cvv: '' });
  };

  // الحالة الثانية (بطاقة محفوظة)
  if (hasSavedCard) {
    return (
      <div className="payment-section">
        <h3 className="payment-title">Payment Method</h3>
        <div className="saved-card">
          <div className="saved-card-info">
            <img src="/logo.svg" alt="Mada logo" className="mada-logo" />
            <span className="saved-card-number">
              **** {card.number.slice(-4)}
            </span>
          </div>
          <button className="remove-card" onClick={handleDelete}>
            ❌
          </button>
        </div>
      </div>
    );
  }

  // الحالة الأولى (مافي بطاقة بعد)
  return (
    <div className="payment-section">
      <h3 className="payment-title">Payment Method</h3>
      <p className="payment-hint">
        You don’t have a saved card yet. Add one to make your payments easier.
      </p>

      <div className="payment-grid">
        <label>
          <span>Cardholder Name</span>
          <input
            value={card.name}
            onChange={(e) => setCard({ ...card, name: e.target.value })}
            placeholder="Cardholder Name"
          />
        </label>
        <label>
          <span>Card Number</span>
          <input
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
            placeholder="Card Number"
          />
        </label>
        <label>
          <span>MM/YY</span>
          <input
            value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: e.target.value })}
            placeholder="MM/YY"
          />
        </label>
        <label>
          <span>CVV</span>
          <input
            value={card.cvv}
            onChange={(e) => setCard({ ...card, cvv: e.target.value })}
            placeholder="CVV"
          />
        </label>
      </div>

      <button type="button" className="payment-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
