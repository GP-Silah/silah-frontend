import React, { useEffect } from 'react';
import './ReceivedOffers.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function BiddingOffersBuyer() {
  const { t, i18n } = useTranslation(['receivedOffers', 'common']);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = t('pageTitle', { ns: 'common' });
    document.documentElement.setAttribute('dir', i18n.dir());
  }, [i18n.language, t]);

  const offers = [
    {
      id: 1,
      supplier: 'Vertex Suppliers',
      offerDate: '06/Feb/2025',
      proposedAmount: '15,000',
      completionTime: '4 months',
    },
    {
      id: 2,
      supplier: 'Logen Industries',
      offerDate: '07/Feb/2025',
      proposedAmount: '25,000',
      completionTime: '6 months',
    },
  ];

  return (
    <div className="bids-container">
      <div className="bids-header">
        <h2 className="bids-title">{t('pageTitle')}</h2>
      </div>

      <div className="bids-list">
        {offers.map((offer) => (
          <div key={offer.id} className="bid-card">
            <div className="offer-header">
              <p className="offer-date">
                {t('offerDate')}: {offer.offerDate}
              </p>
            </div>

            <div className="offer-body">
              {/* مكان الصورة */}
              <div className="offer-logo">LOGO</div>
              <div className="offer-info">
                <h3 className="offer-supplier">
                  {t('supplier')}: {offer.supplier}
                </h3>
                <p>
                  {t('proposedAmount')}: <strong>{offer.proposedAmount}</strong>
                </p>
                <p>
                  {t('completionTime')}: <strong>{offer.completionTime}</strong>
                </p>
              </div>
            </div>

            <div className="offer-buttons">
              <button className="decline-btn">{t('decline')}</button>
              <button className="accept-btn">{t('accept')}</button>
              {/* <button className="view-btn">{t('viewDetails')}</button> */}
              <button
                onKlick={() => navigate('/buyer/offers/offer-details')}
                className="view-btn"
              >
                {t('viewDetails')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
