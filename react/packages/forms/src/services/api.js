import { collectionApi, getApiClient } from '@arcwp/gateway-data';

/**
 * Get all collections
 */
export const getCollections = async (options = {}) => {
  console.log('[Gateway API] getCollections options:', options);
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
  console.log('[Gateway API] getCollection options:', options);
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
  console.log('[Gateway API] getRecord options:', options);
  const client = getApiClient();
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.get(`${endpoint}/${id}`, config);
  return response.data?.data || response.data;
};

/**
 * Create a new record using the collection endpoint
 */
export const createRecord = async (endpoint, data, options = {}) => {
  console.log('[Gateway API] createRecord options:', options);
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
  console.log('[Gateway API] updateRecord options:', options);
  const client = getApiClient();
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.put(`${endpoint}/${id}`, data, config);
  return response.data?.data || response.data;
};
