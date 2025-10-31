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
  const [isSuccess, setIsSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(3);

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

  // 1. ORIGINAL PAYMENT LOGIC — UNCHANGED
  useEffect(() => {
    const finishPayment = async () => {
      const chargeId = searchParams.get('tap_id');
      const type = searchParams.get('type') || 'card';
      const config = paymentConfig[type] || paymentConfig.card;

      if (!chargeId) {
        setMessage(t('errors.missingChargeId'));
        setLoading(false);
        return;
      }

      try {
        await axios.put(
          config.confirmEndpoint,
          config.requestBody(searchParams),
          { withCredentials: true },
        );

        setMessage(t(config.successKey));
        setIsSuccess(true);
      } catch (err) {
        setMessage(err.response?.data?.error?.message || t(config.errorKey));
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    finishPayment();
  }, [searchParams, t]);

  // 2. COUNTDOWN + REDIRECT
  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          const type = searchParams.get('type') || 'card';
          const config = paymentConfig[type] || paymentConfig.card;
          const redirectTo =
            typeof config.redirectTo === 'function'
              ? config.redirectTo(searchParams)
              : config.redirectTo;

          navigate(redirectTo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, searchParams, navigate]);

  // 3. RENDER — NEW CARD UI
  return (
    <div className="payment-callback-backdrop">
      <div className="payment-card">
        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p>{t('payment.loading')}</p>
          </div>
        ) : (
          <>
            <div className={`icon ${isSuccess ? 'success' : 'error'}`}>
              {isSuccess ? (
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  />
                </svg>
              )}
            </div>

            <p className="message">{message}</p>

            <p className="countdown">
              {t('payment.redirecting', { seconds: secondsLeft })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
