import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Tap.css';

const TapCardForm = ({ onTokenGenerated, isActive, onError, customerId }) => {
  const { t, i18n } = useTranslation('settings');
  const lang = i18n.language.toLowerCase();
  const [tapLoaded, setTapLoaded] = useState(false);
  const formRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const script = document.createElement('script');
    script.src = 'https://tap-sdks.b-cdn.net/card/1.0.2/index.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Tap SDK loaded');
      setTapLoaded(true);
    };
    script.onerror = (err) => {
      console.error('❌ Failed to load Tap SDK', err);
      onError?.(t('errors.loadCardFormFailed'));
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      setTapLoaded(false);
    };
  }, [isActive, onError, t]);

  useEffect(() => {
    if (
      !tapLoaded ||
      !window.CardSDK ||
      !formRef.current ||
      !wrapperRef.current
    )
      return;

    console.log('⚡ Initializing Tap Card form...');

    try {
      const { renderTapCard } = window.CardSDK;
      const { unmount } = renderTapCard(formRef.current, {
        publicKey: import.meta.env.VITE_TAP_PUBLIC_KEY,
        merchant: { id: import.meta.env.VITE_TAP_MERCHANT_ID },
        transaction: { amount: 1, currency: 'SAR' },
        fields: { cardHolder: true },
        addons: {
          displayPaymentBrands: true,
          loader: true,
          saveCard: false,
        },
        interface: {
          theme: 'default',
          edges: 'round',
          locale: lang,
          direction: lang === 'en' ? 'ltr' : 'rtl',
        },
        customer: {
          id: customerId,
        },
        onSuccess: async (token) => {
          console.log('✅ Token generated:', token);
          try {
            onTokenGenerated(token.id, token.card.id);
          } catch (err) {
            console.error('❌ Error saving card:', err);
            onError?.(t('errors.saveCardFailed'));
          }
        },
        onError: (err) => {
          console.error('❌ Tap error:', err);
          onError?.(err.message || t('errors.invalidCardDetails'));
        },
      });

      formRef.current.__tapUnmount = unmount;

      const observer = new MutationObserver(() => {
        const tapWrapper = document.querySelector(
          'div[id*="[object HTMLDivElement]"]',
        );
        if (tapWrapper && tapWrapper.parentNode !== wrapperRef.current) {
          console.log('🔧 Moving Tap wrapper to correct parent');
          wrapperRef.current.appendChild(tapWrapper);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        formRef.current?.__tapUnmount?.();
      };
    } catch (err) {
      console.error('❌ Tap render error:', err);
      onError?.(err.message || t('errors.renderCardFormFailed'));
    }
  }, [tapLoaded, onTokenGenerated, onError, customerId, t, lang]);

  const handleSubmit = async () => {
    if (!window.CardSDK?.tokenize) {
      console.error('❌ Tap SDK not ready');
      onError?.(t('errors.cardFormNotReady'));
      return;
    }

    try {
      console.log('🔑 Tokenizing...');
      await window.CardSDK.tokenize();
    } catch (err) {
      console.error('❌ Error in tokenize:', err);
      onError?.(err.message || t('errors.invalidCardDetails'));
    }
  };

  return (
    <div className="tap-card-wrapper" ref={wrapperRef}>
      {!tapLoaded ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>{t('payment.loading')}</p>
        </div>
      ) : (
        <>
          <div ref={formRef} className="tap-card-container"></div>
          <button
            type="button"
            className="payment-button"
            onClick={handleSubmit}
            disabled={!tapLoaded}
          >
            {t('payment.save')}
          </button>
        </>
      )}
    </div>
  );
};

export default TapCardForm;
