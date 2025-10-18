import React, { useEffect, useRef, useState } from 'react';

const TapCardForm = ({ onTokenGenerated }) => {
  const [tapLoaded, setTapLoaded] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    // Load Tap SDK dynamically (from CDN as per docs)
    const script = document.createElement('script');
    script.src = 'https://tap-sdks.b-cdn.net/card/1.0.2/index.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Tap SDK loaded');
      setTapLoaded(true);
    };
    script.onerror = (err) => console.error('❌ Failed to load Tap SDK', err);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!tapLoaded || !window.CardSDK || !formRef.current) return;

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
          saveCard: false, // we call saveCard manually -> forcing the users to save; we don't give them the option
        },
        interface: {
          theme: 'default',
          edges: 'round',
          locale: 'en',
          direction: 'ltr',
        },
        customer: {
          id: 'cus_TS03A1420252009Kj102909363', // TODO: make dynamic
        },
        onSuccess: async (token) => {
          console.log('✅ Token generated:', token);

          try {
            // console.log("💾 Saving card...");
            // await window.CardSDK.saveCard(); // doesn’t return, just triggers

            // // Use the card reference from token
            // console.log(
            //     "✅ Card saved (SDK returned nothing, using token.card.id):",
            //     token.card.id,
            // );

            // Send this to backend
            onTokenGenerated(token.id, token.card.id);
          } catch (err) {
            console.error('❌ Error saving card:', err);
          }
        },
        onError: (err) => console.error('❌ Tap error:', err),
      });

      // Save unmount reference
      formRef.current.__tapUnmount = unmount;
    } catch (err) {
      console.error('❌ Tap render error:', err);
    }

    return () => {
      formRef.current?.__tapUnmount?.();
    };
  }, [tapLoaded, onTokenGenerated]);

  const handleSubmit = async () => {
    if (!window.CardSDK?.tokenize || !window.CardSDK?.saveCard) {
      console.error('❌ Tap SDK not ready');
      return;
    }

    try {
      console.log('🔑 Tokenizing...');
      await window.CardSDK.tokenize();
    } catch (err) {
      console.error('❌ Error in tokenize/saveCard:', err);
    }
  };

  return (
    <div>
      <div ref={formRef}></div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!tapLoaded}
        style={{ marginTop: '1rem' }}
      >
        Submit Card
      </button>
    </div>
  );
};

export default TapCardForm;
