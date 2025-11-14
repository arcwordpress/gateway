import { createContext } from 'react';

/**
 * Context for global Gateway API configuration
 * Provides API client configuration that can be overridden from defaults
 */
export const GatewayDataContext = createContext({
  apiUrl: null,
  auth: null,
});

export default GatewayDataContext;
