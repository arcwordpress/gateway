import { getApiClient } from './apiClient';

/**
 * Collection Info API - handles /gateway/v1/collections routes
 */

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
  const response = await client.get('collections', config);
  return response.data;
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
  const response = await client.get(`collections/${key}`, config);
  return response.data;
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
  // apiClient baseURL already includes the namespace (e.g. /wp-json/gateway/v1),
  // so we only need the route segment here.
  return route;
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
  return response.data;
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
  return response.data;
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
  return response.data;
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
  return response.data;
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
  return response.data;
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
