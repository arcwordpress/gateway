import { getApiClient } from './apiClient';

/**
 * View API - handles /gateway/v1/views routes
 */

/**
 * Fetch all registered views
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Array>} Array of view objects
 */
export const fetchViews = async (options = {}) => {
  const client = getApiClient();
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.get('gateway/v1/views', config);
  return response.data;
};

/**
 * Fetch a single view by key
 * @param {string} key - View key
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} View object { key, renderType, columns, facetFilters, defaultSort, perPage, collection }
 */
export const fetchView = async (key, options = {}) => {
  const client = getApiClient();
  const config = {};
  if (options.auth) {
    config.auth = options.auth;
  }
  const response = await client.get(`gateway/v1/views/${key}`, config);
  return response.data;
};

export default {
  fetchViews,
  fetchView,
};
