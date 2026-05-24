import { useState, useEffect } from 'react';

/**
 * Factory that wraps an async fetcher with a singleton cache and returns
 * a store object paired with a React hook.
 *
 * Designed for "load once, share everywhere" data — e.g. fetching all
 * records needed for navigation or routing at app boot.
 *
 * const { store, useStore } = createStore(async () => {
 *   const res = await api.get('items');
 *   return res.data.data.items;
 * });
 *
 * store.fetch()      — call imperatively; deduplicates concurrent calls
 * store.clearCache() — force a refetch on the next fetch() / useStore() call
 * useStore()         — React hook: { data, loading, error }
 */
export function createStore(fetcher) {
    let cachedData = null;
    let pending = false;
    let listeners = [];

    const store = {
        async fetch() {
            if (cachedData) return cachedData;
            if (pending) {
                return new Promise(resolve => listeners.push(resolve));
            }
            pending = true;
            try {
                cachedData = await fetcher();
                listeners.forEach(resolve => resolve(cachedData));
                listeners = [];
                return cachedData;
            } finally {
                pending = false;
            }
        },

        clearCache() {
            cachedData = null;
        },
    };

    function useStore() {
        const [data, setData] = useState(cachedData);
        const [isLoading, setIsLoading] = useState(!cachedData);
        const [error, setError] = useState(null);

        useEffect(() => {
            if (cachedData) {
                setData(cachedData);
                setIsLoading(false);
                return;
            }

            store.fetch()
                .then(fetchedData => {
                    setData(fetchedData);
                    setError(null);
                })
                .catch(err => {
                    setError(err.message);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, []);

        return { data, loading: isLoading, error };
    }

    return { store, useStore };
}
