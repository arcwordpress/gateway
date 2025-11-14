import { getApiClient } from './apiClient';

/**
 * Collection Info API - handles /gateway/v1/collections routes
 */

/**
 * Fetch all collections
 * @param {Object} params - Query parameters
 * @param {string} params.package - Filter by package name
 * @returns {Promise<Array>} Array of collections
 */
export const fetchCollections = async (params = {}) => {
  const client = getApiClient();
  const response = await client.get('gateway/v1/collections', { params });
  return response.data.data || [];
};

/**
 * Fetch a single collection by key
 * @param {string} key - Collection key
 * @returns {Promise<Object>} Collection object
 */
export const fetchCollection = async (key) => {
  const client = getApiClient();
  const response = await client.get(`gateway/v1/collections/${key}`);
  return response.data.data || null;
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
 * @returns {Promise<Array>} Array of records
 */
export const fetchRecords = async (namespace, route, params = {}) => {
  const client = getApiClient();
  const endpoint = buildEndpoint(namespace, route);
  const response = await client.get(endpoint, { params });

  // Handle different response formats
  // Some endpoints return { data: { items: [...] } }
  // Others return direct arrays or { data: [...] }
  if (response.data?.data?.items) {
    return response.data.data.items;
  } else if (response.data?.data) {
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  } else if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
};

/**
 * Fetch a single record by ID
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {number|string} id - Record ID
 * @returns {Promise<Object>} Record object
 */
export const fetchRecord = async (namespace, route, id) => {
  const client = getApiClient();
  const endpoint = buildEndpoint(namespace, route);
  const response = await client.get(`${endpoint}/${id}`);

  // Handle different response formats
  return response.data?.data || response.data || null;
};

/**
 * Create a new record
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {Object} data - Record data
 * @returns {Promise<Object>} Created record
 */
export const createRecord = async (namespace, route, data) => {
  const client = getApiClient();
  const endpoint = buildEndpoint(namespace, route);
  const response = await client.post(endpoint, data);

  return response.data?.data || response.data || null;
};

/**
 * Update an existing record
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {number|string} id - Record ID
 * @param {Object} data - Updated record data
 * @returns {Promise<Object>} Updated record
 */
export const updateRecord = async (namespace, route, id, data) => {
  const client = getApiClient();
  const endpoint = buildEndpoint(namespace, route);
  const response = await client.patch(`${endpoint}/${id}`, data);

  return response.data?.data || response.data || null;
};

/**
 * Delete a record
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {number|string} id - Record ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteRecord = async (namespace, route, id) => {
  const client = getApiClient();
  const endpoint = buildEndpoint(namespace, route);
  const response = await client.delete(`${endpoint}/${id}`);

  return response.data?.data || response.data || null;
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
