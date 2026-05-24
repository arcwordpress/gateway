import { useState, useEffect } from '@wordpress/element';

/**
 * Factory that wraps an async fetcher with a simple singleton cache and
 * returns a store object paired with a React hook.
 *
 * Usage:
 *   const { store, useStore } = createStore(async () => { ... return data; });
 *   // store.fetch()      — call programmatically
 *   // store.clearCache() — force a refetch next time
 *   // useStore()         — React hook: { data, loading, error }
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
            } catch (error) {
                throw error;
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
