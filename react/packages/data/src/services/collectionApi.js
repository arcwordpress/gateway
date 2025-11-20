import { getApiClient } from './apiClient';

/**
 * Collection Info API - handles /gateway/v1/collections routes
 */

/**
 * Unwrap API response data
 * Gateway API wraps responses in { data: {...} } but we want to return the unwrapped data
 * @param {Object} response - Axios response object
 * @returns {*} Unwrapped data
 */
const unwrapResponse = (response) => {
  // If response.data has a 'data' property, unwrap it
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  // Otherwise return response.data as-is
  return response.data;
};

/**
 * Fetch all collections
 * @param {Object} params - Query parameters
 * @param {string} params.package - Filter by package name
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Array>} Array of collections
 */
export const fetchCollections = async (params = {}, options = {}) => {
  const client = getApiClient();
  const config = { params };
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.get('gateway/v1/collections', config);
  const data = unwrapResponse(response);
  return Array.isArray(data) ? data : [];
};

/**
 * Fetch a single collection by key
 * @param {string} key - Collection key
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} Collection object
 */
export const fetchCollection = async (key, options = {}) => {
  const client = getApiClient();
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.get(`gateway/v1/collections/${key}`, config);
  return unwrapResponse(response);
};

/**
 * Collection Records API - handles standard CRUD routes
 */

/**
 * Build full endpoint from namespace and route
 * @param {string} namespace - REST namespace (e.g., 'gateway/v1')
 * @param {string} route - Collection route (e.g., 'events')
 * @returns {string} Full endpoint path
 */
const buildEndpoint = (namespace, route) => {
  return `${namespace}/${route}`;
};

/**
 * Fetch all records for a collection
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {Object} params - Query parameters (pagination, filters, etc.)
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Array>} Array of records
 */
export const fetchRecords = async (namespace, route, params = {}, options = {}) => {
  const client = getApiClient();
  const endpoint = buildEndpoint(namespace, route);
  const config = { params };
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.get(endpoint, config);
  const data = unwrapResponse(response);

  // Handle different response formats
  // Some endpoints return { items: [...] }
  // Others return direct arrays
  if (data?.items && Array.isArray(data.items)) {
    return data.items;
  } else if (Array.isArray(data)) {
    return data;
  }
  return [];
};

/**
 * Fetch a single record by ID
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {number|string} id - Record ID
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} Record object
 */
export const fetchRecord = async (namespace, route, id, options = {}) => {
  const client = getApiClient();
  const endpoint = buildEndpoint(namespace, route);
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.get(`${endpoint}/${id}`, config);
  return unwrapResponse(response);
};

/**
 * Create a new record
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {Object} data - Record data
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} Created record
 */
export const createRecord = async (namespace, route, data, options = {}) => {
  const client = getApiClient();
  const endpoint = buildEndpoint(namespace, route);
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.post(endpoint, data, config);
  return unwrapResponse(response);
};

/**
 * Update an existing record
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {number|string} id - Record ID
 * @param {Object} data - Updated record data
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} Updated record
 */
export const updateRecord = async (namespace, route, id, data, options = {}) => {
  const client = getApiClient();
  const endpoint = buildEndpoint(namespace, route);
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.patch(`${endpoint}/${id}`, data, config);
  return unwrapResponse(response);
};

/**
 * Delete a record
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {number|string} id - Record ID
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} Delete response
 */
export const deleteRecord = async (namespace, route, id, options = {}) => {
  const client = getApiClient();
  const endpoint = buildEndpoint(namespace, route);
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.delete(`${endpoint}/${id}`, config);
  return unwrapResponse(response);
};

export default {
  fetchCollections,
  fetchCollection,
  fetchRecords,
  fetchRecord,
  createRecord,
  updateRecord,
  deleteRecord,
};
