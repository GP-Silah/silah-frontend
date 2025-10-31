import React, { createContext, useContext, useMemo, useReducer } from 'react';

const CatalogCtx = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'UPSERT_ITEM': {
      const i = state.items.findIndex((x) => x.id === action.item.id);
      if (i === -1) return { ...state, items: [action.item, ...state.items] };
      const next = [...state.items];
      next[i] = { ...next[i], ...action.item };
      return { ...state, items: next };
    }
    case 'REMOVE_ITEMS': {
      const del = new Set(action.ids);
      return { ...state, items: state.items.filter((x) => !del.has(x.id)) };
    }
    case 'TOGGLE_FAVORITE': {
      const next = state.items.map((x) =>
        x.id === action.id ? { ...x, favorite: !x.favorite } : x,
      );
      return { ...state, items: next };
    }
    case 'SET_STATUS_BULK': {
      const ids = new Set(action.ids);
      const next = state.items.map((x) =>
        ids.has(x.id) ? { ...x, status: action.status } : x,
      );
      return { ...state, items: next };
    }
    case 'DUPLICATE_BULK': {
      const ids = new Set(action.ids);
      const toDup = state.items.filter((x) => ids.has(x.id));
      const copies = toDup.map((x) => ({
        ...x,
        id: `${x.id}-copy-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`,
        name: `${x.name} (Copy)`,
        status: 'unpublished',
      }));
      return { ...state, items: [...copies, ...state.items] };
    }
    default:
      return state;
  }
}

const initialState = { items: [] };

export function CatalogProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const api = useMemo(
    () => ({
      items: state.items,
      upsertItem: (item) => dispatch({ type: 'UPSERT_ITEM', item }),
      removeItems: (ids) => dispatch({ type: 'REMOVE_ITEMS', ids }),
      toggleFavorite: (id) => dispatch({ type: 'TOGGLE_FAVORITE', id }),
      setStatusBulk: (ids, status) =>
        dispatch({ type: 'SET_STATUS_BULK', ids, status }),
      duplicateBulk: (ids) => dispatch({ type: 'DUPLICATE_BULK', ids }),
    }),
    [state.items],
  );

  return <CatalogCtx.Provider value={api}>{children}</CatalogCtx.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogCtx);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
