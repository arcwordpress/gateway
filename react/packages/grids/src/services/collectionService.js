import axios from 'axios';

/**
 * Get the WordPress REST API base URL
 */
const getApiBaseUrl = () => {

  // Check gatewayAdminScript first (set by Gateway plugin)
  if (window.gatewayAdminScript && window.gatewayAdminScript.apiUrl) {
    return window.gatewayAdminScript.apiUrl;
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

  return null;
  
};

// Removed getAuthOptions. Auth is now passed via options/auth param only.

/**
 * Build axios config with authentication (nonce or basic auth)
 */
const buildAxiosConfig = (options = {}) => {
  const config = { headers: {} };

  // Use auth from options parameter if provided
  if (options.auth) {
    config.headers['Authorization'] = 'Basic ' + btoa(`${options.auth.username}:${options.auth.password}`);
    config.withCredentials = false;
    console.log('[Gateway Grid API] Using Basic Auth from options');
  } else {
    // Fallback to nonce if available
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

// Remove global interceptor. Auth is now passed per-request.

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
export const fetchCollections = async (options = {}) => {
  try {
    const axiosConfig = buildAxiosConfig(options);
    const response = await apiClient.get('gateway/v1/collections', axiosConfig);
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
export const fetchCollection = async (key, options = {}) => {
  try {
    const axiosConfig = buildAxiosConfig(options);
    const response = await apiClient.get(`gateway/v1/collections/${key}`, axiosConfig);
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
export const fetchCollectionData = async (namespace, route, params = {}, options = {}) => {
  try {
    const url = `${namespace}/${route}`;
    const axiosConfig = buildAxiosConfig(options);
    axiosConfig.params = params;
    const response = await apiClient.get(url, axiosConfig);
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
export const fetchRecord = async (namespace, route, id, options = {}) => {
  try {
    const url = `${namespace}/${route}/${id}`;
    const axiosConfig = buildAxiosConfig(options);
    const response = await apiClient.get(url, axiosConfig);
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
export const deleteRecord = async (namespace, route, id, options = {}) => {
  try {
    const url = `${namespace}/${route}/${id}`;
    const axiosConfig = buildAxiosConfig(options);
    const response = await apiClient.delete(url, axiosConfig);
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
export const updateRecord = async (namespace, route, id, data, options = {}) => {
  try {
    const url = `${namespace}/${route}/${id}`;
    const axiosConfig = buildAxiosConfig(options);
    const response = await apiClient.patch(url, data, axiosConfig);
    return response.data;
  } catch (error) {
    console.error(`Error updating record ${id} from ${namespace}/${route}:`, error);
    throw error;
  }
};

export default apiClient;
