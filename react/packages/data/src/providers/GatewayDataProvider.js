import React, { useMemo } from 'react';
import GatewayDataContext from '../contexts/GatewayDataContext';
import { createApiClient, resetApiClient } from '../services/apiClient';

/**
 * GatewayDataProvider - Optional root provider for Gateway API configuration
 *
 * Allows overriding the default API configuration (URL and auth) for all
 * CollectionProviders in the tree. If not used, defaults to window globals.
 *
 * @param {Object} props
 * @param {string} props.apiUrl - Base API URL (defaults to window.wpApiSettings.root or '/wp-json/')
 * @param {Object} props.auth - Auth configuration { username, password } for Basic Auth
 * @param {React.ReactNode} props.children - Child components
 */
export const GatewayDataProvider = ({ apiUrl, auth, children }) => {
  const value = useMemo(() => {
    const config = {};

    if (apiUrl) {
      config.apiUrl = apiUrl;
    }

    if (auth) {
      config.auth = auth;
    }

    // Create a new API client with this configuration
    // This ensures all API calls within this provider use the same config
    if (Object.keys(config).length > 0) {
      createApiClient(config);
    }

    return config;
  }, [apiUrl, auth]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Reset the API client when provider unmounts
      // This is mainly useful for testing or when switching configurations
      if (Object.keys(value).length > 0) {
        resetApiClient();
      }
    };
  }, [value]);

  return (
    <GatewayDataContext.Provider value={value}>
      {children}
    </GatewayDataContext.Provider>
  );
};

export default GatewayDataProvider;
