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
  return null;
};

/**
 * Helper to build axios config for auth/nonce
 */
const buildAxiosConfig = (options = {}) => {
  const config = { headers: {} };
  if (options.auth) {
    config.headers['Authorization'] = 'Basic ' + btoa(`${options.auth.username}:${options.auth.password}`);
    config.withCredentials = false; // Suppress cookies only for Basic Auth
    console.log('[Gateway API] Using Basic Auth:', options.auth);
  } else if (options.nonce) {
    config.headers['X-WP-Nonce'] = options.nonce;
    console.log('[Gateway API] Using Nonce:', options.nonce);
  } else {
    // Auto-detect nonce from window globals
    const nonce = getNonce();
    if (nonce) {
      config.headers['X-WP-Nonce'] = nonce;
      console.log('[Gateway API] Using auto-detected Nonce');
    } else {
      console.log('[Gateway API] No Auth provided');
    }
  }
  return config;
};

/**
 * Get all collections
 */
export const getCollections = async (options = {}) => {
  console.log('[Gateway API] getCollections options:', options);
  return axios.get(
    getApiBaseUrl() + 'gateway/v1/collections',
    buildAxiosConfig(options)
  );
};

/**
 * Get a single collection by key
 */
export const getCollection = async (key, options = {}) => {
  console.log('[Gateway API] getCollection options:', options);
  return axios.get(
    getApiBaseUrl() + `gateway/v1/collections/${key}`,
    buildAxiosConfig(options)
  ).then(response => response.data);
};

/**
 * Get a single record by ID
 */
export const getRecord = async (endpoint, id, options = {}) => {
  console.log('[Gateway API] getRecord options:', options);
  return axios.get(
    `${endpoint}/${id}`,
    buildAxiosConfig(options)
  ).then(response => response.data);
};

/**
 * Create a new record using the collection endpoint
 */
export const createRecord = async (endpoint, data, options = {}) => {
  console.log('[Gateway API] createRecord options:', options);
  const config = buildAxiosConfig(options);
  config.headers['Content-Type'] = 'application/json';
  return axios.post(endpoint, data, config)
    .then(response => response.data);
};

/**
 * Update an existing record
 */
export const updateRecord = async (endpoint, id, data, options = {}) => {
  console.log('[Gateway API] updateRecord options:', options);
  const config = buildAxiosConfig(options);
  config.headers['Content-Type'] = 'application/json';
  return axios.put(`${endpoint}/${id}`, data, config)
    .then(response => response.data);
};
