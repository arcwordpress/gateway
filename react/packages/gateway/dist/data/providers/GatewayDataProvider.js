import React, { useMemo } from 'react';
import GatewayDataContext from "../contexts/GatewayDataContext";
import { createApiClient, resetApiClient } from "../services/apiClient";

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
import { jsx as _jsx } from "react/jsx-runtime";
export var GatewayDataProvider = _ref => {
  var apiUrl = _ref.apiUrl,
    auth = _ref.auth,
    children = _ref.children;
  var value = useMemo(() => {
    var config = {
      apiUrl: apiUrl || null,
      auth: auth || null
    };

    // Create a new API client with this configuration
    // This ensures all API calls within this provider use the same config
    if (apiUrl || auth) {
      createApiClient(config);
    }
    return config;
  }, [apiUrl, auth]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Reset the API client when provider unmounts
      // This is mainly useful for testing or when switching configurations
      if (value.apiUrl || value.auth) {
        resetApiClient();
      }
    };
  }, [value]);
  return /*#__PURE__*/_jsx(GatewayDataContext.Provider, {
    value: value,
    children: children
  });
};
export default GatewayDataProvider;