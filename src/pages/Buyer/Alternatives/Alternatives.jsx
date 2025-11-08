import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ItemCard from '@/components/ItemCard/ItemCard';
import './SmartSearch.css';

export default function Alternatives() {
  const { t, i18n } = useTranslation('smartSearch');
  const [searchParams] = useSearchParams();

  const rawItemId = searchParams.get('itemId')?.trim() ?? '';
  const rawText = searchParams.get('text')?.trim() ?? '';
  const text = rawText ? decodeURIComponent(rawText) : '';

  const lang = i18n.language;
  const isRTL = i18n.dir() === 'rtl';

  const [items, setItems] = useState([]); // array of {item, rank}
  const [originalQuery, setOriginalQuery] = useState(''); // name of the source item / text
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === PAGE TITLE ===
  useEffect(() => {
    document.title = t('pageTitle');
  }, [t, i18n.language]);

  // -----------------------------------------------------------------
  // 1. Validation
  // -----------------------------------------------------------------
  useEffect(() => {
    if (rawItemId && rawText) {
      setError(t('invalidBoth'));
      setLoading(false);
      return;
    }
    if (!rawItemId && !rawText) {
      setError(t('invalidMissing'));
      setLoading(false);
      return;
    }

    // -----------------------------------------------------------------
    // 2. Resolve the *original* name (only when we have an itemId)
    // -----------------------------------------------------------------
    const resolveOriginal = async () => {
      if (!rawItemId) {
        setOriginalQuery(text);
        return;
      }

      try {
        const base = import.meta.env.VITE_BACKEND_URL;
        // try product first
        const prod = await axios.get(
          `${base}/api/products/${rawItemId}?lang=${lang}`,
          {
            withCredentials: true,
          },
        );
        setOriginalQuery(prod.data.name);
      } catch (e1) {
        // not a product → try service
        try {
          const serv = await axios.get(
            `${base}/api/services/${rawItemId}?lang=${lang}`,
            {
              withCredentials: true,
            },
          );
          setOriginalQuery(serv.data.name);
        } catch (e2) {
          setError(t('itemNotFound'));
          setLoading(false);
        }
      }
    };

    resolveOriginal().then(() => {
      if (error) return; // already set above
      // -----------------------------------------------------------------
      // 3. Call the AI smart-search endpoint
      // -----------------------------------------------------------------
      const callSmart = async () => {
        setLoading(true);
        setError(null);
        try {
          const base = import.meta.env.VITE_BACKEND_URL;
          const body = rawItemId ? { itemId: rawItemId } : { text };
          const res = await axios.post(
            `${base}/api/smart-search?lang=${lang}`,
            body,
            { withCredentials: true },
          );

          console.log(res.data);

          // API always returns top-10 (or less)
          setItems((res.data ?? []).slice(0, 10));
        } catch (err) {
          const msg =
            err.response?.data?.error?.message ||
            err.response?.data?.message ||
            t('genericError');
          setError(msg);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      callSmart();
    });
  }, [rawItemId, rawText, text, lang, t, error]);

  // -----------------------------------------------------------------
  // UI helpers
  // -----------------------------------------------------------------
  const noResults = () => (
    <p className="status">
      {t('noResults')} "<strong>{originalQuery}</strong>".
    </p>
  );

  const showEmpty = !originalQuery && !loading;

  return (
    <div className="smart-search-page" dir={i18n.dir()}>
      {/* ---------- Header ---------- */}
      <div className="search-header">
        <h1>
          {t('title')} "<strong>{originalQuery}</strong>"
        </h1>
      </div>

      {/* ---------- Full-Width Blue Section ---------- */}
      <section className="full-width">
        <div className="results-grid-wrapper">
          <main className="results">
            {showEmpty ? (
              <p className="status">{t('enterSearchText')}</p>
            ) : loading ? (
              <p className="status">{t('loading')}</p>
            ) : error ? (
              <p className="status error">{error}</p>
            ) : items.length === 0 ? (
              noResults()
            ) : (
              <div className="results-grid">
                {items.map(({ item }, idx) => {
                  const mapped = {
                    _id: item.productId || item.serviceId,
                    name: item.name,
                    supplier: {
                      businessName: item.supplier?.businessName ?? 'Unknown',
                      supplierId: item.supplier?.supplierId,
                    },
                    imagesFilesUrls: item.imagesFilesUrls ?? [],
                    avgRating: item.avgRating ?? 0,
                    ratingsCount: item.ratingsCount ?? 0,
                    price: item.price ?? 0,
                    type: item.productId ? 'product' : 'service',
                  };
                  console.log(mapped);
                  return (
                    <ItemCard
                      key={`${mapped._id}-${idx}`}
                      item={mapped}
                      type={mapped.type}
                    />
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
