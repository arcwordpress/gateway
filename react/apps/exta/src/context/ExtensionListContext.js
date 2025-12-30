import { createContext, useContext, useState, useEffect, useCallback } from '@wordpress/element';
import axios from 'axios';

const ExtensionListContext = createContext();

export const useExtensionList = () => {
  const context = useContext(ExtensionListContext);
  if (!context) {
    throw new Error('useExtensionList must be used within ExtensionListProvider');
  }
  return context;
};

export const ExtensionListProvider = ({ children }) => {
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExtensions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${window.gatewayAdminScript.apiUrl}gateway/v1/extensions`,
        {
          headers: {
            'X-WP-Nonce': window.gatewayAdminScript.nonce,
          },
        }
      );

      if (response.data.success) {
        setExtensions(response.data.extensions);
      } else {
        setError('Failed to load extensions');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch extensions');
      console.error('Error fetching extensions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExtensions();
  }, [fetchExtensions]);

  const value = {
    extensions,
    loading,
    error,
    refetch: fetchExtensions,
  };

  return (
    <ExtensionListContext.Provider value={value}>
      {children}
    </ExtensionListContext.Provider>
  );
};
