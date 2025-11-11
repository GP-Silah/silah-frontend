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

  const [items, setItems] = useState([]); // [{ item, rank }]
  const [originalQuery, setOriginalQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === PAGE TITLE ===
  useEffect(() => {
    document.title = t('pageTitle');
  }, [t, i18n.language]);

  // ==================================================================
  // MAIN EFFECT
  // ==================================================================
  useEffect(() => {
    // -----------------------------------------------------------------
    // 1. Validate query params
    // -----------------------------------------------------------------
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
    // 2. Resolve original item name (only if itemId provided)
    // -----------------------------------------------------------------
    const resolveOriginal = async () => {
      if (!rawItemId) {
        setOriginalQuery(text);
        return;
      }

      const base = import.meta.env.VITE_BACKEND_URL;

      try {
        // Try product first
        const res = await axios.get(
          `${base}/api/products/${rawItemId}?lang=${lang}`,
          {
            withCredentials: true,
          },
        );
        setOriginalQuery(res.data.name);
      } catch (e1) {
        // Not a product → try service
        try {
          const res = await axios.get(
            `${base}/api/services/${rawItemId}?lang=${lang}`,
            {
              withCredentials: true,
            },
          );
          setOriginalQuery(res.data.name);
        } catch (e2) {
          // Invalid ID (404 or malformed) → show user-friendly error
          setError(t('itemNotFound'));
          setLoading(false);
        }
      }
    };

    // -----------------------------------------------------------------
    // 3. Call AI smart-search
    // -----------------------------------------------------------------
    const callSmartSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        const base = import.meta.env.VITE_BACKEND_URL;
        const body = rawItemId ? { itemId: rawItemId } : { text };
        const res = await axios.post(
          `${base}/api/smart-search?lang=${lang}`,
          body,
          {
            withCredentials: true,
          },
        );

        // Sort by rank (rank 1 = first)
        const sorted = (res.data ?? [])
          .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
          .slice(0, 10); // max 10

        setItems(sorted);
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

    // -----------------------------------------------------------------
    // Execute flow
    // -----------------------------------------------------------------
    if (rawItemId) {
      resolveOriginal().then(() => {
        if (!error) callSmartSearch();
      });
    } else {
      setOriginalQuery(text);
      callSmartSearch();
    }
  }, [rawItemId, rawText, text, lang, t, error]);

  // ==================================================================
  // UI HELPERS
  // ==================================================================
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
                    isAvailable: item.productId ? item.stock > 0 : true,
                  };

                  return (
                    <ItemCard
                      key={`${mapped._id}-${idx}`}
                      item={mapped}
                      type={mapped.type}
                      isAvailable={mapped.isAvailable}
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
