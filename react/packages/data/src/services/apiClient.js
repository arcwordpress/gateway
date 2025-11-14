import axios from 'axios';

/**
 * Get API configuration from window globals or provided config
 */
const getApiConfig = (overrides = {}) => {
  const apiUrl = overrides.apiUrl ||
                 window.gatewayAdminScript?.apiUrl ||
                 window.wpApiSettings?.root ||
                 '/wp-json/';

  return {
    apiUrl,
    auth: overrides.auth || null,
  };
};

/**
 * Get authentication headers based on priority:
 * 1. Provided auth options
 * 2. window.gatewayAuth (Basic Auth for headless)
 * 3. window.gatewayAdminScript.nonce (WordPress nonce)
 * 4. window.wpApiSettings.nonce (fallback WordPress nonce)
 */
const getAuthHeaders = (authOptions = null) => {
  const headers = {};
  let suppressCredentials = false;

  // Priority 1: Use provided auth options
  if (authOptions?.username && authOptions?.password) {
    const credentials = btoa(`${authOptions.username}:${authOptions.password}`);
    headers['Authorization'] = `Basic ${credentials}`;
    suppressCredentials = true;
  }
  // Priority 2: Check for window.gatewayAuth (headless environment)
  else if (window.gatewayAuth?.username && window.gatewayAuth?.password) {
    const credentials = btoa(`${window.gatewayAuth.username}:${window.gatewayAuth.password}`);
    headers['Authorization'] = `Basic ${credentials}`;
    suppressCredentials = true;
  }
  // Priority 3: Check for WordPress nonce
  else if (window.gatewayAdminScript?.nonce) {
    headers['X-WP-Nonce'] = window.gatewayAdminScript.nonce;
  }
  // Priority 4: Fallback to wpApiSettings nonce
  else if (window.wpApiSettings?.nonce) {
    headers['X-WP-Nonce'] = window.wpApiSettings.nonce;
  }

  return { headers, suppressCredentials };
};

/**
 * Create and configure the API client
 */
export const createApiClient = (config = {}) => {
  const { apiUrl } = getApiConfig(config);

  const client = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add authentication headers
  client.interceptors.request.use(
    (requestConfig) => {
      const { headers, suppressCredentials } = getAuthHeaders(config.auth);

      // Merge auth headers
      requestConfig.headers = {
        ...requestConfig.headers,
        ...headers,
      };

      // Suppress credentials for Basic Auth
      if (suppressCredentials) {
        requestConfig.withCredentials = false;
      }

      return requestConfig;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle common errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('Authentication failed. Please check your credentials.');

        // Optionally trigger a custom event for global auth error handling
        window.dispatchEvent(new CustomEvent('gateway:auth:error', {
          detail: error
        }));
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Export a singleton instance with default configuration
let defaultClient = null;

export const getApiClient = (config = {}) => {
  if (!defaultClient || Object.keys(config).length > 0) {
    defaultClient = createApiClient(config);
  }
  return defaultClient;
};

/**
 * Reset the default client (useful for testing or config changes)
 */
export const resetApiClient = () => {
  defaultClient = null;
};

export default {
  createApiClient,
  getApiClient,
  resetApiClient,
};
