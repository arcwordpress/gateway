function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
import { getApiClient } from "./apiClient";

/**
 * View API - handles /gateway/v1/views routes
 */

/**
 * Fetch all registered views
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Array>} Array of view objects
 */
export var fetchViews = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var client = getApiClient();
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.get('gateway/v1/views', config);
    return response.data;
  });
  return function fetchViews() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Fetch a single view by key
 * @param {string} key - View key
 * @param {Object} options - Request options
 * @param {Object} options.auth - Optional auth override { username, password }
 * @returns {Promise<Object>} View object { key, renderType, columns, facets, defaultSort, perPage, collection }
 */
export var fetchView = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (key) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var client = getApiClient();
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.get("gateway/v1/views/".concat(key), config);
    return response.data;
  });
  return function fetchView(_x) {
    return _ref2.apply(this, arguments);
  };
}();
export default {
  fetchViews,
  fetchView
};