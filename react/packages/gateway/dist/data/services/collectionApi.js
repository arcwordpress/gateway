function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
import { getApiClient } from "./apiClient";

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
export var fetchCollections = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var client = getApiClient();
    var config = {
      params
    };
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.get('gateway/v1/collections', config);
    return response.data;
  });
  return function fetchCollections() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Fetch a single collection by key
 * @param {string} key - Collection key
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} Collection object
 */
export var fetchCollection = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (key) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var client = getApiClient();
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.get("gateway/v1/collections/".concat(key), config);
    return response.data;
  });
  return function fetchCollection(_x) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Collection Records API - handles standard CRUD routes
 */

/**
 * Build full endpoint from namespace and route
 * @param {string} namespace - REST namespace (e.g., 'gateway/v1')
 * @param {string} route - Collection route (e.g., 'events')
 * @returns {string} Full endpoint path
 */
var buildEndpoint = (namespace, route) => {
  return "".concat(namespace, "/").concat(route);
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
export var fetchRecords = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (namespace, route) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var client = getApiClient();
    var endpoint = buildEndpoint(namespace, route);
    var config = {
      params
    };
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.get(endpoint, config);
    return response.data;
  });
  return function fetchRecords(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Fetch a single record by ID
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {number|string} id - Record ID
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} Record object
 */
export var fetchRecord = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (namespace, route, id) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var client = getApiClient();
    var endpoint = buildEndpoint(namespace, route);
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.get("".concat(endpoint, "/").concat(id), config);
    return response.data;
  });
  return function fetchRecord(_x4, _x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Create a new record
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {Object} data - Record data
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} Created record
 */
export var createRecord = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (namespace, route, data) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var client = getApiClient();
    var endpoint = buildEndpoint(namespace, route);
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.post(endpoint, data, config);
    return response.data;
  });
  return function createRecord(_x7, _x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}();

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
export var updateRecord = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(function* (namespace, route, id, data) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    var client = getApiClient();
    var endpoint = buildEndpoint(namespace, route);
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.patch("".concat(endpoint, "/").concat(id), data, config);
    return response.data;
  });
  return function updateRecord(_x0, _x1, _x10, _x11) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Delete a record
 * @param {string} namespace - REST namespace
 * @param {string} route - Collection route
 * @param {number|string} id - Record ID
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} Delete response
 */
export var deleteRecord = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator(function* (namespace, route, id) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var client = getApiClient();
    var endpoint = buildEndpoint(namespace, route);
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.delete("".concat(endpoint, "/").concat(id), config);
    return response.data;
  });
  return function deleteRecord(_x12, _x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}();
export default {
  fetchCollections,
  fetchCollection,
  fetchRecords,
  fetchRecord,
  createRecord,
  updateRecord,
  deleteRecord
};