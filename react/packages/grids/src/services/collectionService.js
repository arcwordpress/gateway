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
 * Get auth options from window.gatewayAuth if available
 * For headless environments using Basic Auth
 */
const getAuthOptions = () => {
  if (window.gatewayAuth && window.gatewayAuth.username && window.gatewayAuth.password) {
    return window.gatewayAuth;
  }
  return null;
};

/**
 * Build axios config with authentication (nonce or basic auth)
 */
const buildAxiosConfig = (options = {}) => {
  const config = { headers: {} };

  // Priority 1: Use auth from options parameter
  if (options.auth) {
    config.headers['Authorization'] = 'Basic ' + btoa(`${options.auth.username}:${options.auth.password}`);
    config.withCredentials = false;
    console.log('[Gateway Grid API] Using Basic Auth from options');
  }
  // Priority 2: Check for auth in window.gatewayAuth
  else if (getAuthOptions()) {
    const auth = getAuthOptions();
    config.headers['Authorization'] = 'Basic ' + btoa(`${auth.username}:${auth.password}`);
    config.withCredentials = false;
    console.log('[Gateway Grid API] Using Basic Auth from window.gatewayAuth');
  }
  // Priority 3: Use nonce if available
  else {
    const nonce = getNonce();
    if (nonce) {
      config.headers['X-WP-Nonce'] = nonce;
      console.log('[Gateway Grid API] Using Nonce');
    } else {
      console.log('[Gateway Grid API] No auth available');
    }
  }

  return config;
};

/**
 * Create axios instance with default config
 */
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication to requests
apiClient.interceptors.request.use((config) => {
  const authConfig = buildAxiosConfig();
  config.headers = { ...config.headers, ...authConfig.headers };
  if (authConfig.withCredentials === false) {
    config.withCredentials = false;
  }
  console.log('API Request:', config.url);
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized - Auth may be invalid or missing');
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch all registered collections
 * @returns {Promise} Promise resolving to array of collections
 */
export const fetchCollections = async () => {
  try {
    const response = await apiClient.get('gateway/v1/collections');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

/**
 * Fetch a single collection by key
 * @param {string} key - Collection key
 * @returns {Promise} Promise resolving to collection object
 */
export const fetchCollection = async (key) => {
  try {
    const response = await apiClient.get(`gateway/v1/collections/${key}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching collection ${key}:`, error);
    throw error;
  }
};

/**
 * Fetch collection data (all records from a collection)
 * @param {string} namespace - REST API namespace (e.g., 'gateway/v1')
 * @param {string} route - Collection route (e.g., 'tickets')
 * @param {Object} params - Query parameters (page, per_page, search, filters, etc.)
 * @returns {Promise} Promise resolving to collection data
 */
export const fetchCollectionData = async (namespace, route, params = {}) => {
  try {
    const url = `${namespace}/${route}`;
    const response = await apiClient.get(url, { params });
    // API returns { data: { items: [...] } }, axios wraps it in response.data
    // So response.data.data.items contains the actual array of records
    return response.data.data?.items || response.data.items || [];
  } catch (error) {
    console.error(`Error fetching data from ${namespace}/${route}:`, error);
    throw error;
  }
};

/**
 * Fetch a single record from a collection
 * @param {string} namespace - REST API namespace (e.g., 'gateway/v1')
 * @param {string} route - Collection route (e.g., 'tickets')
 * @param {number} id - Record ID
 * @returns {Promise} Promise resolving to record data
 */
export const fetchRecord = async (namespace, route, id) => {
  try {
    const url = `${namespace}/${route}/${id}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching record ${id} from ${namespace}/${route}:`, error);
    throw error;
  }
};

/**
 * Delete a record from a collection
 * @param {string} namespace - REST API namespace (e.g., 'gateway/v1')
 * @param {string} route - Collection route (e.g., 'tickets')
 * @param {number} id - Record ID
 * @returns {Promise} Promise resolving when delete is successful
 */
export const deleteRecord = async (namespace, route, id) => {
  try {
    const url = `${namespace}/${route}/${id}`;
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error) {
    console.error(`Error deleting record ${id} from ${namespace}/${route}:`, error);
    throw error;
  }
};

/**
 * Update a record in a collection
 * @param {string} namespace - REST API namespace (e.g., 'gateway/v1')
 * @param {string} route - Collection route (e.g., 'tickets')
 * @param {number} id - Record ID
 * @param {Object} data - Record data to update
 * @returns {Promise} Promise resolving to updated record data
 */
export const updateRecord = async (namespace, route, id, data) => {
  try {
    const url = `${namespace}/${route}/${id}`;
    const response = await apiClient.patch(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating record ${id} from ${namespace}/${route}:`, error);
    throw error;
  }
};

export default apiClient;
