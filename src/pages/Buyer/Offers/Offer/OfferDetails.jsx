import React, { useEffect } from 'react';
import './OfferDetails.css';
import { useTranslation } from 'react-i18next';

export default function OfferDetails() {
  const { t, i18n } = useTranslation('offerDetails');

  useEffect(() => {
    document.title = t('pageTitle.offerDetails', { ns: 'common' });
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n.language, t]);

  const offer = {
    supplierName: 'Vertex Suppliers',
    proposedAmount: '15,000',
    completionDate: '15/08/2025',
    technicalDetails:
      'We will supply energy-efficient LED streetlights with smart sensors & install them in 3 phases: pole setup, wiring and system integration. A team of 10 engineers & technicians will ensure quality & compliance.',
    duration:
      'The project will be completed in 4 months: 2 months for procurement and site preparation, followed by 2 months for installation and testing.',
    notes: 'None',
  };

  return (
    <div className={`offer-details-container ${i18n.dir()}`}>
      <div className="offer-details-card">
        <h2 className="offer-title">Supplier Offer Details</h2>
        <p className="offer-subtitle">
          Here is the offer submitted by the supplier for your bidding. You can
          review the details below:
        </p>

        <div className="offer-info">
          <p>
            <strong>Proposed Amount:</strong>
            <br />
            {offer.proposedAmount} SAR
          </p>

          <p>
            <strong>Expected Completion Time:</strong>
            <br />
            {offer.completionDate}
          </p>

          <p>
            <strong>Technical Offer Details:</strong>
            <br />
            {offer.technicalDetails}
          </p>

          <p>
            <strong>Project Execution Duration:</strong>
            <br />
            {offer.duration}
          </p>

          <p>
            <strong>Notes:</strong>
            <br />
            {offer.notes}
          </p>
        </div>

        <div className="offer-btns">
          <button className="decline-btn">Decline Offer</button>
          <button className="accept-btn">Accept Offer</button>
        </div>
      </div>
    </div>
  );
}
