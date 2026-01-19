// INTERNAL USE ONLY: These API helpers are not exported from the main package API.
// Consumers should use the Gateway Data Package (@arcwp/gateway-data) directly for data access.
import { collectionApi, getApiClient } from '@arcwp/gateway-data';

/**
 * Get all collections
 */
export const getCollections = async (options = {}) => {
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  return collectionApi.fetchCollections({}, config);
};

/**
 * Get a single collection by key
 */
export const getCollection = async (key, options = {}) => {
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  return collectionApi.fetchCollection(key, config);
};

/**
 * Get a single record by ID
 */
export const getRecord = async (endpoint, id, options = {}) => {
  const client = getApiClient();
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.get(`${endpoint}/${id}`, config);
  return response.data;
};

/**
 * Create a new record using the collection endpoint
 */
export const createRecord = async (endpoint, data, options = {}) => {
  const client = getApiClient();
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.post(endpoint, data, config);
  return response.data?.data || response.data;
};

/**
 * Update an existing record
 */
export const updateRecord = async (endpoint, id, data, options = {}) => {
  const client = getApiClient();
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.put(`${endpoint}/${id}`, data, config);
  return response.data?.data || response.data;
};
