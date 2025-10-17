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
 * Create axios instance with default config
 */
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add nonce to requests if available
apiClient.interceptors.request.use((config) => {
  const nonce = getNonce();
  if (nonce) {
    config.headers['X-WP-Nonce'] = nonce;
  }
  console.log('API Request:', config.url, 'Nonce:', nonce ? 'present' : 'missing');
  return config;
});

// Handle 401 errors - could be nonce issue
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized - Nonce may be invalid or missing', {
        nonce: getNonce(),
        wpApiSettings: window.wpApiSettings
      });
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

export default apiClient;
