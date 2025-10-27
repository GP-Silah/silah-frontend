import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './PaymentCallback.css';

export default function PaymentCallback() {
  const { t } = useTranslation('payment');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const paymentConfig = {
    card: {
      confirmEndpoint: `${
        import.meta.env.VITE_BACKEND_URL
      }/api/buyers/me/card/confirm`,
      requestBody: (params) => ({ chargeId: params.get('tap_id') }),
      redirectTo: '/buyer/settings?tab=payment',
      successKey: 'success.cardSaved',
      errorKey: 'errors.saveCardFailed',
    },
    checkout: {
      confirmEndpoint: `${import.meta.env.VITE_BACKEND_URL}/api/cart/checkout`,
      requestBody: (params) => ({ chargeId: params.get('tap_id') }),
      redirectTo: (params) =>
        `/order/confirmation?orderId=${params.get('orderId') || ''}`,
      successKey: 'success.orderCompleted',
      errorKey: 'errors.checkoutFailed',
    },
    invoice: {
      confirmEndpoint: `${import.meta.env.VITE_BACKEND_URL}/api/cart/checkout`,
      requestBody: (params) => ({
        chargeId: params.get('tap_id'),
        invoiceId: params.get('invoiceId') || '',
      }),
      redirectTo: (params) => `/invoices/${params.get('invoiceId') || ''}`,
      successKey: 'success.invoicePaid',
      errorKey: 'errors.paymentFailed',
    },
  };

  useEffect(() => {
    const finishPayment = async () => {
      const chargeId = searchParams.get('tap_id');
      const type = searchParams.get('type') || 'card'; // Default to card if type is missing
      const config = paymentConfig[type] || paymentConfig.card;

      if (!chargeId) {
        setMessage(t('errors.missingChargeId'));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          config.confirmEndpoint,
          config.requestBody(searchParams),
          { withCredentials: true },
        );

        setMessage(t(config.successKey));
        setTimeout(() => {
          const redirectTo =
            typeof config.redirectTo === 'function'
              ? config.redirectTo(searchParams)
              : config.redirectTo;
          navigate(redirectTo);
        }, 2000);
      } catch (err) {
        setMessage(err.response?.data?.error?.message || t(config.errorKey));
      } finally {
        setLoading(false);
      }
    };

    finishPayment();
  }, [searchParams, navigate, t]);

  return (
    <div className="dashboard-container">
      <div className="page-content">
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>{t('payment.loading')}</p>
          </div>
        ) : (
          <p
            className={
              message.includes('success') || message.includes('بنجاح')
                ? 'success-text'
                : 'error-text'
            }
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
