import { createContext, useContext, useState, useEffect } from 'react';

const CollectionsContext = createContext();

export function CollectionsProvider({ children, packageKey }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        // Build URL with package filter
        const url = new URL(`${window.gatewayAdminScript.apiUrl}gateway/v1/collections`);
        if (packageKey) {
          url.searchParams.append('package', packageKey);
        }

        const response = await fetch(url.toString(), {
          headers: {
            'X-WP-Nonce': window.gatewayAdminScript.nonce,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch collections');
        }

        const data = await response.json();
        setCollections(data.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCollections();
  }, [packageKey]);

  return (
    <CollectionsContext.Provider value={{ collections, loading, error }}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollections must be used within CollectionsProvider');
  }
  return context;
}
