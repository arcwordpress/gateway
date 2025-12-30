import { createContext, useContext, useState, useEffect, useCallback } from '@wordpress/element';
import axios from 'axios';

const ActiveExtensionContext = createContext();

export const useActiveExtension = () => {
  const context = useContext(ActiveExtensionContext);
  if (!context) {
    throw new Error('useActiveExtension must be used within ActiveExtensionProvider');
  }
  return context;
};

export const ActiveExtensionProvider = ({ children }) => {
  const [activeExtension, setActiveExtension] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async (extensionKey) => {
    if (!extensionKey) {
      setCollections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${window.gatewayAdminScript.apiUrl}gateway/v1/extensions/${extensionKey}/collections`,
        {
          headers: {
            'X-WP-Nonce': window.gatewayAdminScript.nonce,
          },
        }
      );

      if (response.data.success) {
        setCollections(response.data.collections);
      } else {
        setError('Failed to load collections');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch collections');
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch collections when active extension changes
  useEffect(() => {
    if (activeExtension?.key) {
      fetchCollections(activeExtension.key);
    } else {
      setCollections([]);
      setLoading(false);
    }
  }, [activeExtension, fetchCollections]);

  const value = {
    activeExtension,
    setActiveExtension,
    collections,
    collectionsLoading: loading,
    collectionsError: error,
    refetchCollections: () => activeExtension?.key && fetchCollections(activeExtension.key),
  };

  return (
    <ActiveExtensionContext.Provider value={value}>
      {children}
    </ActiveExtensionContext.Provider>
  );
};
