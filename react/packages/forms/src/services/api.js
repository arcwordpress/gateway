import axios from 'axios';

/**
 * Get the WordPress REST API base URL
 */
const getApiBaseUrl = () => {
  // Check gatewayAdminScript first (set by Gateway plugin)
  if (window.gatewayAdminScript && window.gatewayAdminScript.apiUrl) {
    return window.gatewayAdminScript.apiUrl;
  }
  // Fallback to wpApiSettings global object
  if (window.wpApiSettings && window.wpApiSettings.root) {
    return window.wpApiSettings.root;
  }
  // Fallback to standard WordPress REST API path
  return '/wp-json/';
};

/**
 * Get the WordPress REST API nonce for authentication
 */
const getNonce = () => {
  // Check gatewayAdminScript first (set by Gateway plugin)
  if (window.gatewayAdminScript && window.gatewayAdminScript.nonce) {
    return window.gatewayAdminScript.nonce;
  }
  // Fallback to wpApiSettings
  if (window.wpApiSettings && window.wpApiSettings.nonce) {
    return window.wpApiSettings.nonce;
  }
  return '';
};

// Create axios instance with WordPress REST API configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'X-WP-Nonce': getNonce(),
  },
});

// Add request interceptor to ensure nonce is always fresh
api.interceptors.request.use((config) => {
  const nonce = getNonce();
  if (nonce) {
    config.headers['X-WP-Nonce'] = nonce;
  }
  return config;
});

/**
 * Get all collections
 */
export const getCollections = async () => {
  const response = await api.get('gateway/v1/collections');
  return response.data;
};

/**
 * Get a single collection by key
 * @param {string} key - Collection key (lowercase with underscores)
 */
export const getCollection = async (key) => {
  const response = await api.get(`gateway/v1/collections/${key}`);
  return response.data;
};

/**
 * Get a single record by ID
 * @param {string} endpoint - Full API endpoint URL
 * @param {number} id - Record ID
 */
export const getRecord = async (endpoint, id) => {
  const response = await axios.get(`${endpoint}/${id}`, {
    headers: {
      'X-WP-Nonce': getNonce(),
    },
  });
  return response.data;
};

/**
 * Create a new record using the collection endpoint
 * @param {string} endpoint - Full API endpoint URL
 * @param {object} data - Data to create
 */
export const createRecord = async (endpoint, data) => {
  const response = await axios.post(endpoint, data, {
    headers: {
      'X-WP-Nonce': getNonce(),
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

/**
 * Update an existing record
 * @param {string} endpoint - Full API endpoint URL
 * @param {number} id - Record ID
 * @param {object} data - Data to update
 */
export const updateRecord = async (endpoint, id, data) => {
  const response = await axios.put(`${endpoint}/${id}`, data, {
    headers: {
      'X-WP-Nonce': getNonce(),
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export default api;
