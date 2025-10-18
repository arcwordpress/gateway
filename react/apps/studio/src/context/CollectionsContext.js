import { createContext, useContext, useState, useEffect } from 'react';

const CollectionsContext = createContext();

export function CollectionsProvider({ children }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(
          `${window.gatewayAdminScript.apiUrl}gateway/v1/collections`,
          {
            headers: {
              'X-WP-Nonce': window.gatewayAdminScript.nonce,
            },
          }
        );

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
  }, []);

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
